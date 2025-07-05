
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const path = url.pathname.replace('/functions/v1/sia-api', '')
    const method = req.method

    console.log(`${method} ${path}`)

    // Rekening endpoints
    if (path === '/rekening') {
      if (method === 'GET') {
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

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (method === 'POST') {
        const body = await req.json()
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
      const kodeRek = rekeningMatch[1]

      if (method === 'PUT') {
        const body = await req.json()
        const { data, error } = await supabaseClient
          .from('m_rekening')
          .update(body)
          .eq('kode_rek', kodeRek)
          .select()

        if (error) {
          console.error('Error updating rekening:', error)
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
          .from('m_rekening')
          .delete()
          .eq('kode_rek', kodeRek)
          .select()

        if (error) {
          console.error('Error deleting rekening:', error)
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

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Unhandled error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
