import { START_HOUR, OVERTIME_HOUR, END_HOUR } from '../constants';
import { Task } from '../types';

export function formatHour(hour: number): string {
  const integerPart = Math.floor(hour);
  const minutes = Math.round((hour - integerPart) * 60);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(integerPart)}:${pad(minutes)}`;
}

export function formatTimeRange(startHour: number, duration: number): string {
  return `${formatHour(startHour)} - ${formatHour(startHour + duration)}`;
}

/**
 * Formats duration nicely (e.g. 1h, 1.5h, 0.5h)
 */
export function formatDuration(duration: number): string {
  return `${duration} 小時`;
}

/**
 * Breaks down the hours of a task into normal hours (8-18) and overtime hours (18-22)
 */
export function calculateTaskHours(startHour: number, duration: number): {
  normalHours: number;
  overtimeHours: number;
} {
  const endHour = startHour + duration;
  
  // Normal range: [START_HOUR, OVERTIME_HOUR]
  // Overtime range: [OVERTIME_HOUR, END_HOUR]
  const normalStart = Math.max(startHour, START_HOUR);
  const normalEnd = Math.min(endHour, OVERTIME_HOUR);
  const normalHours = Math.max(0, normalEnd - normalStart);

  const otStart = Math.max(startHour, OVERTIME_HOUR);
  const otEnd = Math.min(endHour, END_HOUR);
  const overtimeHours = Math.max(0, otEnd - otStart);

  return {
    normalHours: Math.round(normalHours * 10) / 10,
    overtimeHours: Math.round(overtimeHours * 10) / 10,
  };
}

/**
 * Assigns tasks to horizontal tracks (lanes) within a day to prevent visual collision.
 * Tasks that do not overlap share the same track (0, 1, 2, ...).
 */
export function assignTracksToTasks(tasks: Task[]): { positionedTasks: Task[]; maxTrack: number } {
  if (tasks.length === 0) {
    return { positionedTasks: [], maxTrack: 0 };
  }

  // Sort tasks by startHour ascending, then by duration descending
  const sorted = [...tasks].sort((a, b) => {
    if (a.startHour !== b.startHour) return a.startHour - b.startHour;
    return b.duration - a.duration;
  });

  // Track the endHour of the last task placed on each lane
  const trackEndTimes: number[] = [];
  const positionedTasks: Task[] = [];

  for (const task of sorted) {
    let assignedTrack = -1;

    for (let i = 0; i < trackEndTimes.length; i++) {
      // If previous task ended at or before this task starts, we can reuse this track
      if (trackEndTimes[i] <= task.startHour) {
        assignedTrack = i;
        trackEndTimes[i] = task.startHour + task.duration;
        break;
      }
    }

    if (assignedTrack === -1) {
      // Need a new lane
      assignedTrack = trackEndTimes.length;
      trackEndTimes.push(task.startHour + task.duration);
    }

    positionedTasks.push({
      ...task,
      trackIndex: assignedTrack,
    });
  }

  const maxTrack = trackEndTimes.length > 0 ? trackEndTimes.length - 1 : 0;
  return { positionedTasks, maxTrack };
}

/**
 * Clamps start and duration to valid ranges [START_HOUR, END_HOUR] with 0.5-hour step
 */
export function clampTaskBounds(startHour: number, duration: number): {
  startHour: number;
  duration: number;
} {
  // Round to nearest 0.5
  let safeStart = Math.round(startHour * 2) / 2;
  let safeDuration = Math.round(duration * 2) / 2;

  safeStart = Math.max(START_HOUR, Math.min(END_HOUR - 0.5, safeStart));
  safeDuration = Math.max(0.5, safeDuration);

  if (safeStart + safeDuration > END_HOUR) {
    safeDuration = END_HOUR - safeStart;
  }

  return {
    startHour: safeStart,
    duration: safeDuration,
  };
}
