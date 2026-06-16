import { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Subject, Teacher, Room, TimeSlot, TimetableEntry } from '../lib/supabase';
import { fetchSubjects, fetchTeachers, fetchRooms, fetchTimeSlots, fetchTimetableEntries, clearTimetable, addTimetableEntry } from '../lib/api';
import { TimetableScheduler, ScheduleSlot, ScheduleConflict } from '../lib/scheduler';

export default function Timetable() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
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
      setError('');
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (subjects.length === 0) {
      setError('Please add at least one subject');
      return;
    }
    if (teachers.length === 0) {
      setError('Please add at least one teacher');
      return;
    }
    if (rooms.length === 0) {
      setError('Please add at least one room');
      return;
    }
    if (timeSlots.length === 0) {
      setError('Please add at least one time slot');
      return;
    }

    try {
      setGenerating(true);
      setError('');

      // Clear old schedule
      await clearTimetable();

      // Generate new schedule
      const scheduler = new TimetableScheduler(subjects, teachers, rooms, timeSlots);
      const { schedule, conflicts: scheduleConflicts } = scheduler.generate();

      setConflicts(scheduleConflicts);

      // Save schedule to database
      for (const slot of schedule) {
        await addTimetableEntry(slot.subject.id, slot.teacher.id, slot.room.id, slot.timeSlot.id, slot.day);
      }

      await loadData();
    } catch (err) {
      setError('Failed to generate timetable');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  // Create a map of entries for easy lookup
  const entryMap = new Map<string, TimetableEntry>();
  entries.forEach(entry => {
    const key = `${entry.day}-${entry.time_slot_id}`;
    entryMap.set(key, entry);
  });

  // Get enriched schedule data
  const schedule = entries.map(entry => {
    const subject = subjects.find(s => s.id === entry.subject_id);
    const teacher = teachers.find(t => t.id === entry.teacher_id);
    const room = rooms.find(r => r.id === entry.room_id);
    const timeSlot = timeSlots.find(ts => ts.id === entry.time_slot_id);
    return { subject, teacher, room, timeSlot, entry };
  }).filter(item => item.subject && item.teacher && item.room && item.timeSlot);

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      {conflicts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-2 items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-2">Scheduling Conflicts ({conflicts.length}):</p>
              <ul className="space-y-1">
                {conflicts.map((conflict, i) => (
                  <li key={i}>• {conflict.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Class Schedule</h3>
          <p className="text-sm text-gray-600 mt-1">{schedule.length} classes scheduled</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Generating...' : 'Generate Timetable'}
        </button>
      </div>

      {/* Timetable Grid */}
      {schedule.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Time</th>
                  {days.map(day => (
                    <th key={day} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(timeSlot => (
                  <tr key={timeSlot.id} className="border-b border-gray-200 last:border-b-0">
                    <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-200 whitespace-nowrap">
                      <div className="text-xs">{timeSlot.start_time}</div>
                      <div className="text-xs text-gray-500">to {timeSlot.end_time}</div>
                    </td>
                    {days.map(day => {
                      const daySchedule = schedule.filter(s => s.entry.day_name === day && s.timeSlot?.id === timeSlot.id);
                      const slot = daySchedule[0];

                      return (
                        <td
                          key={`${day}-${timeSlot.id}`}
                          className="px-4 py-3 text-center border-r border-gray-200 last:border-r-0 min-w-48"
                        >
                          {slot ? (
                            <div
                              className="p-3 rounded-lg text-white text-sm cursor-pointer hover:shadow-md transition-shadow"
                              style={{ backgroundColor: slot.subject?.color }}
                            >
                              <div className="font-semibold">{slot.subject?.name}</div>
                              <div className="text-xs opacity-90 mt-1">{slot.teacher?.name}</div>
                              <div className="text-xs opacity-75 mt-1">{slot.room?.name}</div>
                            </div>
                          ) : (
                            <div className="text-gray-300 text-xs py-8">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600 mb-4">No timetable generated yet</p>
          <button
            onClick={handleGenerate}
            className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Generate Timetable Now
          </button>
        </div>
      )}

      {/* Schedule Summary */}
      {schedule.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{schedule.length}</div>
            <div className="text-sm text-gray-600">Total Classes</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{new Set(schedule.map(s => s.subject?.id)).size}</div>
            <div className="text-sm text-gray-600">Subjects Scheduled</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-orange-600">{new Set(schedule.map(s => s.room?.id)).size}</div>
            <div className="text-sm text-gray-600">Rooms in Use</div>
          </div>
        </div>
      )}
    </div>
  );
}
