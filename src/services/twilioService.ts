
import { supabase } from '@/integrations/supabase/client';

export interface TwilioRoom {
  room_sid: string;
  room_name: string;
  status: string;
  created_at: string;
}

export interface TwilioToken {
  token: string;
  identity: string;
  room_name: string;
}

export async function createTwilioRoom(roomName: string, tenantId: string): Promise<TwilioRoom> {
  try {
    const { data, error } = await supabase.functions.invoke('twilio-rooms', {
      body: { action: 'create', roomName, tenantId }
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    throw new Error(`Error creating Twilio room: ${error.message}`);
  }
}

export async function generateTwilioToken(
  identity: string, 
  roomName: string, 
  tenantId: string
): Promise<TwilioToken> {
  try {
    const { data, error } = await supabase.functions.invoke('twilio-token', {
      body: { identity, roomName, tenantId }
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    throw new Error(`Error generating Twilio token: ${error.message}`);
  }
}

export async function endTwilioRoom(roomSid: string): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('twilio-rooms', {
      body: { action: 'end', roomSid }
    });

    if (error) throw error;
  } catch (error: any) {
    throw new Error(`Error ending Twilio room: ${error.message}`);
  }
}
