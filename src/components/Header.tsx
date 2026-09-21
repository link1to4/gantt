import React from 'react';
import { 
  CalendarDays, 
  CalendarRange,
  Plus, 
  RotateCcw, 
  HelpCircle,
  FolderKanban,
  Layers,
  Filter,
  Coffee,
  Moon,
  Upload,
  DownloadCloud
} from 'lucide-react';
import { DaySchedule, Project, ViewGroupingMode, ZoomLevel } from '../types';
import { ZOOM_CONFIG } from '../constants';
import { calculateTaskHours } from '../utils/time';
import { ProjectMultiSelectFilter } from './ProjectMultiSelectFilter';

interface HeaderProps {
  days: DaySchedule[];
  projects: Project[];
  zoom: ZoomLevel;
  onZoomChange: (zoom: ZoomLevel) => void;
  viewMode: ViewGroupingMode;
  onViewModeChange: (mode: ViewGroupingMode) => void;
  selectedProjectIds: string[];
  onProjectFilterChange: (ids: string[]) => void;
  collapseLunch: boolean;
  onToggleCollapseLunch: () => void;
  collapseOvertime: boolean;
  onToggleCollapseOvertime: () => void;
  onAddDay: () => void;
  onOpenNewTaskModal: (targetDayId?: string, targetProjectId?: string) => void;
  onOpenProjectModal: () => void;
  onOpenImportModal?: () => void;
  onExportAllProjects?: () => void;
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
  selectedProjectIds,
  onProjectFilterChange,
  collapseLunch,
  onToggleCollapseLunch,
  collapseOvertime,
  onToggleCollapseOvertime,
  onAddDay,
  onOpenNewTaskModal,
  onOpenProjectModal,
  onOpenImportModal,
  onExportAllProjects,
  onResetData,
  onToggleHelp,
}) => {
  // Aggregate stats
  let totalTasks = 0;
  let totalNormalHours = 0;
  let totalOvertimeHours = 0;
  let totalLunchBreakHours = 0;

  days.forEach((day) => {
    day.tasks.forEach((task) => {
      // If filtering by project, only count matched tasks
      if (selectedProjectIds.includes(task.projectId)) {
        totalTasks += 1;
        const { normalHours, overtimeHours, lunchBreakHours } = calculateTaskHours(task.startHour, task.duration);
        totalNormalHours += normalHours;
        totalOvertimeHours += overtimeHours;
        totalLunchBreakHours += lunchBreakHours;
      }
    });
  });

  return (
    <header className="bg-white text-slate-800 border-b border-slate-200 shadow-xs select-none">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-4">
        {/* Top row: Title and primary actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  多日甘特圖排程器
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                  專案分列呈現
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                正常工時 08:30 ~ 17:30 (午休 12:00 ~ 13:00 不計)・加班時段 17:30 ~ 22:00
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs font-medium">
              <button
                onClick={() => onViewModeChange('continuous')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  viewMode === 'continuous'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="X 軸連續延伸模式：Day 1 ➔ Day 2 ➔ Day 3 依序向右延伸，專案獨立分列"
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span>連續 X 軸 (推薦)</span>
              </button>
              <button
                onClick={() => onViewModeChange('by-day')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  viewMode === 'by-day'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="依日期垂直分組，每天下方顯示各專案列"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>依日期分組</span>
              </button>
              <button
                onClick={() => onViewModeChange('by-project')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  viewMode === 'by-project'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="依專案垂直分組，每個專案下方顯示各日程列"
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>依專案分組</span>
              </button>
            </div>

            {/* Project Multi-Select Filter */}
            <ProjectMultiSelectFilter
              projects={projects}
              selectedProjectIds={selectedProjectIds}
              days={days}
              onChange={onProjectFilterChange}
            />

            {/* Zoom selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs font-medium">
              {(['compact', 'normal', 'spacious'] as ZoomLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => onZoomChange(level)}
                  className={`px-2 py-1 rounded transition-colors ${
                    zoom === level
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`視圖寬度：${ZOOM_CONFIG[level].label}`}
                >
                  {ZOOM_CONFIG[level].label}
                </button>
              ))}
            </div>

            {/* Collapse Lunch & Overtime Controls */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs">
              <button
                onClick={onToggleCollapseLunch}
                className={`px-2 py-1 rounded transition-colors flex items-center gap-1.5 font-medium ${
                  collapseLunch
                    ? 'bg-amber-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={collapseLunch ? '點擊展開午休時段 (12:00-13:00)' : '收折午休時段 (12:00-13:00) 節省版面空間'}
              >
                <Coffee className={`w-3.5 h-3.5 ${collapseLunch ? 'text-amber-100' : 'text-slate-500'}`} />
                <span>{collapseLunch ? '午休已收折' : '收折午休'}</span>
              </button>

              <button
                onClick={onToggleCollapseOvertime}
                className={`px-2 py-1 rounded transition-colors flex items-center gap-1.5 font-medium ${
                  collapseOvertime
                    ? 'bg-amber-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={collapseOvertime ? '點擊展開加班時段 (17:30-22:00)' : '收折加班時段 (17:30-22:00) 節省版面空間'}
              >
                <Moon className={`w-3.5 h-3.5 ${collapseOvertime ? 'text-amber-100' : 'text-slate-500'}`} />
                <span>{collapseOvertime ? '加班已收折' : '收折加班'}</span>
              </button>
            </div>

            {/* Project Management Button */}
            <button
              onClick={onOpenProjectModal}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition flex items-center gap-1.5 active:scale-95 shadow-xs"
              title="專案維度管理、複製與個別匯出"
            >
              <FolderKanban className="w-3.5 h-3.5 text-amber-500" />
              <span>管理專案 ({projects.length})</span>
            </button>

            {/* Quick Import Project Button */}
            {onOpenImportModal && (
              <button
                onClick={onOpenImportModal}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition flex items-center gap-1.5 active:scale-95 shadow-xs"
                title="匯入專案檔案 (JSON)"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">匯入專案</span>
              </button>
            )}

            {/* Quick Backup/Export All Button */}
            {onExportAllProjects && (
              <button
                onClick={onExportAllProjects}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition flex items-center gap-1.5 active:scale-95 shadow-xs"
                title="匯出全專案排程備份檔 (JSON)"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">備份全部</span>
              </button>
            )}

            {/* Help button */}
            <button
              onClick={onToggleHelp}
              className="p-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-300 transition shadow-xs"
              title="操作說明與快捷鍵"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
            </button>

            {/* Reset button */}
            <button
              onClick={onResetData}
              className="p-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-300 transition shadow-xs"
              title="重設為預設範例"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Add Day Button */}
            <button
              onClick={onAddDay}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4 text-sky-600" />
              <span>增加日期 (Day {days.length + 1})</span>
            </button>

            {/* Add Task Button */}
            <button
              onClick={() => onOpenNewTaskModal()}
              className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>新增項目方塊</span>
            </button>
          </div>
        </div>

        {/* Bottom statistics strip */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">總專案數:</span>
            <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {projects.length} 個專案
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">總排程天數:</span>
            <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {days.length} 天
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">項目數量:</span>
            <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {totalTasks} 個
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500"></div>
            <span className="text-slate-700">正常工時合計:</span>
            <span className="text-sky-700 font-bold font-mono">{totalNormalHours} 小時</span>
          </div>

          {totalLunchBreakHours > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-600">☕ 午休不計合計:</span>
              <span className="text-amber-700 font-medium font-mono">{totalLunchBreakHours} 小時</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <span className="text-slate-700">加班時段合計:</span>
            <span className="text-amber-700 font-bold font-mono">{totalOvertimeHours} 小時</span>
          </div>

          <div className="ml-auto hidden md:flex items-center gap-3 text-slate-500 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-sky-500"></span> 08:30 - 17:30 正常時段 (8hr)
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-2 h-2 rounded-sm bg-slate-400"></span> 12:00 - 13:00 午休不計 (1hr)
            </span>
            <span className="flex items-center gap-1 text-amber-700">
              <span className="w-2 h-2 rounded-sm bg-amber-500"></span> 17:30 - 22:00 加班時段
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
