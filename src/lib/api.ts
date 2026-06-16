import { supabase, Subject, Teacher, Room, TimeSlot, TimetableEntry } from './supabase';

// Subjects
export async function fetchSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase.from('subjects').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addSubject(name: string, color: string, weekly_hours: number, teacher_id: string | null) {
  const { data, error } = await supabase
    .from('subjects')
    .insert([{ name, color, weekly_hours, teacher_id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSubject(id: string, updates: Partial<Subject>) {
  const { data, error } = await supabase.from('subjects').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSubject(id: string) {
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) throw error;
}

// Teachers
export async function fetchTeachers(): Promise<Teacher[]> {
  const { data, error } = await supabase.from('teachers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addTeacher(name: string, available_days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
  const { data, error } = await supabase
    .from('teachers')
    .insert([{ name, available_days }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTeacher(id: string, updates: Partial<Teacher>) {
  const { data, error } = await supabase.from('teachers').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTeacher(id: string) {
  const { error } = await supabase.from('teachers').delete().eq('id', id);
  if (error) throw error;
}

// Rooms
export async function fetchRooms(): Promise<Room[]> {
  const { data, error } = await supabase.from('rooms').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addRoom(name: string, room_type: string = 'Classroom', capacity: number = 30) {
  const { data, error } = await supabase
    .from('rooms')
    .insert([{ name, room_type, capacity }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRoom(id: string, updates: Partial<Room>) {
  const { data, error } = await supabase.from('rooms').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRoom(id: string) {
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) throw error;
}

// Time Slots
export async function fetchTimeSlots(): Promise<TimeSlot[]> {
  const { data, error } = await supabase
    .from('time_slots')
    .select('*')
    .order('period_number', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addTimeSlot(period_number: number, start_time: string, end_time: string) {
  const { data, error } = await supabase
    .from('time_slots')
    .insert([{ period_number, start_time, end_time }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTimeSlot(id: string, updates: Partial<TimeSlot>) {
  const { data, error } = await supabase.from('time_slots').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTimeSlot(id: string) {
  const { error } = await supabase.from('time_slots').delete().eq('id', id);
  if (error) throw error;
}

// Timetable Entries
export async function fetchTimetableEntries(): Promise<TimetableEntry[]> {
  const { data, error } = await supabase.from('timetable_entries').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addTimetableEntry(
  subject_id: string,
  teacher_id: string,
  room_id: string,
  time_slot_id: string,
  day_name: string
) {
  const { data, error } = await supabase
    .from('timetable_entries')
    .insert([{ subject_id, teacher_id, room_id, time_slot_id, day_name }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function clearTimetable() {
  const { error } = await supabase.from('timetable_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
}

export async function deleteTimetableEntry(id: string) {
  const { error } = await supabase.from('timetable_entries').delete().eq('id', id);
  if (error) throw error;
}
