
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JournalEntry {
  id?: string;
  client_id: string;
  title: string;
  content: string;
  session_date?: string;
  is_shared_with_practitioner?: boolean;
  tenant_id?: string;
  created_by?: string;
  updated_by?: string;
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
    const entryId = pathSegments[pathSegments.length - 1];

    // GET /client-journal - List journal entries
    if (req.method === 'GET' && !entryId) {
      const { data: entries, error } = await supabaseClient
        .from('tbl_client_journal')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching journal entries:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch journal entries' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify(entries || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /client-journal - Create journal entry
    if (req.method === 'POST') {
      const entryData: Omit<JournalEntry, 'id'> = await req.json();

      const { data: entry, error } = await supabaseClient
        .from('tbl_client_journal')
        .insert({
          ...entryData,
          created_by: user.id,
          updated_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating journal entry:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create journal entry' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify(entry), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /client-journal/:id - Update journal entry
    if (req.method === 'PUT' && entryId) {
      const updateData: Partial<JournalEntry> = await req.json();

      const { data: entry, error } = await supabaseClient
        .from('tbl_client_journal')
        .update({
          ...updateData,
          updated_by: user.id,
        })
        .eq('id', entryId)
        .select()
        .single();

      if (error) {
        console.error('Error updating journal entry:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update journal entry' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify(entry), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /client-journal/:id - Delete journal entry
    if (req.method === 'DELETE' && entryId) {
      const { error } = await supabaseClient
        .from('tbl_client_journal')
        .delete()
        .eq('id', entryId);

      if (error) {
        console.error('Error deleting journal entry:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete journal entry' }),
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
    console.error('Client journal service error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
