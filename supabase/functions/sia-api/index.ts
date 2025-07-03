import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client without requiring authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Using service role key for admin access
    )

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const method = req.method;

    console.log(`SIA API called: ${method} ${path}`);

    switch (path) {
      case 'master-rekening':
        return await handleMasterRekening(req, supabaseClient);
      case 'jurnal-jenis':
        return await handleJurnalJenis(req, supabaseClient);
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

      if (getError) {
        console.error('Database error:', getError);
        throw getError;
      }

      return new Response(
        JSON.stringify({ data: accounts || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    case 'POST':
      const accountData = await req.json();
      const { data: newAccount, error: postError } = await supabase
        .from('m_rekening')
        .insert([accountData])
        .select()
        .single();

      if (postError) {
        console.error('Insert error:', postError);
        throw postError;
      }

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

      if (putError) {
        console.error('Update error:', putError);
        throw putError;
      }

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

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

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

// Handle Jurnal Jenis operations
async function handleJurnalJenis(req: Request, supabase: any) {
  const method = req.method;

  switch (method) {
    case 'GET':
      const { data: jurnalJenis, error: getError } = await supabase
        .from('jurnal_jenis')
        .select(`
          id_jj,
          nm_jj,
          is_default,
          created_at
        `)
        .order('id_jj');

      if (getError) {
        console.error('Database error:', getError);
        throw getError;
      }

      return new Response(
        JSON.stringify({ data: jurnalJenis || [] }),
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

      // Get kas masuk data first
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
          last_update
        `)
        .order('tanggal', { ascending: false });

      if (startDate && endDate) {
        query = query.gte('tanggal', startDate).lte('tanggal', endDate);
      }

      const { data: kasmasuk, error: getError } = await query;

      if (getError) {
        console.error('Kas masuk fetch error:', getError);
        throw getError;
      }

      // Get rekening data separately and merge
      const rekeningCodes = [...new Set(kasmasuk?.map(item => item.kode_rek) || [])];
      
      let enrichedData = kasmasuk || [];
      
      if (rekeningCodes.length > 0) {
        const { data: rekeningData } = await supabase
          .from('m_rekening')
          .select('kode_rek, nama_rek')
          .in('kode_rek', rekeningCodes);

        // Merge rekening data
        enrichedData = kasmasuk?.map(item => ({
          ...item,
          m_rekening: rekeningData?.find(rek => rek.kode_rek === item.kode_rek) || null
        })) || [];
      }

      return new Response(
        JSON.stringify({ data: enrichedData }),
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

      if (postError) {
        console.error('Kas masuk insert error:', postError);
        throw postError;
      }

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

      // Get kas keluar data first
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
          last_update
        `)
        .order('tanggal', { ascending: false });

      if (startDate && endDate) {
        query = query.gte('tanggal', startDate).lte('tanggal', endDate);
      }

      const { data: kaskeluar, error: getError } = await query;

      if (getError) {
        console.error('Kas keluar fetch error:', getError);
        throw getError;
      }

      // Get rekening data separately and merge
      const rekeningCodes = [...new Set(kaskeluar?.map(item => item.kode_rek) || [])];
      
      let enrichedData = kaskeluar || [];
      
      if (rekeningCodes.length > 0) {
        const { data: rekeningData } = await supabase
          .from('m_rekening')
          .select('kode_rek, nama_rek')
          .in('kode_rek', rekeningCodes);

        // Merge rekening data
        enrichedData = kaskeluar?.map(item => ({
          ...item,
          m_rekening: rekeningData?.find(rek => rek.kode_rek === item.kode_rek) || null
        })) || [];
      }

      return new Response(
        JSON.stringify({ data: enrichedData }),
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

      if (postError) {
        console.error('Kas keluar insert error:', postError);
        throw postError;
      }

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

      // Get jurnal umum data first
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
          is_mutasi
        `)
        .order('tanggal', { ascending: false });

      if (startDate && endDate) {
        query = query.gte('tanggal', startDate).lte('tanggal', endDate);
      }

      const { data: jurnalumum, error: getError } = await query;

      if (getError) {
        console.error('Jurnal fetch error:', getError);
        throw getError;
      }

      // Get jurnal jenis data separately
      const jenisIds = [...new Set(jurnalumum?.map(item => item.id_jj) || [])];
      let jenisData = [];
      
      if (jenisIds.length > 0) {
        const { data: jenisResult } = await supabase
          .from('jurnal_jenis')
          .select('id_jj, nm_jj')
          .in('id_jj', jenisIds);
        jenisData = jenisResult || [];
      }

      // Get jurnal detail data separately
      const jurnalIds = jurnalumum?.map(item => item.id_ju) || [];
      let detailData = [];
      let rekeningDetailData = [];
      
      if (jurnalIds.length > 0) {
        const { data: detailResult } = await supabase
          .from('jurnal')
          .select('kode, kode_rek, deskripsi, debit, kredit')
          .in('kode', jurnalIds);
        detailData = detailResult || [];

        // Get rekening data for detail
        const detailRekeningCodes = [...new Set(detailData.map(item => item.kode_rek))];
        if (detailRekeningCodes.length > 0) {
          const { data: rekeningResult } = await supabase
            .from('m_rekening')
            .select('kode_rek, nama_rek')
            .in('kode_rek', detailRekeningCodes);
          rekeningDetailData = rekeningResult || [];
        }
      }

      // Merge all data
      const enrichedData = jurnalumum?.map(item => ({
        ...item,
        jurnal_jenis: jenisData.find(jenis => jenis.id_jj === item.id_jj) || null,
        jurnal: detailData
          .filter(detail => detail.kode === item.id_ju)
          .map(detail => ({
            ...detail,
            m_rekening: rekeningDetailData.find(rek => rek.kode_rek === detail.kode_rek) || null
          }))
      })) || [];

      return new Response(
        JSON.stringify({ data: enrichedData }),
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

      if (headerError) {
        console.error('Jurnal header insert error:', headerError);
        throw headerError;
      }

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

      if (entriesError) {
        console.error('Jurnal entries insert error:', entriesError);
        throw entriesError;
      }

      return new Response(
        JSON.stringify({ 
          data: { header: newJurnal, entries: newEntries }, 
          message: 'Jurnal berhasil ditambahkan' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    case 'PUT':
      const updateData = await req.json();
      const { id_ju, entries: updateEntries, ...updateHeaderData } = updateData;
      
      // Update header jurnal
      const { data: updatedHeader, error: updateHeaderError } = await supabase
        .from('jurnalumum')
        .update({
          ...updateHeaderData,
          last_update: new Date().toISOString()
        })
        .eq('id_ju', id_ju)
        .select()
        .single();

      if (updateHeaderError) {
        console.error('Jurnal header update error:', updateHeaderError);
        throw updateHeaderError;
      }

      // Delete existing entries and insert new ones
      const { error: deleteEntriesError } = await supabase
        .from('jurnal')
        .delete()
        .eq('kode', id_ju);

      if (deleteEntriesError) {
        console.error('Jurnal entries delete error:', deleteEntriesError);
        throw deleteEntriesError;
      }

      // Insert updated entries
      const updatedJurnalEntries = updateEntries.map((entry: any) => ({
        ...entry,
        kode: id_ju,
        tanggal: updateHeaderData.tanggal || updatedHeader.tanggal
      }));

      const { data: updatedEntries, error: insertEntriesError } = await supabase
        .from('jurnal')
        .insert(updatedJurnalEntries)
        .select();

      if (insertEntriesError) {
        console.error('Jurnal entries insert error:', insertEntriesError);
        throw insertEntriesError;
      }

      return new Response(
        JSON.stringify({ 
          data: { header: updatedHeader, entries: updatedEntries }, 
          message: 'Jurnal berhasil diupdate' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    case 'DELETE':
      const deleteUrl = new URL(req.url);
      const jurnalId = deleteUrl.searchParams.get('id_ju');
      
      if (!jurnalId) {
        return new Response(
          JSON.stringify({ error: 'ID jurnal diperlukan' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Delete entries first (due to foreign key constraint)
      const { error: deleteEntriesErr } = await supabase
        .from('jurnal')
        .delete()
        .eq('kode', jurnalId);

      if (deleteEntriesErr) {
        console.error('Delete jurnal entries error:', deleteEntriesErr);
        throw deleteEntriesErr;
      }

      // Delete header
      const { error: deleteHeaderErr } = await supabase
        .from('jurnalumum')
        .delete()
        .eq('id_ju', jurnalId);

      if (deleteHeaderErr) {
        console.error('Delete jurnal header error:', deleteHeaderErr);
        throw deleteHeaderErr;
      }

      return new Response(
        JSON.stringify({ message: 'Jurnal berhasil dihapus' }),
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

  try {
    switch (type) {
      case 'saldo-rekening':
        const { data: saldoData, error: saldoError } = await supabase
          .from('m_rekening')
          .select('kode_rek, nama_rek, saldo, jenis_rek')
          .order('kode_rek');

        if (saldoError) {
          console.error('Saldo rekening fetch error:', saldoError);
          throw saldoError;
        }

        return new Response(
          JSON.stringify({ data: saldoData || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'kas-harian':
        // Simple cash flow report without complex RPC
        const { data: kasMasukData } = await supabase
          .from('kasmasuk')
          .select('tanggal, total')
          .gte('tanggal', startDate || '2024-01-01')
          .lte('tanggal', endDate || '2024-12-31');

        const { data: kasKeluarData } = await supabase
          .from('kaskeluar')
          .select('tanggal, total')
          .gte('tanggal', startDate || '2024-01-01')
          .lte('tanggal', endDate || '2024-12-31');

        // Aggregate data by date
        const dailyCashFlow = {};
        
        kasMasukData?.forEach(item => {
          if (!dailyCashFlow[item.tanggal]) {
            dailyCashFlow[item.tanggal] = { tanggal: item.tanggal, kas_masuk: 0, kas_keluar: 0, selisih: 0 };
          }
          dailyCashFlow[item.tanggal].kas_masuk += item.total || 0;
        });

        kasKeluarData?.forEach(item => {
          if (!dailyCashFlow[item.tanggal]) {
            dailyCashFlow[item.tanggal] = { tanggal: item.tanggal, kas_masuk: 0, kas_keluar: 0, selisih: 0 };
          }
          dailyCashFlow[item.tanggal].kas_keluar += item.total || 0;
        });

        // Calculate selisih
        Object.values(dailyCashFlow).forEach((item: any) => {
          item.selisih = item.kas_masuk - item.kas_keluar;
        });

        const sortedData = Object.values(dailyCashFlow).sort((a: any, b: any) => a.tanggal.localeCompare(b.tanggal));

        return new Response(
          JSON.stringify({ data: sortedData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Report type not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Laporan error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
