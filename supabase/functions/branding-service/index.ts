
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BrandingRequest {
  action: 'get' | 'upsert'
  tenant_id: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  practice_name?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { action, tenant_id, logo_url, primary_color, secondary_color, practice_name }: BrandingRequest = await req.json()

    console.log(`Branding service: ${action} operation for tenant:`, tenant_id)

    // Ensure tenant exists in registry
    const { error: tenantError } = await supabaseClient
      .from('tbl_tenant_registry')
      .upsert({
        tenant_id: tenant_id,
        practice_name: practice_name || 'Default Practice',
        status: 'active'
      }, {
        onConflict: 'tenant_id'
      })

    if (tenantError) {
      console.error('Error ensuring tenant exists:', tenantError)
      return new Response(
        JSON.stringify({ error: 'Failed to initialize tenant' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (action === 'get') {
      // Get branding data
      const { data: brandingData, error: brandingError } = await supabaseClient
        .from('tbl_branding')
        .select('logo_url, primary_color, secondary_color')
        .eq('tenant_id', tenant_id)
        .maybeSingle()

      if (brandingError) {
        console.error('Error fetching branding:', brandingError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch branding' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Get practice name from configurations
      const { data: configData, error: configError } = await supabaseClient
        .from('tbl_configurations')
        .select('value')
        .eq('tenant_id', tenant_id)
        .eq('key', 'practice_name')
        .maybeSingle()

      if (configError) {
        console.error('Error fetching practice name:', configError)
      }

      const result = {
        logo_url: brandingData?.logo_url || '',
        primary_color: brandingData?.primary_color || '#0f766e',
        secondary_color: brandingData?.secondary_color || '#14b8a6',
        practice_name: configData?.value || ''
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'upsert') {
      // Upsert branding data
      const { error: brandingError } = await supabaseClient
        .from('tbl_branding')
        .upsert({
          tenant_id: tenant_id,
          logo_url: logo_url || '',
          primary_color: primary_color || '#0f766e',
          secondary_color: secondary_color || '#14b8a6',
          created_by: user.id,
          updated_by: user.id
        }, {
          onConflict: 'tenant_id'
        })

      if (brandingError) {
        console.error('Error saving branding:', brandingError)
        return new Response(
          JSON.stringify({ error: `Failed to save branding: ${brandingError.message}` }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Upsert practice name in configurations if provided
      if (practice_name) {
        const { error: configError } = await supabaseClient
          .from('tbl_configurations')
          .upsert({
            tenant_id: tenant_id,
            key: 'practice_name',
            value: JSON.stringify(practice_name),
            type: 'dynamic',
            version: 1,
            updated_by: user.id
          }, {
            onConflict: 'tenant_id,key'
          })

        if (configError) {
          console.error('Error saving practice name:', configError)
          return new Response(
            JSON.stringify({ error: `Failed to save practice name: ${configError.message}` }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Branding service error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
