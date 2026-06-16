/*
  # Create Timetable Generator Schema

  1. New Tables
    - `subjects` - Stores course/subject information
    - `teachers` - Stores teacher information and availability
    - `rooms` - Stores classroom/room information
    - `time_slots` - Stores daily period structure (08:00-09:00, etc)
    - `timetable_entries` - Stores generated schedule entries
  
  2. Security
    - Enable RLS on all tables
    - Add policies for public read/write access (no auth required for demo)
    - Policies ensure data integrity at application level
*/

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT '#3B82F6',
  weekly_hours integer NOT NULL DEFAULT 2,
  teacher_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  available_days text[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  room_type text DEFAULT 'Classroom',
  capacity integer DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create time_slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_number integer NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(period_number)
);

-- Create timetable_entries table
CREATE TABLE IF NOT EXISTS timetable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  time_slot_id uuid NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  day_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(room_id, day_name, time_slot_id),
  UNIQUE(teacher_id, day_name, time_slot_id),
  UNIQUE(subject_id, day_name, time_slot_id)
);

-- Enable RLS on all tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for demo - public access)
CREATE POLICY "subjects_read" ON subjects FOR SELECT TO public USING (true);
CREATE POLICY "subjects_insert" ON subjects FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "subjects_update" ON subjects FOR UPDATE TO public WITH CHECK (true);
CREATE POLICY "subjects_delete" ON subjects FOR DELETE TO public USING (true);

CREATE POLICY "teachers_read" ON teachers FOR SELECT TO public USING (true);
CREATE POLICY "teachers_insert" ON teachers FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "teachers_update" ON teachers FOR UPDATE TO public WITH CHECK (true);
CREATE POLICY "teachers_delete" ON teachers FOR DELETE TO public USING (true);

CREATE POLICY "rooms_read" ON rooms FOR SELECT TO public USING (true);
CREATE POLICY "rooms_insert" ON rooms FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "rooms_update" ON rooms FOR UPDATE TO public WITH CHECK (true);
CREATE POLICY "rooms_delete" ON rooms FOR DELETE TO public USING (true);

CREATE POLICY "time_slots_read" ON time_slots FOR SELECT TO public USING (true);
CREATE POLICY "time_slots_insert" ON time_slots FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "time_slots_update" ON time_slots FOR UPDATE TO public WITH CHECK (true);
CREATE POLICY "time_slots_delete" ON time_slots FOR DELETE TO public USING (true);

CREATE POLICY "timetable_read" ON timetable_entries FOR SELECT TO public USING (true);
CREATE POLICY "timetable_insert" ON timetable_entries FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "timetable_update" ON timetable_entries FOR UPDATE TO public WITH CHECK (true);
CREATE POLICY "timetable_delete" ON timetable_entries FOR DELETE TO public USING (true);
