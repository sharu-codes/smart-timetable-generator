import { useEffect, useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { TimeSlot } from '../lib/supabase';
import { fetchTimeSlots, addTimeSlot, deleteTimeSlot } from '../lib/api';

export default function TimeSlots() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ period_number: 1, start_time: '08:00', end_time: '09:00' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchTimeSlots();
      setTimeSlots(data);
      setError('');
    } catch (err) {
      setError('Failed to load time slots');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addTimeSlot(formData.period_number, formData.start_time, formData.end_time);
      setFormData({ period_number: Math.max(...timeSlots.map(t => t.period_number), 0) + 1, start_time: '08:00', end_time: '09:00' });
      await loadData();
    } catch (err) {
      setError('Failed to add time slot');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteTimeSlot(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete time slot');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Time Slot</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Period Number</label>
              <input
                type="number"
                min="1"
                value={formData.period_number}
                onChange={e => setFormData({ ...formData, period_number: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Time Slot
          </button>
        </form>
      </div>

      {/* Time Slots List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">School Day Schedule ({timeSlots.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Period</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Start Time</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">End Time</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {timeSlots.map(slot => {
                const startDate = new Date(`2000-01-01 ${slot.start_time}`);
                const endDate = new Date(`2000-01-01 ${slot.end_time}`);
                const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

                return (
                  <tr key={slot.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Period {slot.period_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{slot.start_time}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{slot.end_time}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{duration} minutes</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
