import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const hasValidCredentials = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' && 
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  isValidUrl(supabaseUrl);

if (!hasValidCredentials) {
  console.warn('Supabase credentials not configured. Please set up your environment variables.');
}

// Create a mock client or real client based on credentials
export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'manager' | 'teacher';
          avatar: string | null;
          password: string;
          is_active: boolean;
          last_login: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: 'admin' | 'manager' | 'teacher';
          avatar?: string | null;
          password: string;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'admin' | 'manager' | 'teacher';
          avatar?: string | null;
          password?: string;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          color: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          description?: string | null;
          color: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          color?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          name: string;
          birth_date: string;
          gender: 'male' | 'female' | 'other';
          parent_name: string;
          mother_name: string | null;
          parent_phone: string;
          parent_id_card: string | null;
          parent_id_card2: string | null;
          status: 'active' | 'inactive';
          drive_link: string | null;
          class_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          birth_date: string;
          gender: 'male' | 'female' | 'other';
          parent_name: string;
          mother_name?: string | null;
          parent_phone: string;
          parent_id_card?: string | null;
          parent_id_card2?: string | null;
          status?: 'active' | 'inactive';
          drive_link?: string | null;
          class_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          birth_date?: string;
          gender?: 'male' | 'female' | 'other';
          parent_name?: string;
          mother_name?: string | null;
          parent_phone?: string;
          parent_id_card?: string | null;
          parent_id_card2?: string | null;
          status?: 'active' | 'inactive';
          drive_link?: string | null;
          class_id?: string | null;
          created_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          name: string;
          teacher_id: string;
          student_ids: string[];
          max_students: number;
          subject_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          teacher_id: string;
          student_ids?: string[];
          max_students?: number;
          subject_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          teacher_id?: string;
          student_ids?: string[];
          max_students?: number;
          subject_id?: string | null;
          created_at?: string;
        };
      };
      classrooms: {
        Row: {
          id: string;
          name: string;
          capacity: number;
          location: string;
          equipment: string[];
          status: 'available' | 'occupied' | 'maintenance';
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          capacity?: number;
          location?: string;
          equipment?: string[];
          status?: 'available' | 'occupied' | 'maintenance';
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          capacity?: number;
          location?: string;
          equipment?: string[];
          status?: 'available' | 'occupied' | 'maintenance';
          description?: string | null;
          created_at?: string;
        };
      };
      schedules: {
        Row: {
          id: string;
          class_id: string;
          teacher_id: string;
          classroom_id: string | null;
          subject_id: string | null;
          date: string;
          time_slot: 'morning' | 'afternoon' | 'evening';
          start_time: string;
          end_time: string;
          status: 'scheduled' | 'completed' | 'cancelled';
        };
        Insert: {
          id?: string;
          class_id: string;
          teacher_id: string;
          classroom_id?: string | null;
          subject_id?: string | null;
          date: string;
          time_slot: 'morning' | 'afternoon' | 'evening';
          start_time: string;
          end_time: string;
          status?: 'scheduled' | 'completed' | 'cancelled';
        };
        Update: {
          id?: string;
          class_id?: string;
          teacher_id?: string;
          classroom_id?: string | null;
          subject_id?: string | null;
          date?: string;
          time_slot?: 'morning' | 'afternoon' | 'evening';
          start_time?: string;
          end_time?: string;
          status?: 'scheduled' | 'completed' | 'cancelled';
        };
      };
      attendance: {
        Row: {
          id: string;
          schedule_id: string;
          student_id: string;
          status: 'present' | 'absent' | 'late';
          checked_at: string | null;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          student_id: string;
          status: 'present' | 'absent' | 'late';
          checked_at?: string | null;
        };
        Update: {
          id?: string;
          schedule_id?: string;
          student_id?: string;
          status?: 'present' | 'absent' | 'late';
          checked_at?: string | null;
        };
      };
      grade_periods: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          start_date: string;
          end_date: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      grade_columns: {
        Row: {
          id: string;
          name: string;
          class_id: string;
          teacher_id: string;
          grade_period_id: string | null;
          max_score: number;
          weight: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          class_id: string;
          teacher_id: string;
          grade_period_id?: string | null;
          max_score?: number;
          weight?: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          class_id?: string;
          teacher_id?: string;
          grade_period_id?: string | null;
          max_score?: number;
          weight?: number;
          description?: string | null;
          created_at?: string;
        };
      };
      grades: {
        Row: {
          id: string;
          grade_column_id: string;
          student_id: string;
          score: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          grade_column_id: string;
          student_id: string;
          score?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          grade_column_id?: string;
          student_id?: string;
          score?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};