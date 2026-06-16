import { useEffect, useState } from 'react';
import { BarChart3, BookOpen, Users, DoorOpen, RefreshCw } from 'lucide-react';
import { Subject, Teacher, Room, TimeSlot, TimetableEntry } from '../lib/supabase';
import { fetchSubjects, fetchTeachers, fetchRooms, fetchTimeSlots, fetchTimetableEntries, clearTimetable, addTimetableEntry } from '../lib/api';
import { TimetableScheduler, ScheduleSlot, ScheduleConflict } from '../lib/scheduler';

export default function Dashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsData, teachersData, roomsData, timeSlotsData, entriesData] = await Promise.all([
        fetchSubjects(),
        fetchTeachers(),
        fetchRooms(),
        fetchTimeSlots(),
        fetchTimetableEntries(),
      ]);
      setSubjects(subjectsData);
      setTeachers(teachersData);
      setRooms(roomsData);
      setTimeSlots(timeSlotsData);
      setEntries(entriesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGenerate = async () => {
    if (subjects.length === 0 || teachers.length === 0 || rooms.length === 0 || timeSlots.length === 0) {
      alert('Please set up subjects, teachers, rooms, and time slots first');
      return;
    }

    try {
      setGenerating(true);

      await clearTimetable();

      const scheduler = new TimetableScheduler(subjects, teachers, rooms, timeSlots);
      const { schedule: newSchedule, conflicts: scheduleConflicts } = scheduler.generate();

      setSchedule(newSchedule);
      setConflicts(scheduleConflicts);

      for (const slot of newSchedule) {
        await addTimetableEntry(slot.subject.id, slot.teacher.id, slot.room.id, slot.timeSlot.id, slot.day);
      }

      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // Calculate stats
  const totalHoursNeeded = subjects.reduce((sum, s) => sum + s.weekly_hours, 0);
  const totalHoursScheduled = entries.length;
  const coveragePercentage = totalHoursNeeded > 0 ? Math.round((totalHoursScheduled / totalHoursNeeded) * 100) : 0;
  const scheduledSubjects = new Set(entries.map(e => e.subject_id)).size;

  // Get mini schedule for today (Monday as default)
  const todaySchedule = entries
    .filter(e => e.day_name === 'Monday')
    .slice(0, 4)
    .map(entry => {
      const subject = subjects.find(s => s.id === entry.subject_id);
      const teacher = teachers.find(t => t.id === entry.teacher_id);
      const room = rooms.find(r => r.id === entry.room_id);
      const timeSlot = timeSlots.find(ts => ts.id === entry.time_slot_id);
      return { subject, teacher, room, timeSlot };
    })
    .filter(item => item.subject && item.teacher && item.room && item.timeSlot);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 text-sm font-medium">Subjects</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{subjects.length}</div>
            </div>
            <BookOpen className="w-12 h-12 text-blue-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 text-sm font-medium">Teachers</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{teachers.length}</div>
            </div>
            <Users className="w-12 h-12 text-green-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 text-sm font-medium">Rooms</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{rooms.length}</div>
            </div>
            <DoorOpen className="w-12 h-12 text-orange-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 text-sm font-medium">Time Slots</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{timeSlots.length}</div>
            </div>
            <BarChart3 className="w-12 h-12 text-purple-100" />
          </div>
        </div>
      </div>

      {/* Schedule Coverage */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Schedule Coverage</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Weekly Hours Scheduled</span>
              <span className="text-sm font-bold text-gray-900">{totalHoursScheduled} / {totalHoursNeeded} hours</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(coveragePercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">{coveragePercentage}% coverage</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-700 font-medium">Subjects Scheduled</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{scheduledSubjects}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-700 font-medium">Total Classes</div>
              <div className="text-2xl font-bold text-green-900 mt-1">{entries.length}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-orange-700 font-medium">Rooms in Use</div>
              <div className="text-2xl font-bold text-orange-900 mt-1">{new Set(entries.map(e => e.room_id)).size}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {entries.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-8 text-center">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">Ready to Generate a Timetable?</h3>
          <p className="text-blue-800 mb-6">Set up your subjects, teachers, rooms, and time slots, then generate an automatic schedule.</p>
          <button
            onClick={handleQuickGenerate}
            disabled={generating || subjects.length === 0 || teachers.length === 0}
            className="bg-blue-600 text-white py-2 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating...' : 'Generate Schedule Now'}
          </button>
        </div>
      )}

      {/* Mini Schedule Preview */}
      {entries.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monday Preview</h3>
          <div className="space-y-3">
            {todaySchedule.length > 0 ? (
              todaySchedule.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                  <div
                    className="w-1 h-12 rounded-full"
                    style={{ backgroundColor: item.subject?.color }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.subject?.name}</div>
                    <div className="text-sm text-gray-600">{item.teacher?.name} • {item.room?.name}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {item.timeSlot?.start_time} - {item.timeSlot?.end_time}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-sm">No classes scheduled for Monday</p>
            )}
          </div>
        </div>
      )}

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-3">Scheduling Issues</h3>
          <ul className="space-y-2">
            {conflicts.map((conflict, idx) => (
              <li key={idx} className="text-sm text-red-800">• {conflict.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
