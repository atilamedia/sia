
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Always handle OPTIONS requests first
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let mysqlClient: Client | null = null;

  try {
    console.log(`Incoming request: ${req.method} ${req.url}`)
    
    // Initialize MySQL connection
    mysqlClient = await new Client().connect({
      hostname: Deno.env.get('MYSQL_HOST') ?? 'localhost',
      port: parseInt(Deno.env.get('MYSQL_PORT') ?? '3306'),
      username: Deno.env.get('MYSQL_USERNAME') ?? 'root',
      password: Deno.env.get('MYSQL_PASSWORD') ?? '',
      db: Deno.env.get('MYSQL_DATABASE') ?? ''
    })

    console.log('Connected to MySQL database')

    const url = new URL(req.url)
    let path = url.pathname
    
    // Remove various possible prefixes to normalize the path
    if (path.startsWith('/functions/v1/sia-api')) {
      path = path.replace('/functions/v1/sia-api', '')
    } else if (path.startsWith('/sia-api')) {
      path = path.replace('/sia-api', '')
    }
    
    // Ensure path starts with / if not empty
    if (path && !path.startsWith('/')) {
      path = '/' + path
    }
    
    // Handle empty path
    if (!path || path === '/') {
      path = '/'
    }
    
    const method = req.method

    console.log(`Processing ${method} ${path} from original ${url.pathname}`)

    // Handle root path
    if (path === '' || path === '/') {
      return new Response(JSON.stringify({ message: 'SIA API is running', timestamp: new Date().toISOString() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Rekening endpoints
    if (path === '/rekening') {
      console.log('Handling rekening endpoint')
      
      if (method === 'GET') {
        console.log('Fetching rekening data from m_rekening table')
        const result = await mysqlClient.execute('SELECT * FROM m_rekening ORDER BY kode_rek ASC')

        console.log(`Found ${result.rows?.length || 0} rekening records`)
        return new Response(JSON.stringify({ data: result.rows }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'POST') {
        const body = await req.json()
        console.log('Creating rekening with data:', body)
        
        const { kode_rek, nama_rek, saldo = 0, level = 0, k_level = 'Induk', jenis_rek = 'NERACA', rek_induk = null, id_div = '01' } = body

        await mysqlClient.execute(
          'INSERT INTO m_rekening (kode_rek, nama_rek, saldo, level, k_level, jenis_rek, rek_induk, id_div, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [kode_rek, nama_rek, saldo, level, k_level, jenis_rek, rek_induk, id_div]
        )

        const result = await mysqlClient.execute('SELECT * FROM m_rekening WHERE kode_rek = ?', [kode_rek])

        return new Response(JSON.stringify({ data: result.rows }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Handle rekening update and delete with path parameters
    const rekeningMatch = path.match(/^\/rekening\/(.+)$/)
    if (rekeningMatch) {
      // Decode the kode_rek parameter properly
      let kodeRek = rekeningMatch[1]
      
      // Handle URL encoding properly
      try {
        kodeRek = decodeURIComponent(kodeRek)
      } catch (e) {
        console.log('First decode failed, trying again:', e)
        // If first decode fails, use as is
      }
      
      console.log(`Handling rekening operation for code: "${kodeRek}"`)

      if (method === 'PUT') {
        try {
          console.log('Starting PUT operation for kode_rek:', kodeRek)
          
          const body = await req.json()
          console.log('Raw request body:', JSON.stringify(body, null, 2))
          
          // Handle rek_induk field properly - convert various null-like values to actual null
          let rekInduk = body.rek_induk
          if (rekInduk === null || rekInduk === '' || rekInduk === '-' || rekInduk === 'null' || rekInduk === undefined) {
            rekInduk = null
          }
          
          console.log('Cleaned data for update:', JSON.stringify(body, null, 2))
          
          await mysqlClient.execute(
            'UPDATE m_rekening SET nama_rek = ?, saldo = ?, level = ?, k_level = ?, jenis_rek = ?, rek_induk = ?, id_div = ?, updated_at = NOW() WHERE kode_rek = ?',
            [body.nama_rek, body.saldo, body.level, body.k_level, body.jenis_rek, rekInduk, body.id_div, kodeRek]
          )

          const result = await mysqlClient.execute('SELECT * FROM m_rekening WHERE kode_rek = ?', [kodeRek])

          if (!result.rows || result.rows.length === 0) {
            console.log('No rows were updated, kode_rek might not exist:', kodeRek)
            return new Response(JSON.stringify({ 
              error: 'Record not found',
              message: `No record found with kode_rek: ${kodeRek}`
            }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          console.log('Successfully updated rekening:', result.rows)
          return new Response(JSON.stringify({ data: result.rows }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } catch (updateError) {
          console.error('Caught error during update:', updateError)
          const errorMessage = updateError instanceof Error ? updateError.message : 'Unknown error'
          const errorStack = updateError instanceof Error ? updateError.stack : 'No stack trace'
          return new Response(JSON.stringify({ 
            error: 'Update failed',
            message: errorMessage,
            stack: errorStack || 'No stack trace'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      if (method === 'DELETE') {
        try {
          console.log('Starting DELETE operation for kode_rek:', kodeRek)
          
          const result = await mysqlClient.execute('SELECT * FROM m_rekening WHERE kode_rek = ?', [kodeRek])
          
          if (!result.rows || result.rows.length === 0) {
            console.log('No rows found to delete, kode_rek might not exist:', kodeRek)
            return new Response(JSON.stringify({ 
              error: 'Record not found',
              message: `No record found with kode_rek: ${kodeRek}`
            }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          await mysqlClient.execute('DELETE FROM m_rekening WHERE kode_rek = ?', [kodeRek])

          console.log('Successfully deleted rekening:', result.rows)
          return new Response(JSON.stringify({ data: result.rows }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } catch (deleteError) {
          console.error('Caught error during delete:', deleteError)
          const errorMessage = deleteError instanceof Error ? deleteError.message : 'Unknown error'
          const errorStack = deleteError instanceof Error ? deleteError.stack : 'No stack trace'
          return new Response(JSON.stringify({ 
            error: 'Delete failed',
            message: errorMessage,
            stack: errorStack || 'No stack trace'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }
    }

    // Anggaran endpoints
    if (path === '/anggaran') {
      if (method === 'GET') {
        const tahun = url.searchParams.get('tahun')
        
        let query = `
          SELECT a.*, m.kode_rek, m.nama_rek, m.jenis_rek 
          FROM anggaran a 
          LEFT JOIN m_rekening m ON a.kode_rek = m.kode_rek 
          ORDER BY a.kode_rek ASC
        `
        let params: any[] = []

        if (tahun) {
          query = `
            SELECT a.*, m.kode_rek, m.nama_rek, m.jenis_rek 
            FROM anggaran a 
            LEFT JOIN m_rekening m ON a.kode_rek = m.kode_rek 
            WHERE a.tahun = ?
            ORDER BY a.kode_rek ASC
          `
          params = [parseInt(tahun)]
        }

        const result = await mysqlClient.execute(query, params)

        // Transform result to match Supabase structure
        const transformedData = result.rows?.map((row: any) => ({
          ...row,
          m_rekening: {
            kode_rek: row.kode_rek,
            nama_rek: row.nama_rek,
            jenis_rek: row.jenis_rek
          }
        }))

        return new Response(JSON.stringify({ data: transformedData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'POST') {
        const body = await req.json()
        const { kode_rek, tahun, total = 0, validasi_realisasi = 'Y', tanda = 'N', usernya = '' } = body

        await mysqlClient.execute(
          'INSERT INTO anggaran (kode_rek, tahun, total, validasi_realisasi, tanda, usernya, at_create, last_update) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [kode_rek, tahun, total, validasi_realisasi, tanda, usernya]
        )

        const result = await mysqlClient.execute('SELECT * FROM anggaran WHERE kode_rek = ? AND tahun = ?', [kode_rek, tahun])

        return new Response(JSON.stringify({ data: result.rows }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Handle anggaran update and delete with path parameters
    const anggaranMatch = path.match(/^\/anggaran\/([^\/]+)\/(\d+)$/)
    if (anggaranMatch) {
      const kodeRek = anggaranMatch[1]
      const tahun = parseInt(anggaranMatch[2])

      if (method === 'PUT') {
        const body = await req.json()
        
        await mysqlClient.execute(
          'UPDATE anggaran SET total = ?, validasi_realisasi = ?, tanda = ?, usernya = ?, last_update = NOW() WHERE kode_rek = ? AND tahun = ?',
          [body.total, body.validasi_realisasi, body.tanda, body.usernya, kodeRek, tahun]
        )

        const result = await mysqlClient.execute('SELECT * FROM anggaran WHERE kode_rek = ? AND tahun = ?', [kodeRek, tahun])

        return new Response(JSON.stringify({ data: result.rows }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'DELETE') {
        const result = await mysqlClient.execute('SELECT * FROM anggaran WHERE kode_rek = ? AND tahun = ?', [kodeRek, tahun])
        
        await mysqlClient.execute('DELETE FROM anggaran WHERE kode_rek = ? AND tahun = ?', [kodeRek, tahun])

        return new Response(JSON.stringify({ data: result.rows }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Kas Masuk endpoints
    if (path === '/kas-masuk') {
      if (method === 'GET') {
        const startDate = url.searchParams.get('start_date')
        const endDate = url.searchParams.get('end_date')
        
        let query = `
          SELECT k.*, m.kode_rek, m.nama_rek 
          FROM kasmasuk k 
          LEFT JOIN m_rekening m ON k.kode_rek = m.kode_rek 
          ORDER BY k.tanggal DESC
        `
        let params: any[] = []

        if (startDate && endDate) {
          query = `
            SELECT k.*, m.kode_rek, m.nama_rek 
            FROM kasmasuk k 
            LEFT JOIN m_rekening m ON k.kode_rek = m.kode_rek 
            WHERE k.tanggal >= ? AND k.tanggal <= ?
            ORDER BY k.tanggal DESC
          `
          params = [startDate, endDate]
        } else if (startDate) {
          query = `
            SELECT k.*, m.kode_rek, m.nama_rek 
            FROM kasmasuk k 
            LEFT JOIN m_rekening m ON k.kode_rek = m.kode_rek 
            WHERE k.tanggal >= ?
            ORDER BY k.tanggal DESC
          `
          params = [startDate]
        } else if (endDate) {
          query = `
            SELECT k.*, m.kode_rek, m.nama_rek 
            FROM kasmasuk k 
            LEFT JOIN m_rekening m ON k.kode_rek = m.kode_rek 
            WHERE k.tanggal <= ?
            ORDER BY k.tanggal DESC
          `
          params = [endDate]
        }

        const result = await mysqlClient.execute(query, params)

        // Transform result to match Supabase structure
        const transformedData = result.rows?.map((row: any) => ({
          ...row,
          m_rekening: {
            kode_rek: row.kode_rek,
            nama_rek: row.nama_rek
          }
        }))

        return new Response(JSON.stringify({ data: transformedData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'POST') {
        const body = await req.json()
        const { id_km, tanggal, kode_rek, total = 0, keterangan = '', pembayar = '', no_cek = '', usernya = '', id_div = '01', mark_cetak = 0 } = body

        await mysqlClient.execute(
          'INSERT INTO kasmasuk (id_km, tanggal, kode_rek, total, keterangan, pembayar, no_cek, usernya, id_div, mark_cetak, at_create, last_update) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [id_km, tanggal, kode_rek, total, keterangan, pembayar, no_cek, usernya, id_div, mark_cetak]
        )

        const result = await mysqlClient.execute('SELECT * FROM kasmasuk WHERE id_km = ?', [id_km])

        return new Response(JSON.stringify({ data: result.rows }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Handle kas masuk update and delete with path parameters
    const kasMasukMatch = path.match(/^\/kas-masuk\/(.+)$/)
    if (kasMasukMatch) {
      const idKm = kasMasukMatch[1]

      if (method === 'PUT') {
        const body = await req.json()
        
        await mysqlClient.execute(
          'UPDATE kasmasuk SET tanggal = ?, kode_rek = ?, total = ?, keterangan = ?, pembayar = ?, no_cek = ?, usernya = ?, id_div = ?, mark_cetak = ?, last_update = NOW() WHERE id_km = ?',
          [body.tanggal, body.kode_rek, body.total, body.keterangan, body.pembayar, body.no_cek, body.usernya, body.id_div, body.mark_cetak, idKm]
        )

        const result = await mysqlClient.execute('SELECT * FROM kasmasuk WHERE id_km = ?', [idKm])

        return new Response(JSON.stringify({ data: result.rows }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'DELETE') {
        const result = await mysqlClient.execute('SELECT * FROM kasmasuk WHERE id_km = ?', [idKm])
        
        await mysqlClient.execute('DELETE FROM kasmasuk WHERE id_km = ?', [idKm])

        return new Response(JSON.stringify({ data: result.rows }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Kas Keluar endpoints
    if (path === '/kas-keluar') {
      if (method === 'GET') {
        const startDate = url.searchParams.get('start_date')
        const endDate = url.searchParams.get('end_date')
        
        let query = `
          SELECT k.*, m.kode_rek, m.nama_rek 
          FROM kaskeluar k 
          LEFT JOIN m_rekening m ON k.kode_rek = m.kode_rek 
          ORDER BY k.tanggal DESC
        `
        let params: any[] = []

        if (startDate && endDate) {
          query = `
            SELECT k.*, m.kode_rek, m.nama_rek 
            FROM kaskeluar k 
            LEFT JOIN m_rekening m ON k.kode_rek = m.kode_rek 
            WHERE k.tanggal >= ? AND k.tanggal <= ?
            ORDER BY k.tanggal DESC
          `
          params = [startDate, endDate]
        } else if (startDate) {
          query = `
            SELECT k.*, m.kode_rek, m.nama_rek 
            FROM kaskeluar k 
            LEFT JOIN m_rekening m ON k.kode_rek = m.kode_rek 
            WHERE k.tanggal >= ?
            ORDER BY k.tanggal DESC
          `
          params = [startDate]
        } else if (endDate) {
          query = `
            SELECT k.*, m.kode_rek, m.nama_rek 
            FROM kaskeluar k 
            LEFT JOIN m_rekening m ON k.kode_rek = m.kode_rek 
            WHERE k.tanggal <= ?
            ORDER BY k.tanggal DESC
          `
          params = [endDate]
        }

        const result = await mysqlClient.execute(query, params)

        // Transform result to match Supabase structure
        const transformedData = result.rows?.map((row: any) => ({
          ...row,
          m_rekening: {
            kode_rek: row.kode_rek,
            nama_rek: row.nama_rek
          }
        }))

        return new Response(JSON.stringify({ data: transformedData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'POST') {
        const body = await req.json()
        const { id_kk, tanggal, kode_rek, total = 0, keterangan = '', penerima = '', no_cek = '', bagian_seksi = '', usernya = '', id_div = '01', mark_cetak = 0 } = body

        await mysqlClient.execute(
          'INSERT INTO kaskeluar (id_kk, tanggal, kode_rek, total, keterangan, penerima, no_cek, bagian_seksi, usernya, id_div, mark_cetak, at_create, last_update) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [id_kk, tanggal, kode_rek, total, keterangan, penerima, no_cek, bagian_seksi, usernya, id_div, mark_cetak]
        )

        const result = await mysqlClient.execute('SELECT * FROM kaskeluar WHERE id_kk = ?', [id_kk])

        return new Response(JSON.stringify({ data: result.rows }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Handle kas keluar update and delete with path parameters
    const kasKeluarMatch = path.match(/^\/kas-keluar\/(.+)$/)
    if (kasKeluarMatch) {
      const idKk = kasKeluarMatch[1]

      if (method === 'PUT') {
        const body = await req.json()
        
        await mysqlClient.execute(
          'UPDATE kaskeluar SET tanggal = ?, kode_rek = ?, total = ?, keterangan = ?, penerima = ?, no_cek = ?, bagian_seksi = ?, usernya = ?, id_div = ?, mark_cetak = ?, last_update = NOW() WHERE id_kk = ?',
          [body.tanggal, body.kode_rek, body.total, body.keterangan, body.penerima, body.no_cek, body.bagian_seksi, body.usernya, body.id_div, body.mark_cetak, idKk]
        )

        const result = await mysqlClient.execute('SELECT * FROM kaskeluar WHERE id_kk = ?', [idKk])

        return new Response(JSON.stringify({ data: result.rows }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'DELETE') {
        const result = await mysqlClient.execute('SELECT * FROM kaskeluar WHERE id_kk = ?', [idKk])
        
        await mysqlClient.execute('DELETE FROM kaskeluar WHERE id_kk = ?', [idKk])

        return new Response(JSON.stringify({ data: result.rows }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Jurnal endpoints
    if (path === '/jurnal') {
      if (method === 'GET') {
        const startDate = url.searchParams.get('start_date')
        const endDate = url.searchParams.get('end_date')
        
        let query = `
          SELECT ju.*, jj.id_jj, jj.nm_jj,
                 j.kode AS jurnal_kode, j.kode_rek, j.deskripsi AS jurnal_deskripsi, 
                 j.debit, j.kredit, j.tanda_lo, j.tanggal AS jurnal_tanggal,
                 m.kode_rek AS m_kode_rek, m.nama_rek
          FROM jurnalumum ju 
          LEFT JOIN jurnal_jenis jj ON ju.id_jj = jj.id_jj
          LEFT JOIN jurnal j ON ju.id_ju = j.kode
          LEFT JOIN m_rekening m ON j.kode_rek = m.kode_rek
          ORDER BY ju.tanggal DESC
        `
        let params: any[] = []

        if (startDate && endDate) {
          query = `
            SELECT ju.*, jj.id_jj, jj.nm_jj,
                   j.kode AS jurnal_kode, j.kode_rek, j.deskripsi AS jurnal_deskripsi, 
                   j.debit, j.kredit, j.tanda_lo, j.tanggal AS jurnal_tanggal,
                   m.kode_rek AS m_kode_rek, m.nama_rek
            FROM jurnalumum ju 
            LEFT JOIN jurnal_jenis jj ON ju.id_jj = jj.id_jj
            LEFT JOIN jurnal j ON ju.id_ju = j.kode
            LEFT JOIN m_rekening m ON j.kode_rek = m.kode_rek
            WHERE ju.tanggal >= ? AND ju.tanggal <= ?
            ORDER BY ju.tanggal DESC
          `
          params = [startDate, endDate]
        } else if (startDate) {
          query = `
            SELECT ju.*, jj.id_jj, jj.nm_jj,
                   j.kode AS jurnal_kode, j.kode_rek, j.deskripsi AS jurnal_deskripsi, 
                   j.debit, j.kredit, j.tanda_lo, j.tanggal AS jurnal_tanggal,
                   m.kode_rek AS m_kode_rek, m.nama_rek
            FROM jurnalumum ju 
            LEFT JOIN jurnal_jenis jj ON ju.id_jj = jj.id_jj
            LEFT JOIN jurnal j ON ju.id_ju = j.kode
            LEFT JOIN m_rekening m ON j.kode_rek = m.kode_rek
            WHERE ju.tanggal >= ?
            ORDER BY ju.tanggal DESC
          `
          params = [startDate]
        } else if (endDate) {
          query = `
            SELECT ju.*, jj.id_jj, jj.nm_jj,
                   j.kode AS jurnal_kode, j.kode_rek, j.deskripsi AS jurnal_deskripsi, 
                   j.debit, j.kredit, j.tanda_lo, j.tanggal AS jurnal_tanggal,
                   m.kode_rek AS m_kode_rek, m.nama_rek
            FROM jurnalumum ju 
            LEFT JOIN jurnal_jenis jj ON ju.id_jj = jj.id_jj
            LEFT JOIN jurnal j ON ju.id_ju = j.kode
            LEFT JOIN m_rekening m ON j.kode_rek = m.kode_rek
            WHERE ju.tanggal <= ?
            ORDER BY ju.tanggal DESC
          `
          params = [endDate]
        }

        const result = await mysqlClient.execute(query, params)

        // Transform result to match Supabase structure - group jurnal entries by jurnalumum
        const groupedData: any = {}
        result.rows?.forEach((row: any) => {
          if (!groupedData[row.id_ju]) {
            groupedData[row.id_ju] = {
              id_ju: row.id_ju,
              tanggal: row.tanggal,
              usernya: row.usernya,
              id_div: row.id_div,
              id_jj: row.id_jj,
              mark_cetak: row.mark_cetak,
              is_mutasi: row.is_mutasi,
              at_create: row.at_create,
              last_update: row.last_update,
              jurnal_jenis: {
                id_jj: row.id_jj,
                nm_jj: row.nm_jj
              },
              jurnal: []
            }
          }
          
          if (row.jurnal_kode) {
            groupedData[row.id_ju].jurnal.push({
              kode: row.jurnal_kode,
              kode_rek: row.kode_rek,
              deskripsi: row.jurnal_deskripsi,
              debit: row.debit,
              kredit: row.kredit,
              tanda_lo: row.tanda_lo,
              tanggal: row.jurnal_tanggal,
              m_rekening: {
                kode_rek: row.m_kode_rek,
                nama_rek: row.nama_rek
              }
            })
          }
        })

        const transformedData = Object.values(groupedData)

        return new Response(JSON.stringify({ data: transformedData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'POST') {
        const body = await req.json()
        
        // Start transaction - Insert jurnalumum first
        await mysqlClient.execute(
          'INSERT INTO jurnalumum (id_ju, tanggal, usernya, id_div, id_jj, at_create, last_update) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
          [body.id_ju, body.tanggal, body.usernya, body.id_div, body.id_jj]
        )

        const jurnalUmumResult = await mysqlClient.execute('SELECT * FROM jurnalumum WHERE id_ju = ?', [body.id_ju])

        // Insert jurnal entries
        const insertPromises = body.entries.map((entry: any) => {
          if (!mysqlClient) {
            throw new Error('Database connection not available')
          }
          return mysqlClient.execute(
            'INSERT INTO jurnal (kode, kode_rek, deskripsi, debit, kredit, tanda_lo, tanggal, usernya, at_create) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            [body.id_ju, entry.kode_rek, entry.deskripsi, entry.debit || 0, entry.kredit || 0, entry.tanda_lo || 'N', body.tanggal, body.usernya]
          )
        })

        await Promise.all(insertPromises)

        const entriesResult = await mysqlClient.execute('SELECT * FROM jurnal WHERE kode = ?', [body.id_ju])

        return new Response(JSON.stringify({ data: { jurnal: jurnalUmumResult.rows, entries: entriesResult.rows } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Return 404 for unknown endpoints
    console.log(`Unknown endpoint: ${path}, original: ${url.pathname}`)
    return new Response(JSON.stringify({ error: 'Endpoint not found', path, originalPath: url.pathname }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Unhandled error in edge function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: errorMessage,
      stack: errorStack || 'No stack trace'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } finally {
    // Close MySQL connection
    if (mysqlClient) {
      try {
        await mysqlClient.close()
        console.log('MySQL connection closed')
      } catch (closeError) {
        console.error('Error closing MySQL connection:', closeError)
      }
    }
  }
})