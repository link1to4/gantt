import React, { useState, useEffect } from 'react';
import { DaySchedule, Project, Task, ViewGroupingMode, ZoomLevel } from './types';
import { DEFAULT_DAYS, DEFAULT_PROJECTS, ZOOM_CONFIG, START_HOUR, TOTAL_HOURS } from './constants';
import { getDayWidth } from './utils/time';
import { Header } from './components/Header';
import { TimelineHeader } from './components/TimelineHeader';
import { ContinuousTimelineHeader } from './components/ContinuousTimelineHeader';
import { ContinuousProjectRow } from './components/ContinuousProjectRow';
import { DayRow } from './components/DayRow';
import { ProjectViewRow } from './components/ProjectViewRow';
import { TaskModal } from './components/TaskModal';
import { ProjectModal } from './components/ProjectModal';
import { HelpModal } from './components/HelpModal';
import { Plus, FolderPlus, Layers, CalendarRange, Coffee, Moon } from 'lucide-react';

const DAYS_STORAGE_KEY = 'gantt_chart_scheduler_days_v3';
const PROJECTS_STORAGE_KEY = 'gantt_chart_scheduler_projects_v3';
const COLLAPSE_LUNCH_KEY = 'gantt_collapse_lunch_v1';
const COLLAPSE_OVERTIME_KEY = 'gantt_collapse_overtime_v1';

export default function App() {
  // Projects state
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_PROJECTS;
  });

  // Days and Tasks state
  const [days, setDays] = useState<DaySchedule[]>(() => {
    try {
      const saved = localStorage.getItem(DAYS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((day: DaySchedule) => ({
            ...day,
            tasks: day.tasks.map((task: Task) => ({
              ...task,
              projectId: task.projectId || DEFAULT_PROJECTS[0].id,
            })),
          }));
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_DAYS;
  });

  const [zoom, setZoom] = useState<ZoomLevel>('normal');
  const [viewMode, setViewMode] = useState<ViewGroupingMode>('continuous');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);
  const [projectModalOpen, setProjectModalOpen] = useState<boolean>(false);

  // Collapsible Lunch (12:00~13:00) and Overtime (17:30~22:00)
  const [collapseLunch, setCollapseLunch] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSE_LUNCH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [collapseOvertime, setCollapseOvertime] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSE_OVERTIME_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [taskModalState, setTaskModalState] = useState<{
    isOpen: boolean;
    dayId?: string;
    projectId?: string;
    task?: Task | null;
  }>({
    isOpen: false,
    dayId: undefined,
    projectId: undefined,
    task: null,
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(DAYS_STORAGE_KEY, JSON.stringify(days));
    } catch {
      // ignore
    }
  }, [days]);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_LUNCH_KEY, String(collapseLunch));
    } catch {
      // ignore
    }
  }, [collapseLunch]);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_OVERTIME_KEY, String(collapseOvertime));
    } catch {
      // ignore
    }
  }, [collapseOvertime]);

  const hourWidth = ZOOM_CONFIG[zoom].hourWidth;
  const sidebarWidth = 230;
  const dayWidth = getDayWidth(hourWidth, collapseLunch, collapseOvertime);

  // Filtered projects based on header filter
  const visibleProjects =
    selectedProjectFilter === 'all'
      ? projects
      : projects.filter((p) => p.id === selectedProjectFilter);

  // Day handlers
  const handleAddDay = () => {
    const nextNumber = days.length + 1;
    let nextDateStr = '';
    const lastDay = days[days.length - 1];
    if (lastDay?.dateString) {
      const parts = lastDay.dateString.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        d.setDate(d.getDate() + 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dayNum = String(d.getDate()).padStart(2, '0');
        nextDateStr = `${y}-${m}-${dayNum}`;
      }
    }
    if (!nextDateStr) {
      const d = new Date();
      d.setDate(d.getDate() + nextNumber - 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      nextDateStr = `${y}-${m}-${dayNum}`;
    }

    const newDay: DaySchedule = {
      id: `day-${Date.now()}`,
      label: `Day ${nextNumber}`,
      dateString: nextDateStr,
      tasks: [],
    };
    setDays((prev) => [...prev, newDay]);
  };

  const handleUpdateDay = (dayId: string, updates: Partial<DaySchedule>) => {
    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, ...updates } : d))
    );
  };

  const handleDeleteDay = (dayId: string) => {
    if (days.length <= 1) return;
    setDays((prev) => prev.filter((d) => d.id !== dayId));
  };

  const handleMoveTaskAcrossDays = (
    fromDayId: string,
    toDayId: string,
    taskId: string,
    newStartHour: number,
    newDuration?: number
  ) => {
    setDays((prev) => {
      const fromDay = prev.find((d) => d.id === fromDayId);
      const task = fromDay?.tasks.find((t) => t.id === taskId);
      if (!task) return prev;

      const updatedTask: Task = {
        ...task,
        startHour: newStartHour,
        duration: newDuration !== undefined ? newDuration : task.duration,
      };

      if (fromDayId === toDayId) {
        return prev.map((day) => {
          if (day.id !== fromDayId) return day;
          return {
            ...day,
            tasks: day.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
          };
        });
      }

      return prev.map((day) => {
        if (day.id === fromDayId) {
          return {
            ...day,
            tasks: day.tasks.filter((t) => t.id !== taskId),
          };
        }
        if (day.id === toDayId) {
          return {
            ...day,
            tasks: [...day.tasks, updatedTask],
          };
        }
        return day;
      });
    });
  };

  // Project handlers
  const handleAddProject = (newProjData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...newProjData,
      id: `proj-${Date.now()}`,
    };
    setProjects((prev) => [...prev, newProject]);
  };

  const handleUpdateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
    );
  };

  const handleDeleteProject = (projectId: string) => {
    if (projects.length <= 1) return;
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    // Also remove tasks belonging to this project
    setDays((prev) =>
      prev.map((day) => ({
        ...day,
        tasks: day.tasks.filter((t) => t.projectId !== projectId),
      }))
    );
    if (selectedProjectFilter === projectId) {
      setSelectedProjectFilter('all');
    }
  };

  // Task handlers
  const handleAddTask = (
    dayId?: string,
    defaultStartHour?: number,
    defaultProjectId?: string
  ) => {
    const targetDay = dayId || days[0]?.id || '';
    const targetProj = defaultProjectId || (selectedProjectFilter !== 'all' ? selectedProjectFilter : projects[0]?.id || '');

    setTaskModalState({
      isOpen: true,
      dayId: targetDay,
      projectId: targetProj,
      task: defaultStartHour
        ? ({
            id: '',
            projectId: targetProj,
            name: '',
            startHour: defaultStartHour,
            duration: 2,
            color: 'blue',
          } as Task)
        : null,
    });
  };

  const handleOpenEditModal = (dayId: string, task: Task) => {
    setTaskModalState({
      isOpen: true,
      dayId,
      projectId: task.projectId,
      task,
    });
  };

  const handleUpdateTask = (
    dayId: string,
    taskId: string,
    updates: Partial<Task>
  ) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          tasks: day.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updates } : t
          ),
        };
      })
    );
  };

  const handleDeleteTask = (dayId: string, taskId: string) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          tasks: day.tasks.filter((t) => t.id !== taskId),
        };
      })
    );
  };

  const handleSaveTaskModal = (
    targetDayId: string,
    taskData: Omit<Task, 'trackIndex'>,
    isNew: boolean
  ) => {
    setDays((prev) => {
      // Remove any existing task with this id first (handles moving between days)
      const cleaned = prev.map((day) => ({
        ...day,
        tasks: day.tasks.filter((t) => t.id !== taskData.id),
      }));

      return cleaned.map((day) => {
        if (day.id === targetDayId) {
          return {
            ...day,
            tasks: [...day.tasks, taskData as Task],
          };
        }
        return day;
      });
    });
  };

  const handleResetData = () => {
    if (window.confirm('確定要重設為初始專案範例資料嗎？此操作將覆蓋目前的編輯內容。')) {
      setProjects(DEFAULT_PROJECTS);
      setDays(DEFAULT_DAYS);
      setSelectedProjectFilter('all');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation & Controls Header */}
      <Header
        days={days}
        projects={projects}
        zoom={zoom}
        onZoomChange={setZoom}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedProjectFilter={selectedProjectFilter}
        onProjectFilterChange={setSelectedProjectFilter}
        collapseLunch={collapseLunch}
        onToggleCollapseLunch={() => setCollapseLunch((prev) => !prev)}
        collapseOvertime={collapseOvertime}
        onToggleCollapseOvertime={() => setCollapseOvertime((prev) => !prev)}
        onAddDay={handleAddDay}
        onOpenNewTaskModal={(dayId, projId) =>
          handleAddTask(dayId, 9, projId)
        }
        onOpenProjectModal={() => setProjectModalOpen(true)}
        onResetData={handleResetData}
        onToggleHelp={() => setHelpModalOpen(true)}
      />

      {/* Main Gantt Canvas Area */}
      <main className="flex-1 p-3 sm:p-6 max-w-[1700px] w-full mx-auto flex flex-col">
        {/* Gantt Container Card */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Timeline scroll container */}
          <div className="flex-1 overflow-x-auto overflow-y-auto min-h-[420px]">
            <div
              style={{
                minWidth: `${
                  viewMode === 'continuous'
                    ? sidebarWidth + days.length * dayWidth + 140
                    : sidebarWidth + dayWidth
                }px`,
              }}
              className="relative flex flex-col"
            >
              {viewMode === 'continuous' ? (
                /* Continuous Multi-Day Mode: X-axis stretches Day 1 -> Day 2 -> Day 3... */
                <div className="relative flex flex-col">
                  <ContinuousTimelineHeader
                    days={days}
                    hourWidth={hourWidth}
                    sidebarWidth={sidebarWidth}
                    collapseLunch={collapseLunch}
                    onToggleCollapseLunch={() => setCollapseLunch((prev) => !prev)}
                    collapseOvertime={collapseOvertime}
                    onToggleCollapseOvertime={() => setCollapseOvertime((prev) => !prev)}
                    onAddDay={handleAddDay}
                    onUpdateDay={handleUpdateDay}
                    onDeleteDay={handleDeleteDay}
                  />

                  {/* Project Rows across all days */}
                  <div className="divide-y divide-slate-800">
                    {visibleProjects.map((project) => (
                      <ContinuousProjectRow
                        key={project.id}
                        project={project}
                        days={days}
                        hourWidth={hourWidth}
                        sidebarWidth={sidebarWidth}
                        collapseLunch={collapseLunch}
                        collapseOvertime={collapseOvertime}
                        onAddTaskToDay={(dId, startH, pId) => handleAddTask(dId, startH, pId)}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                        onOpenEditModal={handleOpenEditModal}
                        onMoveTaskAcrossDays={handleMoveTaskAcrossDays}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* Grouped Views: by-day or by-project */
                <div className="relative flex flex-col">
                  {/* Timeline Header (Single Day Ruler) */}
                  <TimelineHeader
                    hourWidth={hourWidth}
                    sidebarWidth={sidebarWidth}
                    collapseLunch={collapseLunch}
                    onToggleCollapseLunch={() => setCollapseLunch((prev) => !prev)}
                    collapseOvertime={collapseOvertime}
                    onToggleCollapseOvertime={() => setCollapseOvertime((prev) => !prev)}
                  />

                  {viewMode === 'by-day' ? (
                    /* Group by Day: Under each Day, separate rows for each Project */
                    <div className="divide-y divide-slate-800">
                      {days.map((day, idx) => (
                        <DayRow
                          key={day.id}
                          day={day}
                          dayIndex={idx}
                          totalDays={days.length}
                          projects={visibleProjects}
                          hourWidth={hourWidth}
                          sidebarWidth={sidebarWidth}
                          collapseLunch={collapseLunch}
                          collapseOvertime={collapseOvertime}
                          onUpdateDay={handleUpdateDay}
                          onDeleteDay={handleDeleteDay}
                          onAddTaskToDay={(dId, startH, pId) => handleAddTask(dId, startH, pId)}
                          onUpdateTask={handleUpdateTask}
                          onDeleteTask={handleDeleteTask}
                          onOpenEditModal={handleOpenEditModal}
                          onOpenProjectModal={() => setProjectModalOpen(true)}
                        />
                      ))}
                    </div>
                  ) : (
                    /* Group by Project: Under each Project, separate rows for each Day */
                    <div className="divide-y divide-slate-800">
                      {visibleProjects.map((project) => (
                        <ProjectViewRow
                          key={project.id}
                          project={project}
                          days={days}
                          hourWidth={hourWidth}
                          sidebarWidth={sidebarWidth}
                          collapseLunch={collapseLunch}
                          collapseOvertime={collapseOvertime}
                          onUpdateProject={handleUpdateProject}
                          onDeleteProject={handleDeleteProject}
                          onAddTaskToDay={(dId, startH, pId) => handleAddTask(dId, startH, pId)}
                          onUpdateTask={handleUpdateTask}
                          onDeleteTask={handleDeleteTask}
                          onOpenEditModal={handleOpenEditModal}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Bottom Bar */}
          <div className="px-4 sm:px-6 py-3 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-500"></span>
                <span>正常工時 (08:30 - 17:30，共 8h)</span>
              </span>

              <button
                onClick={() => setCollapseLunch((prev) => !prev)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition ${
                  collapseLunch 
                    ? 'bg-amber-950/40 text-amber-300 border-amber-500/50' 
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="點擊切換午休時段收折"
              >
                <Coffee className="w-3 h-3 text-amber-400" />
                <span>午休 (12:00 - 13:00 不計工時)</span>
                <span className="text-[10px] font-mono px-1 rounded bg-slate-900 text-amber-400">
                  {collapseLunch ? '已收折' : '點擊收折'}
                </span>
              </button>

              <button
                onClick={() => setCollapseOvertime((prev) => !prev)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition ${
                  collapseOvertime 
                    ? 'bg-amber-950/40 text-amber-300 border-amber-500/50' 
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="點擊切換加班時段收折"
              >
                <Moon className="w-3 h-3 text-amber-400" />
                <span>加班 (17:30 - 22:00)</span>
                <span className="text-[10px] font-mono px-1 rounded bg-slate-900 text-amber-400">
                  {collapseOvertime ? '已收折' : '點擊收折'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setProjectModalOpen(true)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>管理專案維度</span>
              </button>

              <button
                onClick={handleAddDay}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>增加下一天 (Day {days.length + 1})</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={taskModalState.isOpen}
        onClose={() =>
          setTaskModalState({ isOpen: false, dayId: undefined, projectId: undefined, task: null })
        }
        days={days}
        projects={projects}
        initialDayId={taskModalState.dayId}
        initialProjectId={taskModalState.projectId}
        initialTask={taskModalState.task}
        onSave={handleSaveTaskModal}
        onDelete={handleDeleteTask}
      />

      {/* Project Management Modal */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        projects={projects}
        days={days}
        onAddProject={handleAddProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </div>
  );
}
