import React from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import { Project, DaySchedule, Task } from '../types';
import { START_HOUR, OVERTIME_HOUR, END_HOUR, TOTAL_HOURS, COLOR_OPTIONS } from '../constants';
import { calculateTaskHours, assignTracksToTasks } from '../utils/time';
import { TaskBlock } from './TaskBlock';

interface ContinuousProjectRowProps {
  project: Project;
  days: DaySchedule[];
  hourWidth: number;
  sidebarWidth: number;
  onAddTaskToDay: (dayId: string, startHour: number, projectId: string) => void;
  onUpdateTask: (dayId: string, taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (dayId: string, taskId: string) => void;
  onOpenEditModal: (dayId: string, task: Task) => void;
  onMoveTaskAcrossDays: (
    fromDayId: string,
    toDayId: string,
    taskId: string,
    newStartHour: number,
    newDuration?: number
  ) => void;
}

const TASK_ROW_HEIGHT = 44;

export const ContinuousProjectRow: React.FC<ContinuousProjectRowProps> = ({
  project,
  days,
  hourWidth,
  sidebarWidth,
  onAddTaskToDay,
  onUpdateTask,
  onDeleteTask,
  onOpenEditModal,
  onMoveTaskAcrossDays,
}) => {
  const dayWidth = TOTAL_HOURS * hourWidth;
  const totalTimelineWidth = days.length * dayWidth;

  // Aggregate project tasks and compute max track height needed
  let totalTasksCount = 0;
  let totalNormalHours = 0;
  let totalOvertimeHours = 0;
  let overallMaxTrack = 0;

  // Map each day's positioned tasks
  const daysPositionedTasks: { dayId: string; dayIndex: number; tasks: Task[] }[] = [];

  days.forEach((day, dIdx) => {
    const projTasks = day.tasks.filter((t) => t.projectId === project.id);
    totalTasksCount += projTasks.length;

    projTasks.forEach((t) => {
      const { normalHours, overtimeHours } = calculateTaskHours(t.startHour, t.duration);
      totalNormalHours += normalHours;
      totalOvertimeHours += overtimeHours;
    });

    const { positionedTasks, maxTrack } = assignTracksToTasks(projTasks);
    if (positionedTasks.length > 0 && maxTrack > overallMaxTrack) {
      overallMaxTrack = maxTrack;
    }

    daysPositionedTasks.push({
      dayId: day.id,
      dayIndex: dIdx,
      tasks: positionedTasks,
    });
  });

  const rowHeightPx = Math.max(68, (overallMaxTrack + 1) * (TASK_ROW_HEIGHT + 8) + 12);
  const colorMeta = COLOR_OPTIONS[project.color] || COLOR_OPTIONS.blue;

  // Click on the continuous timeline canvas to add task
  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      (e.target as HTMLElement).closest('.task-bar-item') ||
      (e.target as HTMLElement).closest('.task-action-btn') ||
      (e.target as HTMLElement).closest('.resize-handle')
    ) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    // Which day was clicked?
    const targetDayIndex = Math.floor(clickX / dayWidth);
    const clampedDayIndex = Math.max(0, Math.min(days.length - 1, targetDayIndex));
    const dayOffsetX = clickX - clampedDayIndex * dayWidth;

    // Snap to 30-min precision (0.5 hour)
    const halfHourWidth = hourWidth / 2;
    const halfSteps = Math.floor(dayOffsetX / halfHourWidth);
    const clickedHour = START_HOUR + halfSteps * 0.5;
    const safeHour = Math.max(START_HOUR, Math.min(END_HOUR - 0.5, clickedHour));

    const targetDayId = days[clampedDayIndex].id;
    onAddTaskToDay(targetDayId, safeHour, project.id);
  };

  return (
    <div className="flex hover:bg-slate-900/40 transition-colors group/projrow relative border-b border-slate-800">
      {/* Left Sticky Sidebar: Project Information */}
      <div
        style={{ width: sidebarWidth }}
        className="sticky left-0 bg-slate-900/98 border-r border-slate-800 p-3 flex flex-col justify-between z-20 shadow-md backdrop-blur-xs flex-shrink-0"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${colorMeta.bg}`} />
            <span
              className="font-bold text-xs sm:text-sm text-white truncate tracking-tight"
              title={project.name}
            >
              {project.name}
            </span>
          </div>

          {/* Project statistics across all days */}
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700/60 font-mono">
              全期 {totalTasksCount} 項
            </span>
            {totalNormalHours > 0 && (
              <span className="text-sky-400 font-mono">
                常{totalNormalHours}h
              </span>
            )}
            {totalOvertimeHours > 0 && (
              <span className="text-amber-400 font-bold font-mono">
                加{totalOvertimeHours}h
              </span>
            )}
          </div>
        </div>

        {/* Add item button */}
        <div className="mt-2 pt-1 border-t border-slate-800/60 flex items-center justify-between">
          <button
            onClick={() => onAddTaskToDay(days[0]?.id || '', 9, project.id)}
            className="text-[11px] font-medium text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/30 px-1.5 py-0.5 rounded transition flex items-center gap-1"
            title={`新增項目至 ${project.name}`}
          >
            <Plus className="w-3 h-3 text-indigo-400" />
            <span>新增項目</span>
          </button>
          <span className="text-[10px] text-slate-500 font-mono">
            點格新增
          </span>
        </div>
      </div>

      {/* Right Continuous Timeline Canvas across all Days */}
      <div
        style={{
          width: totalTimelineWidth,
          height: `${rowHeightPx}px`,
        }}
        onClick={handleGridClick}
        className="relative flex-shrink-0 cursor-pointer overflow-hidden select-none"
        title={`點擊此列任意時間格，即可直接新增項目至「${project.name}」`}
      >
        {/* Background day slices and vertical gridlines */}
        <div className="absolute inset-0 flex pointer-events-none">
          {days.map((day, dIdx) => (
            <div
              key={day.id}
              style={{ width: dayWidth }}
              className="flex-shrink-0 h-full flex relative border-r-2 border-indigo-500/50"
            >
              {/* Hourly vertical cells */}
              {Array.from({ length: TOTAL_HOURS }).map((_, i) => {
                const hour = START_HOUR + i;
                const isOvertime = hour >= OVERTIME_HOUR;

                return (
                  <div
                    key={hour}
                    style={{ width: hourWidth }}
                    className={`flex-shrink-0 h-full border-r border-slate-800/60 relative ${
                      isOvertime
                        ? 'bg-amber-950/10 group-hover/projrow:bg-amber-950/20'
                        : 'bg-slate-950/30 group-hover/projrow:bg-slate-900/30'
                    }`}
                  >
                    {/* 30-minute midpoint subtle dashed guideline */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-r border-dashed border-slate-800/40 pointer-events-none" />

                    {/* Overtime dividing line */}
                    {hour === OVERTIME_HOUR && (
                      <div className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-amber-500/70 z-10" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Tasks Container positioned on the continuous canvas */}
        <div className="absolute inset-0 pointer-events-none">
          {daysPositionedTasks.map(({ dayId, dayIndex, tasks }) =>
            tasks.map((task) => (
              <div key={task.id} className="task-bar-item pointer-events-auto">
                <TaskBlock
                  task={task}
                  dayId={dayId}
                  dayIndex={dayIndex}
                  continuousDays={days}
                  hourWidth={hourWidth}
                  rowHeight={TASK_ROW_HEIGHT}
                  onUpdateTask={onUpdateTask}
                  onDeleteTask={onDeleteTask}
                  onOpenEditModal={onOpenEditModal}
                  onMoveTaskAcrossDays={onMoveTaskAcrossDays}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
