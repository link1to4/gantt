import React from 'react';
import { Plus, FolderKanban, Copy, Download } from 'lucide-react';
import { Project, DaySchedule, Task } from '../types';
import { 
  START_HOUR, 
  OVERTIME_HOUR, 
  END_HOUR, 
  TOTAL_HOURS, 
  COLOR_OPTIONS,
  COLLAPSED_LUNCH_WIDTH,
  COLLAPSED_OVERTIME_WIDTH,
  MORNING_SLOTS
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
    <div className="flex hover:bg-slate-900/40 transition-colors group/projrow relative border-b border-slate-800">
      {/* Left Sticky Sidebar: Project Information */}
      <div
        style={{ width: sidebarWidth }}
        className="sticky left-0 bg-slate-900/98 border-r border-slate-800 p-3 flex flex-col justify-between z-20 shadow-md backdrop-blur-xs flex-shrink-0"
      >
        <div>
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${colorMeta.bg}`} />
              <span
                className="font-bold text-xs sm:text-sm text-white truncate tracking-tight"
                title={project.name}
              >
                {project.name}
              </span>
            </div>

            {/* Quick action buttons: Duplicate & Export */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {onDuplicateProject && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateProject(project.id);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition"
                  title="一鍵複製此專案與所有項目"
                >
                  <Copy className="w-3 h-3" />
                </button>
              )}
              {onExportProject && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExportProject(project.id);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition"
                  title="匯出專案 JSON 檔案"
                >
                  <Download className="w-3 h-3" />
                </button>
              )}
            </div>
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
              {/* Morning Hours: 08:30 (0.5h), 09:00 (1h), 10:00 (1h), 11:00 (1h) */}
              {MORNING_SLOTS.map((slot) => (
                <div
                  key={slot.hour}
                  style={{ width: slot.span * hourWidth }}
                  className={`flex-shrink-0 h-full border-r ${
                    slot.hour === 8.5
                      ? 'border-sky-500/50 bg-sky-950/10'
                      : 'border-slate-800/60 bg-slate-950/30'
                  } relative group-hover/projrow:bg-slate-900/30`}
                >
                  {slot.hasMidTick && (
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-r border-dashed border-slate-800/40 pointer-events-none" />
                  )}
                </div>
              ))}

              {/* Lunch Hour (12:00 - 13:00) */}
              {collapseLunch ? (
                <div
                  style={{ width: COLLAPSED_LUNCH_WIDTH }}
                  className="flex-shrink-0 h-full border-r border-slate-700/60 bg-amber-950/20 group-hover/projrow:bg-amber-950/30 relative flex items-center justify-center overflow-hidden"
                  title="午休時段已收折 (12:00~13:00)"
                >
                  <div className="text-[10px] text-amber-400/40 font-mono select-none">☕</div>
                </div>
              ) : (
                <div
                  style={{ width: hourWidth }}
                  className="flex-shrink-0 h-full border-r border-slate-800/60 relative bg-slate-800/35 group-hover/projrow:bg-slate-800/50 flex items-center justify-center"
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 select-none pointer-events-none">
                    <span className="text-[10px] text-amber-300/80 font-mono tracking-wider rotate-90 sm:rotate-0">
                      ☕午休不計
                    </span>
                  </div>
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-r border-dashed border-slate-800/40 pointer-events-none" />
                </div>
              )}

              {/* Afternoon Hours 13, 14, 15, 16, 17 */}
              {[13, 14, 15, 16, 17].map((hour) => (
                <div
                  key={hour}
                  style={{ width: hour === 17 && collapseOvertime ? hourWidth * 0.5 : hourWidth }}
                  className="flex-shrink-0 h-full border-r border-slate-800/60 relative bg-slate-950/30 group-hover/projrow:bg-slate-900/30"
                >
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-r border-dashed border-slate-800/40 pointer-events-none" />
                  {hour === 17 && !collapseOvertime && (
                    <>
                      <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-amber-500/80 z-10 pointer-events-none" />
                      <div className="absolute left-1/2 right-0 top-0 bottom-0 bg-amber-950/15 pointer-events-none" />
                    </>
                  )}
                </div>
              ))}

              {/* Overtime Hours or Collapsed Strip */}
              {collapseOvertime ? null : (
                [18, 19, 20, 21].map((hour) => (
                  <div
                    key={hour}
                    style={{ width: hourWidth }}
                    className="flex-shrink-0 h-full border-r border-slate-800/60 relative bg-amber-950/10 group-hover/projrow:bg-amber-950/20"
                  >
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-r border-dashed border-slate-800/40 pointer-events-none" />
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
