
import { supabase } from '@/integrations/supabase/client';

export interface VideoSessionData {
  id: string;
  session_id: string;
  twilio_room_sid?: string;
  twilio_room_name: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'failed';
  started_at?: string;
  ended_at?: string;
  recording_sid?: string;
  recording_url?: string;
  participant_count: number;
  max_participants: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  tenant_id: string;
}

export interface SessionParticipant {
  id: string;
  video_session_id: string;
  user_id: string;
  user_type: 'practitioner' | 'client';
  twilio_identity: string;
  joined_at?: string;
  left_at?: string;
  connection_duration_seconds?: number;
  access_token_issued_at?: string;
  access_token_expires_at?: string;
  tenant_id: string;
}

export interface ChatMessage {
  id: string;
  video_session_id: string;
  sender_id: string;
  sender_type: 'practitioner' | 'client';
  message_content: string;
  message_type: 'text' | 'file' | 'system';
  twilio_message_sid?: string;
  sent_at: string;
  tenant_id: string;
}

export class TwilioVideoService {
  static async createVideoSession(sessionId: string): Promise<{ data: VideoSessionData | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      console.log('Creating video session for session ID:', sessionId);

      const roomName = `session-${sessionId}`;
      
      const { data, error } = await supabase
        .from('tbl_video_sessions' as any)
        .insert({
          session_id: sessionId,
          twilio_room_name: roomName,
          status: 'scheduled',
          participant_count: 0,
          max_participants: 2
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating video session:', error);
        return { data: null, error: error.message };
      }

      console.log('Video session created successfully:', data);
      return { data: data as unknown as VideoSessionData, error: null };
    } catch (error: any) {
      console.error('Unexpected error in createVideoSession:', error);
      return { data: null, error: error.message };
    }
  }

  static async getVideoSession(sessionId: string): Promise<{ data: VideoSessionData | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_video_sessions' as any)
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) {
        console.error('Error fetching video session:', error);
        return { data: null, error: error.message };
      }

      return { data: data as unknown as VideoSessionData, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getVideoSession:', error);
      return { data: null, error: error.message };
    }
  }

  static async updateVideoSessionStatus(
    sessionId: string, 
    status: VideoSessionData['status'],
    additionalData?: Partial<VideoSessionData>
  ): Promise<{ error: string | null }> {
    try {
      const updateData: any = {
        status,
        ...additionalData
      };

      if (status === 'active' && !additionalData?.started_at) {
        updateData.started_at = new Date().toISOString();
      }

      if (status === 'completed' && !additionalData?.ended_at) {
        updateData.ended_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tbl_video_sessions' as any)
        .update(updateData)
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error updating video session status:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error in updateVideoSessionStatus:', error);
      return { error: error.message };
    }
  }

  static async addParticipant(participantData: Omit<SessionParticipant, 'id' | 'tenant_id'>): Promise<{ data: SessionParticipant | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_session_participants' as any)
        .insert(participantData)
        .select()
        .single();

      if (error) {
        console.error('Error adding participant:', error);
        return { data: null, error: error.message };
      }

      // Update participant count
      await supabase.rpc('increment_participant_count', {
        session_id: participantData.video_session_id
      });

      return { data: data as unknown as SessionParticipant, error: null };
    } catch (error: any) {
      console.error('Unexpected error in addParticipant:', error);
      return { data: null, error: error.message };
    }
  }

  static async updateParticipant(
    participantId: string,
    updates: Partial<SessionParticipant>
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('tbl_session_participants' as any)
        .update(updates)
        .eq('id', participantId);

      if (error) {
        console.error('Error updating participant:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error in updateParticipant:', error);
      return { error: error.message };
    }
  }

  static async getSessionParticipants(videoSessionId: string): Promise<{ data: SessionParticipant[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_session_participants' as any)
        .select('*')
        .eq('video_session_id', videoSessionId)
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Error fetching session participants:', error);
        return { data: [], error: error.message };
      }

      return { data: (data || []) as unknown as SessionParticipant[], error: null };
    } catch (error: any) {
      console.error('Unexpected error in getSessionParticipants:', error);
      return { data: [], error: error.message };
    }
  }

  static async addChatMessage(messageData: Omit<ChatMessage, 'id' | 'tenant_id'>): Promise<{ data: ChatMessage | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_session_chat' as any)
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('Error adding chat message:', error);
        return { data: null, error: error.message };
      }

      return { data: data as unknown as ChatMessage, error: null };
    } catch (error: any) {
      console.error('Unexpected error in addChatMessage:', error);
      return { data: null, error: error.message };
    }
  }

  static async getChatMessages(videoSessionId: string): Promise<{ data: ChatMessage[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_session_chat' as any)
        .select('*')
        .eq('video_session_id', videoSessionId)
        .order('sent_at', { ascending: true });

      if (error) {
        console.error('Error fetching chat messages:', error);
        return { data: [], error: error.message };
      }

      return { data: (data || []) as unknown as ChatMessage[], error: null };
    } catch (error: any) {
      console.error('Unexpected error in getChatMessages:', error);
      return { data: [], error: error.message };
    }
  }
}
