
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

const API_BASE_URL = '/api';

export class TwilioVideoService {
  static async createVideoSession(sessionId: string): Promise<{ data: VideoSessionData | null; error: string | null }> {
    try {
      console.log('Creating video session for session ID:', sessionId);

      const res = await fetch(`${API_BASE_URL}/video-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: sessionId })
      });

      if (!res.ok) {
        return { data: null, error: `Failed to create video session: ${res.statusText}` };
      }

      const videoSession = await res.json();
      return { data: videoSession, error: null };
    } catch (error: any) {
      console.error('Unexpected error in createVideoSession:', error);
      return { data: null, error: error.message };
    }
  }

  static async getVideoSession(sessionId: string): Promise<{ data: VideoSessionData | null; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/video-sessions/${sessionId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        return { data: null, error: `Failed to fetch video session: ${res.statusText}` };
      }

      const videoSession = await res.json();
      return { data: videoSession, error: null };
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
      const res = await fetch(`${API_BASE_URL}/video-sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, ...additionalData })
      });

      if (!res.ok) {
        return { error: `Failed to update video session: ${res.statusText}` };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error in updateVideoSessionStatus:', error);
      return { error: error.message };
    }
  }

  static async addParticipant(participantData: Omit<SessionParticipant, 'id' | 'tenant_id'>): Promise<{ data: SessionParticipant | null; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/video-sessions/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(participantData)
      });

      if (!res.ok) {
        return { data: null, error: `Failed to add participant: ${res.statusText}` };
      }

      const participant = await res.json();
      return { data: participant, error: null };
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
      const res = await fetch(`${API_BASE_URL}/video-sessions/participants/${participantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        return { error: `Failed to update participant: ${res.statusText}` };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error in updateParticipant:', error);
      return { error: error.message };
    }
  }

  static async getSessionParticipants(videoSessionId: string): Promise<{ data: SessionParticipant[]; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/video-sessions/${videoSessionId}/participants`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        return { data: [], error: `Failed to fetch participants: ${res.statusText}` };
      }

      const participants = await res.json();
      return { data: participants, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getSessionParticipants:', error);
      return { data: [], error: error.message };
    }
  }

  static async addChatMessage(messageData: Omit<ChatMessage, 'id' | 'tenant_id'>): Promise<{ data: ChatMessage | null; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/video-sessions/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!res.ok) {
        return { data: null, error: `Failed to add chat message: ${res.statusText}` };
      }

      const message = await res.json();
      return { data: message, error: null };
    } catch (error: any) {
      console.error('Unexpected error in addChatMessage:', error);
      return { data: null, error: error.message };
    }
  }

  static async getChatMessages(videoSessionId: string): Promise<{ data: ChatMessage[]; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/video-sessions/${videoSessionId}/chat`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        return { data: [], error: `Failed to fetch chat messages: ${res.statusText}` };
      }

      const messages = await res.json();
      return { data: messages, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getChatMessages:', error);
      return { data: [], error: error.message };
    }
  }
}
