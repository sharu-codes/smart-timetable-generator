import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Subject = {
  id: string;
  name: string;
  color: string;
  weekly_hours: number;
  teacher_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Teacher = {
  id: string;
  name: string;
  available_days: string[];
  created_at: string;
  updated_at: string;
};

export type Room = {
  id: string;
  name: string;
  room_type: string;
  capacity: number;
  created_at: string;
  updated_at: string;
};

export type TimeSlot = {
  id: string;
  period_number: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
};

export type TimetableEntry = {
  id: string;
  subject_id: string;
  teacher_id: string;
  room_id: string;
  time_slot_id: string;
  day_name: string;
  created_at: string;
  updated_at: string;
};
