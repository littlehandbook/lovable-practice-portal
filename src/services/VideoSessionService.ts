
import { TwilioVideoService, VideoSessionData } from './TwilioVideoService';
import { TwilioApiService, TwilioAccessToken } from './TwilioApiService';

export interface VideoSession {
  id: string;
  sessionId: string;
  roomName: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'failed';
  participants: number;
  maxParticipants: number;
  startedAt?: string;
  endedAt?: string;
  accessToken?: TwilioAccessToken;
}

export class VideoSessionService {
  static async startVideoSession(sessionId: string): Promise<{ data: VideoSession | null; error: string | null }> {
    try {
      console.log('Starting video session:', sessionId);

      // Create video session in database
      const { data: videoSession, error: createError } = await TwilioVideoService.createVideoSession(sessionId);
      if (createError || !videoSession) {
        return { data: null, error: createError || 'Failed to create video session' };
      }

      // Create Twilio room
      const { data: room, error: roomError } = await TwilioApiService.createRoom(videoSession.twilio_room_name);
      if (roomError) {
        console.warn('Room creation failed, might already exist:', roomError);
      }

      // Update session with room SID if we got one
      if (room) {
        await TwilioVideoService.updateVideoSessionStatus(sessionId, 'scheduled', {
          twilio_room_sid: room.sid
        });
      }

      return {
        data: {
          id: videoSession.id,
          sessionId: videoSession.session_id,
          roomName: videoSession.twilio_room_name,
          status: videoSession.status,
          participants: videoSession.participant_count,
          maxParticipants: videoSession.max_participants,
          startedAt: videoSession.started_at,
          endedAt: videoSession.ended_at
        },
        error: null
      };
    } catch (error: any) {
      console.error('Error starting video session:', error);
      return { data: null, error: error.message };
    }
  }

  static async joinVideoSession(
    sessionId: string, 
    userId: string, 
    userType: 'practitioner' | 'client'
  ): Promise<{ data: TwilioAccessToken | null; error: string | null }> {
    try {
      console.log('Joining video session:', sessionId, 'as', userType);

      // Get or create video session
      let { data: videoSession } = await TwilioVideoService.getVideoSession(sessionId);
      
      if (!videoSession) {
        const { data: newSession, error } = await this.startVideoSession(sessionId);
        if (error || !newSession) {
          return { data: null, error: error || 'Failed to create session' };
        }
        
        const { data: dbSession } = await TwilioVideoService.getVideoSession(sessionId);
        videoSession = dbSession;
      }

      if (!videoSession) {
        return { data: null, error: 'Video session not found' };
      }

      // Generate access token
      const { data: accessToken, error: tokenError } = await TwilioApiService.generateAccessToken(
        sessionId,
        userId,
        userType
      );

      if (tokenError || !accessToken) {
        return { data: null, error: tokenError || 'Failed to generate access token' };
      }

      // Add participant to database
      await TwilioVideoService.addParticipant({
        video_session_id: videoSession.id,
        user_id: userId,
        user_type: userType,
        twilio_identity: accessToken.identity,
        access_token_issued_at: new Date().toISOString(),
        access_token_expires_at: accessToken.expires_at
      });

      return { data: accessToken, error: null };
    } catch (error: any) {
      console.error('Error joining video session:', error);
      return { data: null, error: error.message };
    }
  }

  static async endVideoSession(sessionId: string): Promise<{ error: string | null }> {
    try {
      console.log('Ending video session:', sessionId);

      // Get video session
      const { data: videoSession, error: getError } = await TwilioVideoService.getVideoSession(sessionId);
      if (getError || !videoSession) {
        return { error: getError || 'Video session not found' };
      }

      // End Twilio room if we have the SID
      if (videoSession.twilio_room_sid) {
        const { error: roomError } = await TwilioApiService.endRoom(videoSession.twilio_room_sid);
        if (roomError) {
          console.warn('Failed to end Twilio room:', roomError);
        }
      }

      // Update session status
      const { error: updateError } = await TwilioVideoService.updateVideoSessionStatus(
        sessionId, 
        'completed'
      );

      if (updateError) {
        return { error: updateError };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error ending video session:', error);
      return { error: error.message };
    }
  }

  static async getVideoSession(sessionId: string): Promise<{ data: VideoSession | null; error: string | null }> {
    try {
      const { data: videoSession, error } = await TwilioVideoService.getVideoSession(sessionId);
      
      if (error || !videoSession) {
        return { data: null, error: error || 'Video session not found' };
      }

      return {
        data: {
          id: videoSession.id,
          sessionId: videoSession.session_id,
          roomName: videoSession.twilio_room_name,
          status: videoSession.status,
          participants: videoSession.participant_count,
          maxParticipants: videoSession.max_participants,
          startedAt: videoSession.started_at,
          endedAt: videoSession.ended_at
        },
        error: null
      };
    } catch (error: any) {
      console.error('Error getting video session:', error);
      return { data: null, error: error.message };
    }
  }
}
