
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Client {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tenant_id?: string;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

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

    // Get the authenticated user
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
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const clientId = pathSegments[pathSegments.length - 1];

    // GET /clients - List all clients
    if (req.method === 'GET' && !clientId) {
      const { data: clients, error } = await supabaseClient
        .from('tbl_clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch clients' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify(clients || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /clients/:id - Get specific client
    if (req.method === 'GET' && clientId) {
      const { data: client, error } = await supabaseClient
        .from('tbl_clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) {
        console.error('Error fetching client:', error);
        return new Response(
          JSON.stringify({ error: 'Client not found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify(client), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /clients - Create new client
    if (req.method === 'POST') {
      const clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'> = await req.json();

      const { data: client, error } = await supabaseClient
        .from('tbl_clients')
        .insert({
          ...clientData,
          created_by: user.id,
          updated_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create client' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify(client), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /clients/:id - Update client
    if (req.method === 'PUT' && clientId) {
      const updateData: Partial<Client> = await req.json();

      const { data: client, error } = await supabaseClient
        .from('tbl_clients')
        .update({
          ...updateData,
          updated_by: user.id,
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error('Error updating client:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update client' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify(client), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /clients/:id - Delete client
    if (req.method === 'DELETE' && clientId) {
      const { error } = await supabaseClient
        .from('tbl_clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('Error deleting client:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete client' }),
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
    console.error('Clients service error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
