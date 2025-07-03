
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const method = req.method;

    console.log(`SIA API called: ${method} ${path}`);

    switch (path) {
      case 'master-rekening':
        return await handleMasterRekening(req, supabaseClient);
      case 'kas-masuk':
        return await handleKasMasuk(req, supabaseClient);
      case 'kas-keluar':
        return await handleKasKeluar(req, supabaseClient);
      case 'jurnal':
        return await handleJurnal(req, supabaseClient);
      case 'laporan':
        return await handleLaporan(req, supabaseClient);
      default:
        return new Response(
          JSON.stringify({ error: 'Endpoint not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Handle Master Rekening operations
async function handleMasterRekening(req: Request, supabase: any) {
  const method = req.method;

  switch (method) {
    case 'GET':
      const { data: accounts, error: getError } = await supabase
        .from('m_rekening')
        .select(`
          kode_rek,
          nama_rek,
          saldo,
          level,
          k_level,
          rek_induk,
          id_div,
          jenis_rek,
          created_at,
          updated_at
        `)
        .order('kode_rek');

      if (getError) throw getError;

      return new Response(
        JSON.stringify({ data: accounts }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    case 'POST':
      const accountData = await req.json();
      const { data: newAccount, error: postError } = await supabase
        .from('m_rekening')
        .insert([accountData])
        .select()
        .single();

      if (postError) throw postError;

      return new Response(
        JSON.stringify({ data: newAccount, message: 'Rekening berhasil ditambahkan' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    case 'PUT':
      const updateData = await req.json();
      const { kode_rek, ...updateFields } = updateData;
      
      const { data: updatedAccount, error: putError } = await supabase
        .from('m_rekening')
        .update(updateFields)
        .eq('kode_rek', kode_rek)
        .select()
        .single();

      if (putError) throw putError;

      return new Response(
        JSON.stringify({ data: updatedAccount, message: 'Rekening berhasil diupdate' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    case 'DELETE':
      const url = new URL(req.url);
      const kodeRek = url.searchParams.get('kode_rek');
      
      const { error: deleteError } = await supabase
        .from('m_rekening')
        .delete()
        .eq('kode_rek', kodeRek);

      if (deleteError) throw deleteError;

      return new Response(
        JSON.stringify({ message: 'Rekening berhasil dihapus' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
  }
}

// Handle Kas Masuk operations
async function handleKasMasuk(req: Request, supabase: any) {
  const method = req.method;

  switch (method) {
    case 'GET':
      const url = new URL(req.url);
      const startDate = url.searchParams.get('start_date');
      const endDate = url.searchParams.get('end_date');

      let query = supabase
        .from('kasmasuk')
        .select(`
          id_km,
          tanggal,
          kode_rek,
          total,
          keterangan,
          pembayar,
          no_cek,
          usernya,
          id_div,
          at_create,
          last_update,
          m_rekening!kasmasuk_kode_rek_fkey(kode_rek, nama_rek)
        `)
        .order('tanggal', { ascending: false });

      if (startDate && endDate) {
        query = query.gte('tanggal', startDate).lte('tanggal', endDate);
      }

      const { data: kasmasuk, error: getError } = await query;

      if (getError) throw getError;

      return new Response(
        JSON.stringify({ data: kasmasuk }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    case 'POST':
      const kasMasukData = await req.json();
      
      // Generate ID otomatis
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const { data: lastKM } = await supabase
        .from('kasmasuk')
        .select('id_km')
        .like('id_km', `KM${dateStr}%`)
        .order('id_km', { ascending: false })
        .limit(1);

      let newId = `KM${dateStr}001`;
      if (lastKM && lastKM.length > 0) {
        const lastNum = parseInt(lastKM[0].id_km.slice(-3));
        newId = `KM${dateStr}${String(lastNum + 1).padStart(3, '0')}`;
      }

      const dataToInsert = {
        ...kasMasukData,
        id_km: newId,
        tanggal: kasMasukData.tanggal || today.toISOString().split('T')[0]
      };

      const { data: newKasMasuk, error: postError } = await supabase
        .from('kasmasuk')
        .insert([dataToInsert])
        .select()
        .single();

      if (postError) throw postError;

      // Update saldo rekening (debit)
      const { error: saldoError } = await supabase.rpc('update_saldo_rekening', {
        p_kode_rek: kasMasukData.kode_rek,
        p_amount: kasMasukData.total,
        p_type: 'debit'
      });

      if (saldoError) console.log('Warning: Failed to update saldo:', saldoError);

      return new Response(
        JSON.stringify({ data: newKasMasuk, message: 'Kas masuk berhasil ditambahkan' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
  }
}

// Handle Kas Keluar operations
async function handleKasKeluar(req: Request, supabase: any) {
  const method = req.method;

  switch (method) {
    case 'GET':
      const url = new URL(req.url);
      const startDate = url.searchParams.get('start_date');
      const endDate = url.searchParams.get('end_date');

      let query = supabase
        .from('kaskeluar')
        .select(`
          id_kk,
          tanggal,
          bagian_seksi,
          kode_rek,
          total,
          keterangan,
          penerima,
          no_cek,
          usernya,
          id_div,
          at_create,
          last_update,
          m_rekening!kaskeluar_kode_rek_fkey(kode_rek, nama_rek)
        `)
        .order('tanggal', { ascending: false });

      if (startDate && endDate) {
        query = query.gte('tanggal', startDate).lte('tanggal', endDate);
      }

      const { data: kaskeluar, error: getError } = await query;

      if (getError) throw getError;

      return new Response(
        JSON.stringify({ data: kaskeluar }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    case 'POST':
      const kasKeluarData = await req.json();
      
      // Generate ID otomatis
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const { data: lastKK } = await supabase
        .from('kaskeluar')
        .select('id_kk')
        .like('id_kk', `KK${dateStr}%`)
        .order('id_kk', { ascending: false })
        .limit(1);

      let newId = `KK${dateStr}001`;
      if (lastKK && lastKK.length > 0) {
        const lastNum = parseInt(lastKK[0].id_kk.slice(-3));
        newId = `KK${dateStr}${String(lastNum + 1).padStart(3, '0')}`;
      }

      const dataToInsert = {
        ...kasKeluarData,
        id_kk: newId,
        tanggal: kasKeluarData.tanggal || today.toISOString().split('T')[0]
      };

      const { data: newKasKeluar, error: postError } = await supabase
        .from('kaskeluar')
        .insert([dataToInsert])
        .select()
        .single();

      if (postError) throw postError;

      // Update saldo rekening (kredit)
      const { error: saldoError } = await supabase.rpc('update_saldo_rekening', {
        p_kode_rek: kasKeluarData.kode_rek,
        p_amount: kasKeluarData.total,
        p_type: 'kredit'
      });

      if (saldoError) console.log('Warning: Failed to update saldo:', saldoError);

      return new Response(
        JSON.stringify({ data: newKasKeluar, message: 'Kas keluar berhasil ditambahkan' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
  }
}

// Handle Jurnal operations
async function handleJurnal(req: Request, supabase: any) {
  const method = req.method;

  switch (method) {
    case 'GET':
      const url = new URL(req.url);
      const startDate = url.searchParams.get('start_date');
      const endDate = url.searchParams.get('end_date');

      let query = supabase
        .from('jurnalumum')
        .select(`
          id_ju,
          tanggal,
          usernya,
          id_div,
          id_jj,
          at_create,
          last_update,
          is_mutasi,
          jurnal_jenis!jurnalumum_id_jj_fkey(id_jj, nm_jj),
          jurnal!jurnal_kode_fkey(
            kode_rek,
            deskripsi,
            debit,
            kredit,
            m_rekening!jurnal_kode_rek_fkey(kode_rek, nama_rek)
          )
        `)
        .order('tanggal', { ascending: false });

      if (startDate && endDate) {
        query = query.gte('tanggal', startDate).lte('tanggal', endDate);
      }

      const { data: jurnal, error: getError } = await query;

      if (getError) throw getError;

      return new Response(
        JSON.stringify({ data: jurnal }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    case 'POST':
      const jurnalData = await req.json();
      const { entries, ...headerData } = jurnalData;
      
      // Generate ID otomatis
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const { data: lastJU } = await supabase
        .from('jurnalumum')
        .select('id_ju')
        .like('id_ju', `JU${dateStr}%`)
        .order('id_ju', { ascending: false })
        .limit(1);

      let newId = `JU${dateStr}001`;
      if (lastJU && lastJU.length > 0) {
        const lastNum = parseInt(lastJU[0].id_ju.slice(-3));
        newId = `JU${dateStr}${String(lastNum + 1).padStart(3, '0')}`;
      }

      // Insert header jurnal
      const { data: newJurnal, error: headerError } = await supabase
        .from('jurnalumum')
        .insert([{
          ...headerData,
          id_ju: newId,
          tanggal: headerData.tanggal || today.toISOString().split('T')[0]
        }])
        .select()
        .single();

      if (headerError) throw headerError;

      // Insert detail jurnal
      const jurnalEntries = entries.map((entry: any) => ({
        ...entry,
        kode: newId,
        tanggal: headerData.tanggal || today.toISOString().split('T')[0]
      }));

      const { data: newEntries, error: entriesError } = await supabase
        .from('jurnal')
        .insert(jurnalEntries)
        .select();

      if (entriesError) throw entriesError;

      return new Response(
        JSON.stringify({ 
          data: { header: newJurnal, entries: newEntries }, 
          message: 'Jurnal berhasil ditambahkan' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    default:
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
  }
}

// Handle Laporan operations
async function handleLaporan(req: Request, supabase: any) {
  const method = req.method;
  
  if (method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const startDate = url.searchParams.get('start_date');
  const endDate = url.searchParams.get('end_date');

  switch (type) {
    case 'saldo-rekening':
      const { data: saldoData, error: saldoError } = await supabase
        .from('m_rekening')
        .select('kode_rek, nama_rek, saldo, jenis_rek')
        .order('kode_rek');

      if (saldoError) throw saldoError;

      return new Response(
        JSON.stringify({ data: saldoData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    case 'kas-harian':
      const kasHarianQuery = `
        WITH kas_masuk AS (
          SELECT tanggal, SUM(total) as masuk
          FROM kasmasuk 
          WHERE tanggal BETWEEN '${startDate}' AND '${endDate}'
          GROUP BY tanggal
        ),
        kas_keluar AS (
          SELECT tanggal, SUM(total) as keluar
          FROM kaskeluar 
          WHERE tanggal BETWEEN '${startDate}' AND '${endDate}'
          GROUP BY tanggal
        )
        SELECT 
          COALESCE(km.tanggal, kk.tanggal) as tanggal,
          COALESCE(km.masuk, 0) as kas_masuk,
          COALESCE(kk.keluar, 0) as kas_keluar,
          COALESCE(km.masuk, 0) - COALESCE(kk.keluar, 0) as selisih
        FROM kas_masuk km 
        FULL OUTER JOIN kas_keluar kk ON km.tanggal = kk.tanggal
        ORDER BY tanggal
      `;

      const { data: kasHarian, error: kasError } = await supabase.rpc('execute_query', {
        query: kasHarianQuery
      });

      if (kasError) throw kasError;

      return new Response(
        JSON.stringify({ data: kasHarian }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    default:
      return new Response(
        JSON.stringify({ error: 'Report type not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
  }
}
