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
  MORNING_SLOTS,
  AFTERNOON_SLOTS,
  OVERTIME_SLOTS
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
    <div className="border-b border-slate-200 bg-white">
      {/* Day Section Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 sticky left-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-slate-700 transition p-0.5 rounded hover:bg-slate-200/60"
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
                className="bg-white border border-indigo-500 rounded px-2.5 py-0.5 text-xs text-slate-800 focus:outline-none"
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
              <span className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                {day.label}
              </span>
              <button
                onClick={() => setIsEditingLabel(true)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
                title="修改名稱"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Aggregate Badge for this Day */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="px-2 py-0.5 bg-white text-slate-700 rounded border border-slate-200 font-mono text-[11px] shadow-xs">
              {visibleDayTasks.length} 個項目
            </span>
            <span className="text-sky-700 font-mono text-[11px] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
              常 {dayNormalHours}h
            </span>
            {dayOvertimeHours > 0 && (
              <span className="text-amber-700 font-bold font-mono text-[11px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                加 {dayOvertimeHours}h
              </span>
            )}
          </div>
        </div>

        {/* Day Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddTaskToDay(day.id)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1 rounded transition flex items-center gap-1"
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
              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded transition"
              title={`刪除 ${day.label}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Project Rows List under this Day */}
      {!isCollapsed && (
        <div className="divide-y divide-slate-200">
          {projects.length === 0 ? (
            <div className="py-6 px-4 text-center text-xs text-slate-400">
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
                className="flex hover:bg-slate-50/70 transition-colors group/projrow relative"
              >
                {/* Left Sidebar: Project Info */}
                <div
                  style={{ width: sidebarWidth }}
                  className="flex-shrink-0 bg-white border-r border-slate-200 p-3 flex flex-col justify-between z-10 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colorMeta.bg}`}
                      />
                      <span
                        className="font-bold text-xs sm:text-sm text-slate-900 truncate tracking-tight"
                        title={project.name}
                      >
                        {project.name}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200 font-mono">
                        {projTasks.length} 項
                      </span>
                      {projNormal > 0 && (
                        <span className="text-sky-700 font-mono">
                          常{projNormal}h
                        </span>
                      )}
                      {projOvertime > 0 && (
                        <span className="text-amber-700 font-bold font-mono">
                          加{projOvertime}h
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add task specifically to this project */}
                  <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onAddTaskToDay(day.id, 9, project.id)}
                      className="text-[11px] font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-1.5 py-0.5 rounded transition flex items-center gap-1"
                      title={`新增項目至 ${project.name}`}
                    >
                      <Plus className="w-3 h-3 text-indigo-600" />
                      <span>新增項目</span>
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono">
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
                  className="relative flex-shrink-0 cursor-pointer overflow-hidden select-none bg-white"
                  title={`點擊此列任意時間格，即可直接新增項目至「${project.name}」`}
                >
                  {/* Hourly vertical background gridlines */}
                  <div className="absolute inset-0 flex pointer-events-none">
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

                    {/* Lunch Break */}
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
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs gap-1.5 opacity-60">
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
