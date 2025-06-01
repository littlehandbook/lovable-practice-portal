
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const url = new URL(req.url);
    const pathname = url.pathname;

    // POST /client-resources - Create resource
    if (req.method === 'POST' && !pathname.includes('/download')) {
      const formData = await req.formData();
      const clientId = formData.get('client_id') as string;
      const resourceType = formData.get('resource_type') as string;
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const url_value = formData.get('url') as string;
      const file = formData.get('file') as File;

      let filePath = null;
      let fileSize = null;
      let mimeType = null;

      if (resourceType === 'document' && file) {
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name}`;
        filePath = `resources/${filename}`;
        fileSize = file.size;
        mimeType = file.type;
      }

      const { data: resource, error } = await supabaseClient
        .from('tbl_client_resources')
        .insert({
          client_id: clientId,
          resource_type: resourceType,
          title,
          description,
          url: url_value,
          file_path: filePath,
          file_size: fileSize,
          mime_type: mimeType,
          created_by: user.id,
          updated_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating resource:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create resource' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify(resource), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /client-resources - List resources
    if (req.method === 'GET' && !pathname.includes('/download')) {
      const clientId = url.searchParams.get('client_id');
      
      let query = supabaseClient
        .from('tbl_client_resources')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data: resources, error } = await query;

      if (error) {
        console.error('Error fetching resources:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch resources' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify(resources || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /client-resources/download - Download resource
    if (req.method === 'GET' && pathname.includes('/download')) {
      const filePath = url.searchParams.get('file_path');
      
      if (!filePath) {
        return new Response(
          JSON.stringify({ error: 'File path required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Return placeholder for file download
      return new Response('Resource download not implemented yet', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      });
    }

    // DELETE /client-resources/:id - Delete resource
    if (req.method === 'DELETE') {
      const pathSegments = pathname.split('/').filter(Boolean);
      const resourceId = pathSegments[pathSegments.length - 1];

      const { error } = await supabaseClient
        .from('tbl_client_resources')
        .update({ is_active: false })
        .eq('id', resourceId);

      if (error) {
        console.error('Error deleting resource:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete resource' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Client resources service error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
