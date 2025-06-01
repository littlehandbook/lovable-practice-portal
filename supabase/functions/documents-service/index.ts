
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

    // POST /documents/upload - Upload document
    if (req.method === 'POST' && pathname.includes('/upload')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const clientId = formData.get('client_id') as string;
      const documentType = formData.get('document_type') as string || 'client_upload';

      if (!file) {
        return new Response(
          JSON.stringify({ error: 'No file provided' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;
      const filePath = `documents/${filename}`;

      // Upload to Supabase Storage (if configured)
      // For now, we'll store metadata in the database
      const { data: document, error } = await supabaseClient
        .from('tbl_documents')
        .insert({
          name: file.name,
          file_path: filePath,
          mime_type: file.type,
          file_size: file.size,
          document_type: documentType,
          client_id: clientId,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error uploading document:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to upload document' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify(document), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /documents - List documents
    if (req.method === 'GET' && !pathname.includes('/download')) {
      const clientId = url.searchParams.get('client_id');
      
      let query = supabaseClient
        .from('tbl_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data: documents, error } = await query;

      if (error) {
        console.error('Error fetching documents:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch documents' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify(documents || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /documents/download - Download document
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

      // In a real implementation, you would retrieve the file from storage
      // For now, return a placeholder response
      return new Response('File download not implemented yet', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      });
    }

    // DELETE /documents/:id - Delete document
    if (req.method === 'DELETE') {
      const pathSegments = pathname.split('/').filter(Boolean);
      const documentId = pathSegments[pathSegments.length - 1];

      const { error } = await supabaseClient
        .from('tbl_documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('Error deleting document:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete document' }),
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
    console.error('Documents service error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
