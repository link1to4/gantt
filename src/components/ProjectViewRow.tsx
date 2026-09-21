import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, FolderKanban, ChevronDown, ChevronRight, Calendar, Coffee, Moon, Copy, Download } from 'lucide-react';
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

interface ProjectViewRowProps {
  project: Project;
  days: DaySchedule[];
  hourWidth: number;
  sidebarWidth: number;
  collapseLunch?: boolean;
  collapseOvertime?: boolean;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
  onDeleteProject: (projectId: string) => void;
  onAddTaskToDay: (dayId: string, defaultStartHour?: number, defaultProjectId?: string) => void;
  onUpdateTask: (dayId: string, taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (dayId: string, taskId: string) => void;
  onOpenEditModal: (dayId: string, task: Task) => void;
  onDuplicateProject?: (projectId: string) => void;
  onExportProject?: (projectId: string) => void;
}

export const ProjectViewRow: React.FC<ProjectViewRowProps> = ({
  project,
  days,
  hourWidth,
  sidebarWidth,
  collapseLunch = false,
  collapseOvertime = false,
  onUpdateProject,
  onDeleteProject,
  onAddTaskToDay,
  onUpdateTask,
  onDeleteTask,
  onOpenEditModal,
  onDuplicateProject,
  onExportProject,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const TASK_ROW_HEIGHT = 44;
  const dayWidth = getDayWidth(hourWidth, collapseLunch, collapseOvertime);

  // Calculate project-wide statistics across all days
  let totalTasksCount = 0;
  let totalNormalHours = 0;
  let totalOvertimeHours = 0;

  days.forEach((day) => {
    day.tasks.forEach((t) => {
      if (t.projectId === project.id) {
        totalTasksCount += 1;
        const { normalHours, overtimeHours } = calculateTaskHours(t.startHour, t.duration);
        totalNormalHours += normalHours;
        totalOvertimeHours += overtimeHours;
      }
    });
  });

  const colorMeta = COLOR_OPTIONS[project.color] || COLOR_OPTIONS.blue;

  return (
    <div className="border-b border-slate-200 bg-white">
      {/* Project Section Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 sticky left-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-slate-700 transition p-0.5 rounded hover:bg-slate-200/60"
            title={isCollapsed ? '展開專案日程' : '收合專案日程'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${colorMeta.bg}`} />
            <span className="font-bold text-slate-900 text-sm tracking-tight">
              {project.name}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="px-2 py-0.5 bg-white text-slate-700 rounded border border-slate-200 font-mono text-[11px] shadow-xs">
              {totalTasksCount} 個項目
            </span>
            <span className="text-sky-700 font-mono text-[11px] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
              常 {totalNormalHours}h
            </span>
            {totalOvertimeHours > 0 && (
              <span className="text-amber-700 font-bold font-mono text-[11px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                加 {totalOvertimeHours}h
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onDuplicateProject && (
            <button
              type="button"
              onClick={() => onDuplicateProject(project.id)}
              className="text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition flex items-center gap-1"
              title="一鍵複製此專案與所有排程項目"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">複製專案</span>
            </button>
          )}

          {onExportProject && (
            <button
              type="button"
              onClick={() => onExportProject(project.id)}
              className="text-xs font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded transition flex items-center gap-1"
              title="匯出專案 JSON 檔案"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">匯出</span>
            </button>
          )}

          <button
            onClick={() => onAddTaskToDay(days[0]?.id || '', 9, project.id)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1 rounded transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增此專案項目</span>
          </button>
        </div>
      </div>

      {/* Sub-rows: Each Day for this Project */}
      {!isCollapsed && (
        <div className="divide-y divide-slate-200">
          {days.map((day) => {
            const dayProjTasks = day.tasks.filter((t) => t.projectId === project.id);
            const { positionedTasks, maxTrack } = assignTracksToTasks(dayProjTasks);
            const rowHeightPx = Math.max(
              60,
              (maxTrack + 1) * (TASK_ROW_HEIGHT + 8) + 12
            );

            let dayProjNormal = 0;
            let dayProjOvertime = 0;
            dayProjTasks.forEach((t) => {
              const { normalHours, overtimeHours } = calculateTaskHours(t.startHour, t.duration);
              dayProjNormal += normalHours;
              dayProjOvertime += overtimeHours;
            });

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
                key={day.id}
                className="flex hover:bg-slate-50/70 transition-colors group/projrow relative"
              >
                {/* Left Sidebar: Day Info */}
                <div
                  style={{ width: sidebarWidth }}
                  className="flex-shrink-0 bg-white border-r border-slate-200 p-3 flex flex-col justify-between z-10 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-xs sm:text-sm text-slate-800">
                        {day.label}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200 font-mono">
                        {dayProjTasks.length} 項
                      </span>
                      {dayProjNormal > 0 && (
                        <span className="text-sky-700 font-mono">
                          常{dayProjNormal}h
                        </span>
                      )}
                      {dayProjOvertime > 0 && (
                        <span className="text-amber-700 font-bold font-mono">
                          加{dayProjOvertime}h
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onAddTaskToDay(day.id, 9, project.id)}
                      className="text-[11px] font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-1.5 py-0.5 rounded transition flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-indigo-600" />
                      <span>新增項目</span>
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono">
                      點格新增
                    </span>
                  </div>
                </div>

                {/* Right Timeline Canvas */}
                <div
                  style={{
                    width: dayWidth,
                    height: `${rowHeightPx}px`,
                  }}
                  onClick={handleRowGridClick}
                  className="relative flex-shrink-0 cursor-pointer overflow-hidden select-none bg-white"
                  title={`點擊此時間格新增項目至 ${project.name} (${day.label})`}
                >
                  {/* Vertical grid lines */}
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

                    {/* Afternoon Hours 13, 14, 15, 16, 17 */}
                    {[13, 14, 15, 16, 17].map((hour) => (
                      <div
                        key={hour}
                        style={{ width: hour === 17 && collapseOvertime ? hourWidth * 0.5 : hourWidth }}
                        className="flex-shrink-0 h-full border-r border-slate-200/80 relative bg-white group-hover/projrow:bg-slate-50/40"
                      >
                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-r border-dashed border-slate-200 pointer-events-none" />
                        {hour === 17 && !collapseOvertime && (
                          <>
                            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-amber-500 z-10 pointer-events-none" />
                            <div className="absolute left-1/2 right-0 top-0 bottom-0 bg-amber-50/40 pointer-events-none" />
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
                          className="flex-shrink-0 h-full border-r border-amber-200/60 relative bg-amber-50/30 group-hover/projrow:bg-amber-50/50"
                        >
                          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-r border-dashed border-amber-200/60 pointer-events-none" />
                        </div>
                      ))
                    )}
                  </div>

                  {/* Tasks on this Day for this Project */}
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

                  {dayProjTasks.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs opacity-60">
                      <span>此日無項目，點擊時間格新增</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
