export type TaskColorKey = 
  | 'blue'
  | 'emerald'
  | 'violet'
  | 'amber'
  | 'rose'
  | 'cyan'
  | 'indigo';

export interface Project {
  id: string;
  name: string;
  color: TaskColorKey;
  description?: string;
}

export interface Task {
  id: string;
  projectId: string; // Belongs to a specific project
  name: string;
  startHour: number; // 8 to 21
  duration: number;  // minimum 1, max (22 - startHour)
  color?: TaskColorKey; // optional override, defaults to project.color
  notes?: string;
  trackIndex?: number;
}

export interface TaskColorMeta {
  key: TaskColorKey;
  label: string;
  bg: string;
  border: string;
  text: string;
  badge: string;
  glow: string;
}

export interface DaySchedule {
  id: string;
  label: string; // e.g. "Day 1"
  dateString?: string;
  tasks: Task[];
}

export type DragMode = 'move' | 'resize-start' | 'resize-end' | null;

export interface ActiveDragInfo {
  dayId: string;
  taskId: string;
  mode: DragMode;
  startX: number;
  originalStart: number;
  originalDuration: number;
  currentStart: number;
  currentDuration: number;
}

export type ZoomLevel = 'compact' | 'normal' | 'spacious';
export type ViewGroupingMode = 'continuous' | 'by-day' | 'by-project';
