import {
  START_HOUR,
  WORK_START_HOUR,
  LUNCH_START_HOUR,
  LUNCH_END_HOUR,
  WORK_END_HOUR,
  END_HOUR,
  COLLAPSED_LUNCH_WIDTH,
  COLLAPSED_OVERTIME_WIDTH,
} from '../constants';
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
 * Formats a date string (e.g. "2026-09-18") with weekday (e.g. "9/18 (週五)")
 */
export function formatDateLabel(dateString?: string, fallbackLabel?: string): string {
  if (!dateString) return fallbackLabel || '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
      const weekday = weekdays[d.getDay()];
      return `${month + 1}/${day} (${weekday})`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    return `${d.getMonth() + 1}/${d.getDate()} (${weekdays[d.getDay()]})`;
  } catch {
    return dateString;
  }
}

/**
 * Breaks down the hours of a task:
 * - 正常工時: 08:30 ~ 12:00 (3.5h) 與 13:00 ~ 17:30 (4.5h)，全日共 8.0 小時
 * - 中午休息: 12:00 ~ 13:00 (1.0h) 為休息時間，不計入工時
 * - 加班時段: 17:30 ~ 22:00 (及 08:00 ~ 08:30 提早時段)
 */
export function calculateTaskHours(startHour: number, duration: number): {
  normalHours: number;
  overtimeHours: number;
  lunchBreakHours: number;
  effectiveHours: number;
} {
  const endHour = startHour + duration;

  const overlap = (a: number, b: number, c: number, d: number) => {
    const s = Math.max(a, c);
    const e = Math.min(b, d);
    return Math.max(0, e - s);
  };

  // Normal work: 08:30 - 12:00 (3.5h) + 13:00 - 17:30 (4.5h)
  const morningNormal = overlap(startHour, endHour, WORK_START_HOUR, LUNCH_START_HOUR);
  const afternoonNormal = overlap(startHour, endHour, LUNCH_END_HOUR, WORK_END_HOUR);
  const normalHours = morningNormal + afternoonNormal;

  // Lunch break: 12:00 - 13:00 (rest time, NOT counted in work hours!)
  const lunchBreakHours = overlap(startHour, endHour, LUNCH_START_HOUR, LUNCH_END_HOUR);

  // Overtime: after 17:30 (and any early morning work before 08:30)
  const eveningOvertime = overlap(startHour, endHour, WORK_END_HOUR, END_HOUR);
  const morningEarlyOvertime = overlap(startHour, endHour, START_HOUR, WORK_START_HOUR);
  const overtimeHours = eveningOvertime + morningEarlyOvertime;

  const effectiveHours = normalHours + overtimeHours;

  return {
    normalHours: Math.round(normalHours * 10) / 10,
    overtimeHours: Math.round(overtimeHours * 10) / 10,
    lunchBreakHours: Math.round(lunchBreakHours * 10) / 10,
    effectiveHours: Math.round(effectiveHours * 10) / 10,
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

/**
 * Calculates the total pixel width of a single day, taking into account
 * whether lunch break (12:00-13:00) and overtime (17:30-22:00) are collapsed.
 */
export function getDayWidth(
  hourWidth: number,
  collapseLunch: boolean = false,
  collapseOvertime: boolean = false
): number {
  const morningW = (LUNCH_START_HOUR - START_HOUR) * hourWidth; // 4.0 * hourWidth (08:00 - 12:00)
  const lunchW = collapseLunch ? COLLAPSED_LUNCH_WIDTH : (LUNCH_END_HOUR - LUNCH_START_HOUR) * hourWidth; // 28px or 1.0h
  const afternoonW = (WORK_END_HOUR - LUNCH_END_HOUR) * hourWidth; // 4.5 * hourWidth (13:00 - 17:30)
  const overtimeW = collapseOvertime ? COLLAPSED_OVERTIME_WIDTH : (END_HOUR - WORK_END_HOUR) * hourWidth; // 36px or 4.5h

  return Math.round((morningW + lunchW + afternoonW + overtimeW) * 100) / 100;
}

/**
 * Converts an hour value (e.g. 8.5, 12.0, 13.5, 18.0) to its X pixel offset
 * within a single day canvas, accounting for collapsed lunch and overtime periods.
 */
export function hourToDayX(
  hour: number,
  hourWidth: number,
  collapseLunch: boolean = false,
  collapseOvertime: boolean = false
): number {
  if (hour <= START_HOUR) return 0;

  // Morning segment: [8.0, 12.0]
  if (hour <= LUNCH_START_HOUR) {
    return (hour - START_HOUR) * hourWidth;
  }

  const morningW = (LUNCH_START_HOUR - START_HOUR) * hourWidth; // 4.0 * hourWidth
  const lunchW = collapseLunch ? COLLAPSED_LUNCH_WIDTH : (LUNCH_END_HOUR - LUNCH_START_HOUR) * hourWidth;

  // Lunch break segment: [12.0, 13.0]
  if (hour <= LUNCH_END_HOUR) {
    const progress = (hour - LUNCH_START_HOUR) / (LUNCH_END_HOUR - LUNCH_START_HOUR);
    return morningW + progress * lunchW;
  }

  const afternoonStart = morningW + lunchW;
  const afternoonW = (WORK_END_HOUR - LUNCH_END_HOUR) * hourWidth;

  // Afternoon segment: [13.0, 17.5]
  if (hour <= WORK_END_HOUR) {
    return afternoonStart + (hour - LUNCH_END_HOUR) * hourWidth;
  }

  const overtimeStart = afternoonStart + afternoonW;
  const overtimeW = collapseOvertime ? COLLAPSED_OVERTIME_WIDTH : (END_HOUR - WORK_END_HOUR) * hourWidth;

  // Overtime segment: [17.5, 22.0]
  if (hour <= END_HOUR) {
    const progress = (hour - WORK_END_HOUR) / (END_HOUR - WORK_END_HOUR);
    return overtimeStart + progress * overtimeW;
  }

  return morningW + lunchW + afternoonW + overtimeW;
}

/**
 * Converts a pixel X offset within a day canvas back to an hour value,
 * accurately handling collapsed lunch and overtime segments.
 */
export function dayXToHour(
  x: number,
  hourWidth: number,
  collapseLunch: boolean = false,
  collapseOvertime: boolean = false
): number {
  if (x <= 0) return START_HOUR;

  const morningW = (LUNCH_START_HOUR - START_HOUR) * hourWidth;
  if (x <= morningW) {
    return START_HOUR + x / hourWidth;
  }

  const lunchW = collapseLunch ? COLLAPSED_LUNCH_WIDTH : (LUNCH_END_HOUR - LUNCH_START_HOUR) * hourWidth;
  if (x <= morningW + lunchW) {
    const progress = (x - morningW) / Math.max(1, lunchW);
    return LUNCH_START_HOUR + progress * (LUNCH_END_HOUR - LUNCH_START_HOUR);
  }

  const afternoonStart = morningW + lunchW;
  const afternoonW = (WORK_END_HOUR - LUNCH_END_HOUR) * hourWidth;
  if (x <= afternoonStart + afternoonW) {
    return LUNCH_END_HOUR + (x - afternoonStart) / hourWidth;
  }

  const overtimeStart = afternoonStart + afternoonW;
  const overtimeW = collapseOvertime ? COLLAPSED_OVERTIME_WIDTH : (END_HOUR - WORK_END_HOUR) * hourWidth;
  if (x <= overtimeStart + overtimeW) {
    const progress = (x - overtimeStart) / Math.max(1, overtimeW);
    return WORK_END_HOUR + progress * (END_HOUR - WORK_END_HOUR);
  }

  return END_HOUR;
}

/**
 * Calculates a task's visual Left and Width (in pixels) within a day canvas
 */
export function getTaskPositionAndWidth(
  startHour: number,
  duration: number,
  hourWidth: number,
  collapseLunch: boolean = false,
  collapseOvertime: boolean = false
): { left: number; width: number } {
  const startX = hourToDayX(startHour, hourWidth, collapseLunch, collapseOvertime);
  const endX = hourToDayX(startHour + duration, hourWidth, collapseLunch, collapseOvertime);

  const rawWidth = Math.max(0, endX - startX);
  const minBlockWidth = 24; // Ensure minimum grabbable & visible width
  const width = Math.max(minBlockWidth, rawWidth - 6);
  const left = startX + 3;

  return { left, width };
}

