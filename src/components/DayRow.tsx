import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, FolderKanban, ChevronDown, ChevronRight, Sparkles, Coffee, Moon } from 'lucide-react';
import { DaySchedule, Project, Task } from '../types';
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
import { assignTracksToTasks, calculateTaskHours, getDayWidth, dayXToHour } from '../utils/time';
import { TaskBlock } from './TaskBlock';

interface DayRowProps {
  day: DaySchedule;
  dayIndex: number;
  totalDays: number;
  projects: Project[];
  hourWidth: number;
  sidebarWidth: number;
  collapseLunch?: boolean;
  collapseOvertime?: boolean;
  onUpdateDay: (dayId: string, updates: Partial<DaySchedule>) => void;
  onDeleteDay: (dayId: string) => void;
  onAddTaskToDay: (dayId: string, defaultStartHour?: number, defaultProjectId?: string) => void;
  onUpdateTask: (dayId: string, taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (dayId: string, taskId: string) => void;
  onOpenEditModal: (dayId: string, task: Task) => void;
  onOpenProjectModal: () => void;
}

export const DayRow: React.FC<DayRowProps> = ({
  day,
  dayIndex,
  totalDays,
  projects,
  hourWidth,
  sidebarWidth,
  collapseLunch = false,
  collapseOvertime = false,
  onUpdateDay,
  onDeleteDay,
  onAddTaskToDay,
  onUpdateTask,
  onDeleteTask,
  onOpenEditModal,
  onOpenProjectModal,
}) => {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelInput, setLabelInput] = useState(day.label);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const TASK_ROW_HEIGHT = 44;
  const dayWidth = getDayWidth(hourWidth, collapseLunch, collapseOvertime);

  // Calculate day-wide statistics for visible projects
  let dayNormalHours = 0;
  let dayOvertimeHours = 0;
  const visibleDayTasks = day.tasks.filter((t) => projects.some((p) => p.id === t.projectId));
  visibleDayTasks.forEach((t) => {
    const { normalHours, overtimeHours } = calculateTaskHours(t.startHour, t.duration);
    dayNormalHours += normalHours;
    dayOvertimeHours += overtimeHours;
  });

  const handleSaveLabel = () => {
    if (labelInput.trim()) {
      onUpdateDay(day.id, { label: labelInput.trim() });
    } else {
      setLabelInput(day.label);
    }
    setIsEditingLabel(false);
  };

  return (
    <div className="border-b-2 border-slate-800 bg-slate-950/20">
      {/* Day Section Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800/80 sticky left-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white transition p-0.5 rounded hover:bg-slate-800"
            title={isCollapsed ? '展開此日專案列' : '收合此日專案列'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {isEditingLabel ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveLabel();
                  if (e.key === 'Escape') {
                    setLabelInput(day.label);
                    setIsEditingLabel(false);
                  }
                }}
                autoFocus
                className="bg-slate-800 border border-indigo-500 rounded px-2.5 py-0.5 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleSaveLabel}
                className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-500"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                {day.label}
              </span>
              <button
                onClick={() => setIsEditingLabel(true)}
                className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition"
                title="修改名稱"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Aggregate Badge for this Day */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700/60 font-mono text-[11px]">
              {visibleDayTasks.length} 個項目
            </span>
            <span className="text-sky-400 font-mono text-[11px]">
              常 {dayNormalHours}h
            </span>
            {dayOvertimeHours > 0 && (
              <span className="text-amber-400 font-bold font-mono text-[11px]">
                加 {dayOvertimeHours}h
              </span>
            )}
          </div>
        </div>

        {/* Day Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddTaskToDay(day.id)}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 px-2.5 py-1 rounded transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增項目</span>
          </button>

          {totalDays > 1 && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    `確定要刪除 ${day.label} 及其所有專案項目嗎？`
                  )
                ) {
                  onDeleteDay(day.id);
                }
              }}
              className="text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 p-1.5 rounded transition"
              title={`刪除 ${day.label}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Project Rows List under this Day */}
      {!isCollapsed && (
        <div className="divide-y divide-slate-800/60">
          {projects.length === 0 ? (
            <div className="py-6 px-4 text-center text-xs text-slate-500">
              未選取任何欲顯示的專案（請在上方專案篩選中勾選）
            </div>
          ) : (
            projects.map((project) => {
            // Filter tasks belonging to this project on this day
            const projTasks = day.tasks.filter((t) => t.projectId === project.id);
            const { positionedTasks, maxTrack } = assignTracksToTasks(projTasks);
            const rowHeightPx = Math.max(
              64,
              (maxTrack + 1) * (TASK_ROW_HEIGHT + 8) + 12
            );

            // Calculate project hours on this day
            let projNormal = 0;
            let projOvertime = 0;
            projTasks.forEach((t) => {
              const { normalHours, overtimeHours } = calculateTaskHours(
                t.startHour,
                t.duration
              );
              projNormal += normalHours;
              projOvertime += overtimeHours;
            });

            const colorMeta = COLOR_OPTIONS[project.color] || COLOR_OPTIONS.blue;

            const handleRowGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
              if (
                (e.target as HTMLElement).closest('.task-bar-item') ||
                (e.target as HTMLElement).closest('.task-action-btn') ||
                (e.target as HTMLElement).closest('.resize-handle')
              ) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const clickedHour = dayXToHour(clickX, hourWidth, collapseLunch, collapseOvertime);
              const safeHour = Math.max(
                START_HOUR,
                Math.min(END_HOUR - 0.5, clickedHour)
              );
              onAddTaskToDay(day.id, safeHour, project.id);
            };

            return (
              <div
                key={project.id}
                className="flex hover:bg-slate-900/40 transition-colors group/projrow relative"
              >
                {/* Left Sidebar: Project Info */}
                <div
                  style={{ width: sidebarWidth }}
                  className="flex-shrink-0 bg-slate-900/95 border-r border-slate-800 p-3 flex flex-col justify-between z-10 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colorMeta.bg}`}
                      />
                      <span
                        className="font-bold text-xs sm:text-sm text-white truncate tracking-tight"
                        title={project.name}
                      >
                        {project.name}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700/60 font-mono">
                        {projTasks.length} 項
                      </span>
                      {projNormal > 0 && (
                        <span className="text-sky-400 font-mono">
                          常{projNormal}h
                        </span>
                      )}
                      {projOvertime > 0 && (
                        <span className="text-amber-400 font-bold font-mono">
                          加{projOvertime}h
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add task specifically to this project */}
                  <div className="mt-2 pt-1 border-t border-slate-800/60 flex items-center justify-between">
                    <button
                      onClick={() => onAddTaskToDay(day.id, 9, project.id)}
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

                {/* Right Timeline Canvas for this Project */}
                <div
                  style={{
                    width: dayWidth,
                    height: `${rowHeightPx}px`,
                  }}
                  onClick={handleRowGridClick}
                  className="relative flex-shrink-0 cursor-pointer overflow-hidden select-none"
                  title={`點擊此列任意時間格，即可直接新增項目至「${project.name}」`}
                >
                  {/* Hourly vertical background gridlines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {/* Morning Hours: 08:30 (0.5h), 09:00 (1h), 10:00 (1h), 11:00 (1h) */}
                    {MORNING_SLOTS.map((slot) => (
                      <div
                        key={slot.hour}
                        style={{ width: slot.span * hourWidth }}
                        className="flex-shrink-0 h-full border-r border-slate-800/60 relative bg-slate-950/30 group-hover/projrow:bg-slate-900/30"
                      >
                        {slot.hasMidTick && (
                          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-r border-dashed border-slate-800/40 pointer-events-none" />
                        )}
                      </div>
                    ))}

                    {/* Lunch Break */}
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
                        style={{ width: hourWidth }}
                        className="flex-shrink-0 h-full border-r border-slate-800/60 relative bg-slate-950/30 group-hover/projrow:bg-slate-900/30"
                      >
                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-r border-dashed border-slate-800/40 pointer-events-none" />
                        {hour === 17 && (
                          <>
                            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-amber-500/80 z-10 pointer-events-none" />
                            <div className="absolute left-1/2 right-0 top-0 bottom-0 bg-amber-950/15 pointer-events-none" />
                          </>
                        )}
                      </div>
                    ))}

                    {/* Overtime Hours or Collapsed */}
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

                  {/* Tasks rendered on this Project Row */}
                  <div className="absolute inset-0 pointer-events-none">
                    {positionedTasks.map((task) => (
                      <div key={task.id} className="task-bar-item pointer-events-auto">
                        <TaskBlock
                          task={{
                            ...task,
                            color: task.color || project.color,
                          }}
                          dayId={day.id}
                          hourWidth={hourWidth}
                          rowHeight={TASK_ROW_HEIGHT}
                          collapseLunch={collapseLunch}
                          collapseOvertime={collapseOvertime}
                          onUpdateTask={onUpdateTask}
                          onDeleteTask={onDeleteTask}
                          onOpenEditModal={onOpenEditModal}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Empty state hint */}
                  {projTasks.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-500 text-xs gap-1.5 opacity-60">
                      <span>點擊時間格新增項目至「{project.name}」</span>
                    </div>
                  )}
                </div>
              </div>
            );
          }))}
        </div>
      )}
    </div>
  );
};
