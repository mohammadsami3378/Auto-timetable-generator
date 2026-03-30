export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface Subject {
  id: string;
  name: string;
  teacher: string;
  weeklyHours: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  color: string;
}

export interface TimeSlot {
  id: string;
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "10:00"
  isBreak: boolean;
  label?: string;    // e.g., "Lunch Break"
}

export interface ScheduleConfig {
  days: Day[];
  timeSlots: TimeSlot[];
  subjects: Subject[];
}

export interface ScheduledCell {
  subjectId: string;
  subjectName: string;
  teacher: string;
  color: string;
}

export interface Timetable {
  id: string;
  name: string;
  createdAt: number;
  config: ScheduleConfig;
  grid: {
    [day: string]: {
      [timeSlotId: string]: ScheduledCell | null;
    };
  };
}
