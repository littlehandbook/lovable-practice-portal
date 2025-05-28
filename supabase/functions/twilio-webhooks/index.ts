
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!twilioAccountSid || !twilioAuthToken) {
      return new Response(
        JSON.stringify({ error: 'Twilio credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse webhook data from Twilio
    const formData = await req.formData();
    const webhookData: Record<string, string> = {};
    
    for (const [key, value] of formData.entries()) {
      webhookData[key] = value.toString();
    }

    console.log('Received Twilio webhook:', webhookData);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const webhookType = pathParts[pathParts.length - 1];

    switch (webhookType) {
      case 'room-status':
        await handleRoomStatusWebhook(webhookData, supabase);
        break;
      case 'recording':
        await handleRecordingWebhook(webhookData, supabase, twilioAccountSid, twilioAuthToken);
        break;
      case 'participant':
        await handleParticipantWebhook(webhookData, supabase);
        break;
      default:
        console.log('Unknown webhook type:', webhookType);
    }

    return new Response('OK', { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
    });

  } catch (error) {
    console.error('Error processing Twilio webhook:', error);
    return new Response('Internal Server Error', { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
    });
  }
});

async function handleRoomStatusWebhook(data: Record<string, string>, supabase: any) {
  const { RoomName, RoomSid, RoomStatus } = data;
  
  console.log(`Room ${RoomName} status changed to: ${RoomStatus}`);

  const updates: any = {
    twilio_room_sid: RoomSid,
    status: mapTwilioStatusToLocal(RoomStatus)
  };

  if (RoomStatus === 'in-progress') {
    updates.started_at = new Date().toISOString();
  } else if (RoomStatus === 'completed') {
    updates.ended_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('tbl_video_sessions')
    .update(updates)
    .eq('twilio_room_name', RoomName);

  if (error) {
    console.error('Error updating room status:', error);
  }
}

async function handleRecordingWebhook(
  data: Record<string, string>, 
  supabase: any, 
  accountSid: string, 
  authToken: string
) {
  const { RecordingSid, RoomName, RoomSid } = data;
  
  console.log(`Recording completed for room ${RoomName}: ${RecordingSid}`);

  // Update video session with recording info
  const { error: updateError } = await supabase
    .from('tbl_video_sessions')
    .update({
      recording_sid: RecordingSid,
      recording_url: `https://video.twilio.com/v1/Recordings/${RecordingSid}/Media`
    })
    .eq('twilio_room_name', RoomName);

  if (updateError) {
    console.error('Error updating recording info:', updateError);
    return;
  }

  // Fetch transcription if available
  try {
    const transcriptionResponse = await fetch(
      `https://video.twilio.com/v1/Recordings/${RecordingSid}/Transcriptions`,
      {
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        },
      }
    );

    if (transcriptionResponse.ok) {
      const transcriptions = await transcriptionResponse.json();
      
      if (transcriptions.transcriptions && transcriptions.transcriptions.length > 0) {
        const transcription = transcriptions.transcriptions[0];
        
        // Get video session ID
        const { data: session } = await supabase
          .from('tbl_video_sessions')
          .select('id')
          .eq('twilio_room_name', RoomName)
          .single();

        if (session) {
          // Store transcription
          await supabase
            .from('tbl_session_transcripts')
            .insert({
              video_session_id: session.id,
              twilio_recording_sid: RecordingSid,
              twilio_transcription_sid: transcription.sid,
              raw_transcript: transcription.transcript_text,
              transcript_status: 'completed',
              confidence_score: transcription.confidence,
              duration_seconds: transcription.duration
            });

          console.log('Transcription stored successfully');
        }
      }
    }
  } catch (transcriptionError) {
    console.error('Error fetching transcription:', transcriptionError);
  }
}

async function handleParticipantWebhook(data: Record<string, string>, supabase: any) {
  const { ParticipantIdentity, ParticipantStatus, RoomName, ParticipantSid } = data;
  
  console.log(`Participant ${ParticipantIdentity} in room ${RoomName}: ${ParticipantStatus}`);

  // Extract user info from identity (format: "practitioner-userid" or "client-userid")
  const [userType, userId] = ParticipantIdentity.split('-');

  // Get video session
  const { data: session } = await supabase
    .from('tbl_video_sessions')
    .select('id')
    .eq('twilio_room_name', RoomName)
    .single();

  if (!session) {
    console.error('Video session not found for room:', RoomName);
    return;
  }

  if (ParticipantStatus === 'connected') {
    // Add or update participant
    const { error } = await supabase
      .from('tbl_session_participants')
      .upsert({
        video_session_id: session.id,
        user_id: userId,
        user_type: userType,
        twilio_identity: ParticipantIdentity,
        joined_at: new Date().toISOString()
      }, {
        onConflict: 'video_session_id,user_id'
      });

    if (error) {
      console.error('Error adding participant:', error);
    }

    // Update participant count
    const { error: countError } = await supabase.rpc('increment_participant_count', {
      session_id: session.id
    });

    if (countError) {
      console.error('Error updating participant count:', countError);
    }

  } else if (ParticipantStatus === 'disconnected') {
    // Update participant left time
    const { error } = await supabase
      .from('tbl_session_participants')
      .update({
        left_at: new Date().toISOString()
      })
      .eq('video_session_id', session.id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating participant left time:', error);
    }

    // Update participant count
    const { error: countError } = await supabase.rpc('decrement_participant_count', {
      session_id: session.id
    });

    if (countError) {
      console.error('Error updating participant count:', countError);
    }
  }
}

function mapTwilioStatusToLocal(twilioStatus: string): string {
  switch (twilioStatus) {
    case 'in-progress':
      return 'active';
    case 'completed':
      return 'completed';
    case 'failed':
      return 'failed';
    default:
      return 'scheduled';
  }
}
