import React from 'react';
import { 
  CalendarDays, 
  Plus, 
  RotateCcw, 
  HelpCircle,
  FolderKanban,
  Layers,
  Filter
} from 'lucide-react';
import { DaySchedule, Project, ViewGroupingMode, ZoomLevel } from '../types';
import { ZOOM_CONFIG } from '../constants';
import { calculateTaskHours } from '../utils/time';

interface HeaderProps {
  days: DaySchedule[];
  projects: Project[];
  zoom: ZoomLevel;
  onZoomChange: (zoom: ZoomLevel) => void;
  viewMode: ViewGroupingMode;
  onViewModeChange: (mode: ViewGroupingMode) => void;
  selectedProjectFilter: string;
  onProjectFilterChange: (id: string) => void;
  onAddDay: () => void;
  onOpenNewTaskModal: (targetDayId?: string, targetProjectId?: string) => void;
  onOpenProjectModal: () => void;
  onResetData: () => void;
  onToggleHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  days,
  projects,
  zoom,
  onZoomChange,
  viewMode,
  onViewModeChange,
  selectedProjectFilter,
  onProjectFilterChange,
  onAddDay,
  onOpenNewTaskModal,
  onOpenProjectModal,
  onResetData,
  onToggleHelp,
}) => {
  // Aggregate stats
  let totalTasks = 0;
  let totalNormalHours = 0;
  let totalOvertimeHours = 0;

  days.forEach((day) => {
    day.tasks.forEach((task) => {
      // If filtering by project, only count matched tasks
      if (selectedProjectFilter === 'all' || task.projectId === selectedProjectFilter) {
        totalTasks += 1;
        const { normalHours, overtimeHours } = calculateTaskHours(task.startHour, task.duration);
        totalNormalHours += normalHours;
        totalOvertimeHours += overtimeHours;
      }
    });
  });

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 shadow-md select-none">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-4">
        {/* Top row: Title and primary actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  多日甘特圖排程器
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-medium">
                  專案分列呈現
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                正常工時 08:00 ~ 18:00・加班時段 18:00 ~ 22:00 (不同專案以獨立列呈現)
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs font-medium">
              <button
                onClick={() => onViewModeChange('by-day')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  viewMode === 'by-day'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="依日期分組，每天下方顯示各專案列"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>依日期</span>
              </button>
              <button
                onClick={() => onViewModeChange('by-project')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  viewMode === 'by-project'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="依專案分組，每個專案下方顯示各日程列"
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>依專案</span>
              </button>
            </div>

            {/* Project Filter */}
            <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-2.5 py-1 border border-slate-700 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedProjectFilter}
                onChange={(e) => onProjectFilterChange(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none text-xs cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">
                  全部專案 ({projects.length})
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Zoom selector */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs font-medium">
              {(['compact', 'normal', 'spacious'] as ZoomLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => onZoomChange(level)}
                  className={`px-2 py-1 rounded transition-colors ${
                    zoom === level
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`視圖寬度：${ZOOM_CONFIG[level].label}`}
                >
                  {ZOOM_CONFIG[level].label}
                </button>
              ))}
            </div>

            {/* Project Management Button */}
            <button
              onClick={onOpenProjectModal}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1.5 active:scale-95"
              title="新增或修改專案維度"
            >
              <FolderKanban className="w-3.5 h-3.5 text-amber-400" />
              <span>管理專案 ({projects.length})</span>
            </button>

            {/* Help button */}
            <button
              onClick={onToggleHelp}
              className="p-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              title="操作說明與快捷鍵"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
            </button>

            {/* Reset button */}
            <button
              onClick={onResetData}
              className="p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/50 transition"
              title="重設為預設範例"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Add Day Button */}
            <button
              onClick={onAddDay}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 shadow-sm transition flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4 text-sky-400" />
              <span>增加日期 (Day {days.length + 1})</span>
            </button>

            {/* Add Task Button */}
            <button
              onClick={() => onOpenNewTaskModal()}
              className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>新增項目方塊</span>
            </button>
          </div>
        </div>

        {/* Bottom statistics strip */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">總專案數:</span>
            <span className="text-slate-200 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {projects.length} 個專案
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">總排程天數:</span>
            <span className="text-slate-200 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {days.length} 天
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">項目數量:</span>
            <span className="text-slate-200 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {totalTasks} 個
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400"></div>
            <span className="text-slate-300">正常工時合計:</span>
            <span className="text-sky-300 font-bold">{totalNormalHours} 小時</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
            <span className="text-slate-300">加班時段合計:</span>
            <span className="text-amber-300 font-bold">{totalOvertimeHours} 小時</span>
          </div>

          <div className="ml-auto hidden md:flex items-center gap-3 text-slate-500 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-slate-600"></span> 08:00 - 18:00 正常時段 (10hr)
            </span>
            <span className="flex items-center gap-1 text-amber-400/80">
              <span className="w-2 h-2 rounded-sm bg-amber-500"></span> 18:00 - 22:00 加班時段 (4hr)
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
