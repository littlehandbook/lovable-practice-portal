
import { supabase } from '@/integrations/supabase/client';

export interface ClientGoals {
  emotional_mental: string;
  physical: string;
  social_relational: string;
  spiritual: string;
  environmental: string;
  intellectual_occupational: string;
  financial: string;
}

export async function fetchClientGoals(clientId: string, tenantId: string): Promise<ClientGoals | null> {
  console.log('Fetching goals from Supabase for client:', clientId, 'tenant:', tenantId);
  
  try {
    const { data, error } = await supabase
      .rpc('sp_get_client_goals', {
        p_client_id: clientId,
        p_tenant_id: tenantId
      });

    if (error) {
      console.error('Supabase error fetching goals:', error);
      // Return null if no goals found (404 equivalent)
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching goals: ${error.message}`);
    }

    console.log('Goals data from Supabase:', data);
    
    // If no data returned, return null
    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Error in fetchClientGoals:', error);
    throw error;
  }
}

export async function updateClientGoals(
  clientId: string,
  tenantId: string,
  goals: ClientGoals,
  userId: string
): Promise<void> {
  console.log('Saving goals to Supabase:', { clientId, tenantId, goals, userId });
  
  try {
    const { error } = await supabase
      .rpc('sp_upsert_client_goals', {
        p_client_id: clientId,
        p_tenant_id: tenantId,
        p_emotional_mental: goals.emotional_mental,
        p_physical: goals.physical,
        p_social_relational: goals.social_relational,
        p_spiritual: goals.spiritual,
        p_environmental: goals.environmental,
        p_intellectual_occupational: goals.intellectual_occupational,
        p_financial: goals.financial,
        p_user_id: userId
      });

    if (error) {
      console.error('Supabase error saving goals:', error);
      throw new Error(`Error saving goals: ${error.message}`);
    }

    console.log('Goals saved successfully');
  } catch (error) {
    console.error('Error in updateClientGoals:', error);
    throw error;
  }
}
