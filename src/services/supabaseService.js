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
        end_time: updates.status === 'completed' ? new Date().toISOString() : undefined
      })
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteSubmission(id) {
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async fetchQuestions() {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createQuestion(question) {
    const { data, error } = await supabase
      .from('questions')
      .insert([question])
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async updateQuestion(id, updates) {
    const { error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteQuestion(id) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
