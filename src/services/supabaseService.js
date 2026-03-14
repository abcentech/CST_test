import { supabase } from '../supabaseClient';

export const supabaseService = {
  async fetchSubmissions() {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('start_time', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async logStartAssessment(userInfo) {
    const { data, error } = await supabase
      .from('submissions')
      .insert([
        { 
          candidate_name: userInfo.name, 
          dob: userInfo.dob, 
          year_joined: parseInt(userInfo.yearJoined),
          status: 'started'
        }
      ])
      .select();
    
    if (error) throw error;
    return data?.[0]?.id;
  },

  async updateSubmission(id, updates) {
    const { error } = await supabase
      .from('submissions')
      .update({
        ...updates,
        end_time: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
  }
};
