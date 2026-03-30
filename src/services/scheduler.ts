import { Day, ScheduleConfig, Timetable, ScheduledCell, Subject } from '../types';

/**
 * A constraint-based scheduling algorithm for generating timetables.
 */
export class Scheduler {
  private config: ScheduleConfig;

  constructor(config: ScheduleConfig) {
    this.config = config;
  }

  public generate(): Timetable | null {
    const { days, timeSlots, subjects } = this.config;
    const grid: Timetable['grid'] = {};

    // Initialize grid
    days.forEach(day => {
      grid[day] = {};
      timeSlots.forEach(slot => {
        grid[day][slot.id] = null;
      });
    });

    // Track remaining hours for each subject
    const remainingHours = new Map<string, number>();
    subjects.forEach(s => remainingHours.set(s.id, s.weeklyHours));

    // Track teacher availability per slot
    const teacherSlots = new Map<string, Set<string>>(); // "teacher-day-slotId" -> boolean

    // Sort subjects by difficulty (Hard first) to prioritize morning slots
    const sortedSubjects = [...subjects].sort((a, b) => {
      const difficultyMap = { 'Hard': 3, 'Medium': 2, 'Easy': 1 };
      return difficultyMap[b.difficulty] - difficultyMap[a.difficulty];
    });

    // Strategy: Distribute subjects across days
    // For each subject, try to find slots
    for (const subject of sortedSubjects) {
      let hoursToAssign = subject.weeklyHours;
      
      // Try to assign at most 2 hours per day for the same subject to ensure even distribution
      const maxHoursPerDay = Math.ceil(subject.weeklyHours / days.length) + 1;

      // Shuffle days to avoid bias
      const shuffledDays = [...days].sort(() => Math.random() - 0.5);

      for (const day of shuffledDays) {
        if (hoursToAssign <= 0) break;
        
        let assignedToday = 0;
        
        // For difficult subjects, prioritize earlier slots
        const slotsToTry = subject.difficulty === 'Hard' 
          ? [...timeSlots] // Natural order (morning first)
          : [...timeSlots].sort(() => Math.random() - 0.5); // Random order for others

        for (const slot of slotsToTry) {
          if (hoursToAssign <= 0 || assignedToday >= maxHoursPerDay) break;
          if (slot.isBreak) continue;
          if (grid[day][slot.id]) continue; // Already occupied

          // Check teacher conflict
          const teacherKey = `${subject.teacher}-${day}-${slot.id}`;
          if (teacherSlots.has(teacherKey)) continue;

          // Assign
          grid[day][slot.id] = {
            subjectId: subject.id,
            subjectName: subject.name,
            teacher: subject.teacher,
            color: subject.color
          };
          
          teacherSlots.set(teacherKey, new Set());
          hoursToAssign--;
          assignedToday++;
        }
      }
      
      // If still hours left, try again without the maxHoursPerDay constraint
      if (hoursToAssign > 0) {
        for (const day of shuffledDays) {
          if (hoursToAssign <= 0) break;
          for (const slot of timeSlots) {
            if (hoursToAssign <= 0) break;
            if (slot.isBreak || grid[day][slot.id]) continue;
            
            const teacherKey = `${subject.teacher}-${day}-${slot.id}`;
            if (teacherSlots.has(teacherKey)) continue;

            grid[day][slot.id] = {
              subjectId: subject.id,
              subjectName: subject.name,
              teacher: subject.teacher,
              color: subject.color
            };
            teacherSlots.set(teacherKey, new Set());
            hoursToAssign--;
          }
        }
      }
    }

    return {
      id: crypto.randomUUID(),
      name: `Timetable ${new Date().toLocaleDateString()}`,
      createdAt: Date.now(),
      config: this.config,
      grid
    };
  }
}
