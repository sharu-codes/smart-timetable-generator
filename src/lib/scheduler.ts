import { Subject, Teacher, Room, TimeSlot } from './supabase';

export interface ScheduleSlot {
  subject: Subject;
  teacher: Teacher;
  room: Room;
  timeSlot: TimeSlot;
  day: string;
}

export interface ScheduleConflict {
  type: 'teacher_conflict' | 'room_conflict' | 'subject_not_scheduled';
  message: string;
  subject?: Subject;
}

export class TimetableScheduler {
  private subjects: Subject[];
  private teachers: Teacher[];
  private rooms: Room[];
  private timeSlots: TimeSlot[];
  private schedule: ScheduleSlot[] = [];
  private conflicts: ScheduleConflict[] = [];

  constructor(subjects: Subject[], teachers: Teacher[], rooms: Room[], timeSlots: TimeSlot[]) {
    this.subjects = subjects;
    this.teachers = teachers;
    this.rooms = rooms;
    this.timeSlots = timeSlots.sort((a, b) => a.period_number - b.period_number);
  }

  generate(): { schedule: ScheduleSlot[]; conflicts: ScheduleConflict[] } {
    this.schedule = [];
    this.conflicts = [];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const subjectsToSchedule = [...this.subjects];

    // Sort subjects by weekly hours (descending) to schedule harder subjects first
    subjectsToSchedule.sort((a, b) => b.weekly_hours - a.weekly_hours);

    for (const subject of subjectsToSchedule) {
      let scheduled = 0;
      const targetHours = subject.weekly_hours;

      // Try to schedule each required hour
      for (let hour = 0; hour < targetHours; hour++) {
        let slotFound = false;

        // Try to find available slot for this hour
        for (const day of days) {
          if (slotFound) break;

          for (const timeSlot of this.timeSlots) {
            if (this.canSchedule(subject, day, timeSlot)) {
              const teacher = this.teachers.find(t => t.id === subject.teacher_id);
              const room = this.getAvailableRoom(day, timeSlot);

              if (teacher && room) {
                this.schedule.push({ subject, teacher, room, timeSlot, day });
                scheduled++;
                slotFound = true;
                break;
              }
            }
          }
        }

        if (!slotFound) {
          break;
        }
      }

      // Check if all hours were scheduled
      if (scheduled < targetHours) {
        this.conflicts.push({
          type: 'subject_not_scheduled',
          message: `Only ${scheduled}/${targetHours} hours scheduled for ${subject.name}`,
          subject,
        });
      }
    }

    return { schedule: this.schedule, conflicts: this.conflicts };
  }

  private canSchedule(subject: Subject, day: string, timeSlot: TimeSlot): boolean {
    const teacher = this.teachers.find(t => t.id === subject.teacher_id);
    if (!teacher) return false;

    // Check if teacher is available on this day
    if (!teacher.available_days.includes(day)) {
      return false;
    }

    // Check if teacher is already scheduled at this time
    if (this.isTeacherBusy(teacher.id, day, timeSlot.id)) {
      return false;
    }

    // Check if subject is already scheduled at this time (avoid duplicate sessions)
    if (this.isSubjectScheduled(subject.id, day, timeSlot.id)) {
      return false;
    }

    return true;
  }

  private isTeacherBusy(teacherId: string, day: string, timeSlotId: string): boolean {
    return this.schedule.some(
      slot => slot.teacher.id === teacherId && slot.day === day && slot.timeSlot.id === timeSlotId
    );
  }

  private isSubjectScheduled(subjectId: string, day: string, timeSlotId: string): boolean {
    return this.schedule.some(
      slot => slot.subject.id === subjectId && slot.day === day && slot.timeSlot.id === timeSlotId
    );
  }

  private getAvailableRoom(day: string, timeSlot: TimeSlot): Room | undefined {
    // Find a room that's not already in use at this time
    for (const room of this.rooms) {
      const isRoomBusy = this.schedule.some(
        slot => slot.room.id === room.id && slot.day === day && slot.timeSlot.id === timeSlot.id
      );
      if (!isRoomBusy) {
        return room;
      }
    }
    return undefined;
  }
}
