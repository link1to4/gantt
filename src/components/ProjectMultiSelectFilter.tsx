import React, { useState, useRef, useEffect } from 'react';
import { Filter, Check, ChevronDown, CheckSquare, Square, X, Search } from 'lucide-react';
import { Project, DaySchedule } from '../types';
import { COLOR_OPTIONS } from '../constants';

interface ProjectMultiSelectFilterProps {
  projects: Project[];
  selectedProjectIds: string[];
  days: DaySchedule[];
  onChange: (selectedIds: string[]) => void;
}

export const ProjectMultiSelectFilter: React.FC<ProjectMultiSelectFilterProps> = ({
  projects,
  selectedProjectIds,
  days,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Calculate task counts per project
  const projectTaskCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    days.forEach((day) => {
      day.tasks.forEach((task) => {
        counts[task.projectId] = (counts[task.projectId] || 0) + 1;
      });
    });
    return counts;
  }, [days]);

  // Toggle single project
  const handleToggle = (projectId: string) => {
    if (selectedProjectIds.includes(projectId)) {
      onChange(selectedProjectIds.filter((id) => id !== projectId));
    } else {
      onChange([...selectedProjectIds, projectId]);
    }
  };

  // Select all
  const handleSelectAll = () => {
    onChange(projects.map((p) => p.id));
  };

  // Clear all
  const handleClearAll = () => {
    onChange([]);
  };

  // Invert selection
  const handleInvert = () => {
    const inverted = projects
      .map((p) => p.id)
      .filter((id) => !selectedProjectIds.includes(id));
    onChange(inverted);
  };

  // Solo view (only this project)
  const handleSolo = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([projectId]);
  };

  // Filtered by search term
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const isAllSelected = projects.length > 0 && selectedProjectIds.length === projects.length;
  const isNoneSelected = selectedProjectIds.length === 0;

  // Compute trigger button label
  const getButtonLabel = () => {
    if (isAllSelected) {
      return `全部專案 (${projects.length})`;
    }
    if (isNoneSelected) {
      return '未選專案 (0)';
    }
    if (selectedProjectIds.length === 1) {
      const proj = projects.find((p) => p.id === selectedProjectIds[0]);
      return proj ? proj.name : '已選 1 個專案';
    }
    return `已選 ${selectedProjectIds.length}/${projects.length} 個專案`;
  };

  // Find color of single selected project for color dot
  const singleSelectedProj =
    selectedProjectIds.length === 1
      ? projects.find((p) => p.id === selectedProjectIds[0])
      : null;

  return (
    <div ref={containerRef} className="relative inline-block text-left select-none">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border text-xs font-medium transition active:scale-95 ${
          isNoneSelected
            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            : selectedProjectIds.length < projects.length
            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
        }`}
        title="篩選甘特圖顯示的專案（支援多選）"
      >
        <Filter
          className={`w-3.5 h-3.5 ${
            isNoneSelected
              ? 'text-amber-600'
              : selectedProjectIds.length < projects.length
              ? 'text-indigo-600'
              : 'text-slate-500'
          }`}
        />

        {singleSelectedProj && (
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              COLOR_OPTIONS[singleSelectedProj.color]?.bg || 'bg-slate-400'
            }`}
          />
        )}

        <span className="truncate max-w-[130px] sm:max-w-[160px]">{getButtonLabel()}</span>

        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Popover Header */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span>專案多選篩選</span>
              <span className="text-[10px] font-normal text-slate-500">
                ({selectedProjectIds.length}/{projects.length})
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2 py-0.5 rounded text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition"
                title="全選所有專案"
              >
                全選
              </button>
              <button
                type="button"
                onClick={handleInvert}
                className="px-2 py-0.5 rounded text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition"
                title="反向選取"
              >
                反選
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2 py-0.5 rounded text-[11px] font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition"
                title="清除所有勾選"
              >
                清空
              </button>
            </div>
          </div>

          {/* Search bar if many projects */}
          {projects.length >= 4 && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/50">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜尋專案名稱..."
                  className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Projects Checkbox List */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-100">
            {filteredProjects.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                找不到相符的專案
              </div>
            ) : (
              filteredProjects.map((project) => {
                const isSelected = selectedProjectIds.includes(project.id);
                const colorMeta = COLOR_OPTIONS[project.color] || COLOR_OPTIONS.blue;
                const taskCount = projectTaskCounts[project.id] || 0;

                return (
                  <div
                    key={project.id}
                    onClick={() => handleToggle(project.id)}
                    className={`group flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-indigo-50/70 hover:bg-indigo-50 text-slate-800'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {/* Left: Checkbox, Color Dot, Project Name */}
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center transition shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'border border-slate-300 bg-white group-hover:border-slate-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colorMeta.bg}`} />

                      <div className="min-w-0">
                        <div
                          className={`truncate font-medium ${
                            isSelected ? 'text-slate-900' : 'text-slate-700'
                          }`}
                          title={project.name}
                        >
                          {project.name}
                        </div>
                        {project.description && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                            {project.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Task Count & Solo Button */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {taskCount} 項
                      </span>

                      {/* Solo view button */}
                      <button
                        type="button"
                        onClick={(e) => handleSolo(project.id, e)}
                        className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        title="只勾選此專案（獨顯）"
                      >
                        只看
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Notice */}
          <div className="p-2 bg-slate-50 border-t border-slate-200 text-[11px] flex items-center justify-between text-slate-500">
            {isNoneSelected ? (
              <span className="text-amber-600 font-medium">⚠️ 目前未勾選任何專案</span>
            ) : (
              <span>甘特圖正顯示 {selectedProjectIds.length} 個專案</span>
            )}

            {!isAllSelected && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
              >
                顯示全部
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
