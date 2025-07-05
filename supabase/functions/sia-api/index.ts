
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Always handle OPTIONS requests first
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log(`Incoming request: ${req.method} ${req.url}`)
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

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
        const { data, error } = await supabaseClient
          .from('m_rekening')
          .select('*')
          .order('kode_rek', { ascending: true })

        if (error) {
          console.error('Error fetching rekening:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log(`Found ${data?.length || 0} rekening records`)
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'POST') {
        const body = await req.json()
        console.log('Creating rekening with data:', body)
        
        const { data, error } = await supabaseClient
          .from('m_rekening')
          .insert(body)
          .select()

        if (error) {
          console.error('Error creating rekening:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Handle rekening update and delete with path parameters
    const rekeningMatch = path.match(/^\/rekening\/(.+)$/)
    if (rekeningMatch) {
      // Use decodeURIComponent twice to handle double encoding
      let kodeRek = decodeURIComponent(decodeURIComponent(rekeningMatch[1]))
      console.log(`Handling rekening operation for code: ${kodeRek}`)

      if (method === 'PUT') {
        try {
          console.log('Starting PUT operation for kode_rek:', kodeRek)
          
          const body = await req.json()
          console.log('Raw request body:', JSON.stringify(body, null, 2))
          
          // Clean up the data before updating - handle rek_induk properly
          const cleanedData = {
            ...body
          }
          
          // Handle rek_induk field properly - convert various null-like values to actual null
          if (body.rek_induk === null || body.rek_induk === '' || body.rek_induk === '-' || body.rek_induk === 'null' || body.rek_induk === undefined) {
            cleanedData.rek_induk = null
          }
          
          console.log('Cleaned data for update:', JSON.stringify(cleanedData, null, 2))
          
          const { data, error } = await supabaseClient
            .from('m_rekening')
            .update(cleanedData)
            .eq('kode_rek', kodeRek)
            .select()

          if (error) {
            console.error('Database error updating rekening:', error)
            return new Response(JSON.stringify({ 
              error: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          console.log('Successfully updated rekening:', data)
          return new Response(JSON.stringify({ data }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } catch (updateError) {
          console.error('Caught error during update:', updateError)
          return new Response(JSON.stringify({ 
            error: 'Update failed',
            message: updateError.message || 'Unknown error',
            stack: updateError.stack || 'No stack trace'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      if (method === 'DELETE') {
        try {
          console.log('Starting DELETE operation for kode_rek:', kodeRek)
          
          const { data, error } = await supabaseClient
            .from('m_rekening')
            .delete()
            .eq('kode_rek', kodeRek)
            .select()

          if (error) {
            console.error('Database error deleting rekening:', error)
            return new Response(JSON.stringify({ 
              error: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          console.log('Successfully deleted rekening:', data)
          return new Response(JSON.stringify({ data }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } catch (deleteError) {
          console.error('Caught error during delete:', deleteError)
          return new Response(JSON.stringify({ 
            error: 'Delete failed',
            message: deleteError.message || 'Unknown error',
            stack: deleteError.stack || 'No stack trace'
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
        
        let query = supabaseClient
          .from('anggaran')
          .select(`
            *,
            m_rekening:kode_rek (
              kode_rek,
              nama_rek,
              jenis_rek
            )
          `)
          .order('kode_rek', { ascending: true })

        if (tahun) {
          query = query.eq('tahun', parseInt(tahun))
        }

        const { data, error } = await query

        if (error) {
          console.error('Error fetching anggaran:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'POST') {
        const body = await req.json()
        const { data, error } = await supabaseClient
          .from('anggaran')
          .insert(body)
          .select()

        if (error) {
          console.error('Error creating anggaran:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ data }), {
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
        const { data, error } = await supabaseClient
          .from('anggaran')
          .update(body)
          .eq('kode_rek', kodeRek)
          .eq('tahun', tahun)
          .select()

        if (error) {
          console.error('Error updating anggaran:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'DELETE') {
        const { data, error } = await supabaseClient
          .from('anggaran')
          .delete()
          .eq('kode_rek', kodeRek)
          .eq('tahun', tahun)
          .select()

        if (error) {
          console.error('Error deleting anggaran:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Kas Masuk endpoints
    if (path === '/kas-masuk') {
      if (method === 'GET') {
        const startDate = url.searchParams.get('start_date')
        const endDate = url.searchParams.get('end_date')
        
        let query = supabaseClient
          .from('kasmasuk')
          .select(`
            *,
            m_rekening:kode_rek (
              kode_rek,
              nama_rek
            )
          `)
          .order('tanggal', { ascending: false })

        if (startDate) {
          query = query.gte('tanggal', startDate)
        }
        if (endDate) {
          query = query.lte('tanggal', endDate)
        }

        const { data, error } = await query

        if (error) {
          console.error('Error fetching kas masuk:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'POST') {
        const body = await req.json()
        const { data, error } = await supabaseClient
          .from('kasmasuk')
          .insert(body)
          .select()

        if (error) {
          console.error('Error creating kas masuk:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ data }), {
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
        const { data, error } = await supabaseClient
          .from('kasmasuk')
          .update(body)
          .eq('id_km', idKm)
          .select()

        if (error) {
          console.error('Error updating kas masuk:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'DELETE') {
        const { data, error } = await supabaseClient
          .from('kasmasuk')
          .delete()
          .eq('id_km', idKm)
          .select()

        if (error) {
          console.error('Error deleting kas masuk:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Kas Keluar endpoints
    if (path === '/kas-keluar') {
      if (method === 'GET') {
        const startDate = url.searchParams.get('start_date')
        const endDate = url.searchParams.get('end_date')
        
        let query = supabaseClient
          .from('kaskeluar')
          .select(`
            *,
            m_rekening:kode_rek (
              kode_rek,
              nama_rek
            )
          `)
          .order('tanggal', { ascending: false })

        if (startDate) {
          query = query.gte('tanggal', startDate)
        }
        if (endDate) {
          query = query.lte('tanggal', endDate)
        }

        const { data, error } = await query

        if (error) {
          console.error('Error fetching kas keluar:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'POST') {
        const body = await req.json()
        const { data, error } = await supabaseClient
          .from('kaskeluar')
          .insert(body)
          .select()

        if (error) {
          console.error('Error creating kas keluar:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ data }), {
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
        const { data, error } = await supabaseClient
          .from('kaskeluar')
          .update(body)
          .eq('id_kk', idKk)
          .select()

        if (error) {
          console.error('Error updating kas keluar:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'DELETE') {
        const { data, error } = await supabaseClient
          .from('kaskeluar')
          .delete()
          .eq('id_kk', idKk)
          .select()

        if (error) {
          console.error('Error deleting kas keluar:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Jurnal endpoints
    if (path === '/jurnal') {
      if (method === 'GET') {
        const startDate = url.searchParams.get('start_date')
        const endDate = url.searchParams.get('end_date')
        
        let query = supabaseClient
          .from('jurnalumum')
          .select(`
            *,
            jurnal_jenis:id_jj (
              id_jj,
              nm_jj
            ),
            jurnal (
              *,
              m_rekening:kode_rek (
                kode_rek,
                nama_rek
              )
            )
          `)
          .order('tanggal', { ascending: false })

        if (startDate) {
          query = query.gte('tanggal', startDate)
        }
        if (endDate) {
          query = query.lte('tanggal', endDate)
        }

        const { data, error } = await query

        if (error) {
          console.error('Error fetching jurnal:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'POST') {
        const body = await req.json()
        
        // Start transaction
        const { data: jurnalUmum, error: jurnalError } = await supabaseClient
          .from('jurnalumum')
          .insert({
            id_ju: body.id_ju,
            tanggal: body.tanggal,
            usernya: body.usernya,
            id_div: body.id_div,
            id_jj: body.id_jj
          })
          .select()

        if (jurnalError) {
          console.error('Error creating jurnal umum:', jurnalError)
          return new Response(JSON.stringify({ error: jurnalError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Insert jurnal entries
        const jurnalEntries = body.entries.map((entry: any) => ({
          ...entry,
          kode: body.id_ju,
          tanggal: body.tanggal,
          usernya: body.usernya
        }))

        const { data: entries, error: entriesError } = await supabaseClient
          .from('jurnal')
          .insert(jurnalEntries)
          .select()

        if (entriesError) {
          console.error('Error creating jurnal entries:', entriesError)
          return new Response(JSON.stringify({ error: entriesError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ data: { jurnal: jurnalUmum, entries } }), {
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
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack trace'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
