
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!twilioAccountSid || !twilioAuthToken) {
      return new Response(
        JSON.stringify({ error: 'Twilio credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    
    // Handle different room operations
    if (req.method === 'POST' && pathParts.length === 3) {
      // Create room
      const { uniqueName, recordParticipantsOnConnect, type, maxParticipants } = await req.json();

      const formData = new URLSearchParams();
      formData.append('UniqueName', uniqueName);
      formData.append('Type', type || 'group');
      formData.append('RecordParticipantsOnConnect', recordParticipantsOnConnect?.toString() || 'true');
      if (maxParticipants) {
        formData.append('MaxParticipants', maxParticipants.toString());
      }

      const response = await fetch(`https://video.twilio.com/v1/Rooms`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Twilio API error:', errorText);
        
        // Check if room already exists
        if (response.status === 400 && errorText.includes('already exists')) {
          // Fetch the existing room
          const getRoomResponse = await fetch(`https://video.twilio.com/v1/Rooms/${uniqueName}`, {
            headers: {
              'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            },
          });
          
          if (getRoomResponse.ok) {
            const existingRoom = await getRoomResponse.json();
            return new Response(
              JSON.stringify(existingRoom),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        
        return new Response(
          JSON.stringify({ error: 'Failed to create room' }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const roomData = await response.json();
      console.log('Room created:', roomData.unique_name);

      return new Response(
        JSON.stringify(roomData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (req.method === 'GET' && pathParts.length === 4) {
      // Get room details
      const roomSid = pathParts[3];

      const response = await fetch(`https://video.twilio.com/v1/Rooms/${roomSid}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        },
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: 'Room not found' }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const roomData = await response.json();
      return new Response(
        JSON.stringify(roomData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (req.method === 'POST' && pathParts.length === 5 && pathParts[4] === 'end') {
      // End room
      const roomSid = pathParts[3];

      const formData = new URLSearchParams();
      formData.append('Status', 'completed');

      const response = await fetch(`https://video.twilio.com/v1/Rooms/${roomSid}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to end room' }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const roomData = await response.json();
      console.log('Room ended:', roomSid);

      return new Response(
        JSON.stringify(roomData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in twilio-rooms function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
