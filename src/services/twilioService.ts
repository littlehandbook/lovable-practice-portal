
// src/services/twilioService.ts

const API_BASE_URL = '/api'; // Use Vite proxy to microservices

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
  const res = await fetch(`${API_BASE_URL}/twilio/rooms`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ roomName, tenantId }),
  });
  
  if (!res.ok) throw new Error(`Error creating Twilio room: ${res.statusText}`);
  return res.json();
}

export async function generateTwilioToken(
  identity: string, 
  roomName: string, 
  tenantId: string
): Promise<TwilioToken> {
  const res = await fetch(`${API_BASE_URL}/twilio/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ identity, roomName, tenantId }),
  });
  
  if (!res.ok) throw new Error(`Error generating Twilio token: ${res.statusText}`);
  return res.json();
}

export async function endTwilioRoom(roomSid: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/twilio/rooms/${roomSid}/end`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) throw new Error(`Error ending Twilio room: ${res.statusText}`);
}

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  // In a real implementation, this would get the token from your auth context
  return '';
}
