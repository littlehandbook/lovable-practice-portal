
export interface TwilioAccessToken {
  token: string;
  identity: string;
  room: string;
  expires_at: string;
}

export interface TwilioRoom {
  sid: string;
  unique_name: string;
  status: string;
  type: string;
  max_participants: number;
  duration: number;
  date_created: string;
  date_updated: string;
}

export class TwilioApiService {
  private static baseUrl = 'https://video.twilio.com/v1';
  
  static async generateAccessToken(
    sessionId: string, 
    userId: string, 
    userType: 'practitioner' | 'client'
  ): Promise<{ data: TwilioAccessToken | null; error: string | null }> {
    try {
      console.log('Generating Twilio access token for session:', sessionId, 'user:', userId);

      const response = await fetch('/api/twilio/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userId,
          userType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: errorData.error || 'Failed to generate access token' };
      }

      const data = await response.json();
      console.log('Access token generated successfully');

      return { 
        data: {
          token: data.token,
          identity: data.identity,
          room: data.room,
          expires_at: data.expires_at
        }, 
        error: null 
      };
    } catch (error: any) {
      console.error('Error generating access token:', error);
      return { data: null, error: error.message };
    }
  }

  static async createRoom(roomName: string): Promise<{ data: TwilioRoom | null; error: string | null }> {
    try {
      console.log('Creating Twilio room:', roomName);

      const response = await fetch('/api/twilio/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uniqueName: roomName,
          recordParticipantsOnConnect: true,
          type: 'group',
          maxParticipants: 2
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: errorData.error || 'Failed to create room' };
      }

      const data = await response.json();
      console.log('Room created successfully:', data);

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating room:', error);
      return { data: null, error: error.message };
    }
  }

  static async getRoomDetails(roomSid: string): Promise<{ data: TwilioRoom | null; error: string | null }> {
    try {
      const response = await fetch(`/api/twilio/room/${roomSid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: errorData.error || 'Failed to fetch room details' };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching room details:', error);
      return { data: null, error: error.message };
    }
  }

  static async endRoom(roomSid: string): Promise<{ error: string | null }> {
    try {
      console.log('Ending Twilio room:', roomSid);

      const response = await fetch(`/api/twilio/room/${roomSid}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Failed to end room' };
      }

      console.log('Room ended successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Error ending room:', error);
      return { error: error.message };
    }
  }
}
