import React from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import { Project, DaySchedule, Task } from '../types';
import { 
  START_HOUR, 
  OVERTIME_HOUR, 
  END_HOUR, 
  TOTAL_HOURS, 
  COLOR_OPTIONS,
  COLLAPSED_LUNCH_WIDTH,
  COLLAPSED_OVERTIME_WIDTH,
  MORNING_SLOTS,
  AFTERNOON_SLOTS,
  OVERTIME_SLOTS
} from '../constants';
import { calculateTaskHours, assignTracksToTasks, getDayWidth, dayXToHour } from '../utils/time';
import { TaskBlock } from './TaskBlock';

interface ContinuousProjectRowProps {
  project: Project;
  days: DaySchedule[];
  hourWidth: number;
  sidebarWidth: number;
  collapseLunch?: boolean;
  collapseOvertime?: boolean;
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
  onDuplicateProject?: (projectId: string) => void;
  onExportProject?: (projectId: string) => void;
}

const TASK_ROW_HEIGHT = 44;

export const ContinuousProjectRow: React.FC<ContinuousProjectRowProps> = ({
  project,
  days,
  hourWidth,
  sidebarWidth,
  collapseLunch = false,
  collapseOvertime = false,
  onAddTaskToDay,
  onUpdateTask,
  onDeleteTask,
  onOpenEditModal,
  onMoveTaskAcrossDays,
  onDuplicateProject,
  onExportProject,
}) => {
  const dayWidth = getDayWidth(hourWidth, collapseLunch, collapseOvertime);
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

    const clickedHour = dayXToHour(dayOffsetX, hourWidth, collapseLunch, collapseOvertime);
    const safeHour = Math.max(START_HOUR, Math.min(END_HOUR - 0.5, clickedHour));

    const targetDayId = days[clampedDayIndex].id;
    onAddTaskToDay(targetDayId, safeHour, project.id);
  };

  return (
    <div className="flex hover:bg-slate-50/70 transition-colors group/projrow relative border-b border-slate-200">
      {/* Left Sticky Sidebar: Project Information */}
      <div
        style={{ width: sidebarWidth }}
        className="sticky left-0 bg-white/98 border-r border-slate-200 p-3 flex flex-col justify-between z-20 shadow-xs backdrop-blur-xs flex-shrink-0"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${colorMeta.bg}`} />
          <span
            className="font-bold text-xs sm:text-sm text-slate-900 truncate tracking-tight"
            title={project.name}
          >
            {project.name}
          </span>
        </div>

        {/* Add item button */}
        <div className="mt-2 pt-1 border-t border-slate-100 flex items-center">
          <button
            onClick={() => onAddTaskToDay(days[0]?.id || '', 9, project.id)}
            className="text-[11px] font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-1.5 py-0.5 rounded transition flex items-center gap-1"
            title={`新增項目至 ${project.name}`}
          >
            <Plus className="w-3 h-3 text-indigo-600" />
            <span>新增項目</span>
          </button>
        </div>
      </div>

      {/* Right Continuous Timeline Canvas across all Days */}
      <div
        style={{
          width: totalTimelineWidth,
          height: `${rowHeightPx}px`,
        }}
        onClick={handleGridClick}
        className="relative flex-shrink-0 cursor-pointer overflow-hidden select-none bg-white"
        title={`點擊此列任意時間格，即可直接新增項目至「${project.name}」`}
      >
        {/* Background day slices and vertical gridlines */}
        <div className="absolute inset-0 flex pointer-events-none">
          {days.map((day, dIdx) => (
            <div
              key={day.id}
              style={{ width: dayWidth }}
              className="flex-shrink-0 h-full flex relative border-r-2 border-indigo-300"
            >
              {/* Morning Hours: 08:30 (0.5h), 09:00 (1h), 10:00 (1h), 11:00 (1h) */}
              {MORNING_SLOTS.map((slot) => (
                <div
                  key={slot.hour}
                  style={{ width: slot.span * hourWidth }}
                  className={`flex-shrink-0 h-full border-r ${
                    slot.hour === 8.5
                      ? 'border-sky-200 bg-sky-50/30'
                      : 'border-slate-200/80 bg-white'
                  } relative group-hover/projrow:bg-slate-50/40`}
                >
                  {slot.hasMidTick && (
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-r border-dashed border-slate-200 pointer-events-none" />
                  )}
                </div>
              ))}

              {/* Lunch Hour (12:00 - 13:00) */}
              {collapseLunch ? (
                <div
                  style={{ width: COLLAPSED_LUNCH_WIDTH }}
                  className="flex-shrink-0 h-full border-r border-amber-200 bg-amber-50/70 group-hover/projrow:bg-amber-100/50 relative flex items-center justify-center overflow-hidden"
                  title="午休時段已收折 (12:00~13:00)"
                >
                  <div className="text-[10px] text-amber-600/60 font-mono select-none">☕</div>
                </div>
              ) : (
                <div
                  style={{ width: hourWidth }}
                  className="flex-shrink-0 h-full border-r border-amber-200/80 relative bg-amber-50/40 group-hover/projrow:bg-amber-50/70 flex items-center justify-center"
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-40 select-none pointer-events-none">
                    <span className="text-[10px] text-amber-700 font-mono tracking-wider rotate-90 sm:rotate-0">
                      ☕午休不計
                    </span>
                  </div>
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-r border-dashed border-amber-200 pointer-events-none" />
                </div>
              )}

              {/* Afternoon Hours (13:00 - 17:30) */}
              {AFTERNOON_SLOTS.map((slot) => (
                <div
                  key={slot.hour}
                  style={{ width: slot.span * hourWidth }}
                  className={`flex-shrink-0 h-full relative bg-white group-hover/projrow:bg-slate-50/40 ${
                    slot.hour === 17 ? 'border-r-2 border-amber-400/80' : 'border-r border-slate-200/80'
                  }`}
                >
                  {slot.hasMidTick && (
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-r border-dashed border-slate-200 pointer-events-none" />
                  )}
                </div>
              ))}

              {/* Overtime Hours (17:30 - 22:00) */}
              {collapseOvertime ? null : (
                OVERTIME_SLOTS.map((slot) => (
                  <div
                    key={slot.hour}
                    style={{ width: slot.span * hourWidth }}
                    className="flex-shrink-0 h-full border-r border-amber-200/60 relative bg-amber-50/30 group-hover/projrow:bg-amber-50/50"
                  >
                    {slot.hasMidTick && (
                      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-r border-dashed border-amber-200/60 pointer-events-none" />
                    )}
                  </div>
                ))
              )}
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
                  collapseLunch={collapseLunch}
                  collapseOvertime={collapseOvertime}
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
