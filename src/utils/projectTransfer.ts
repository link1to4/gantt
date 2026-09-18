import { Project, DaySchedule, Task, TaskColorKey } from '../types';
import { COLOR_OPTIONS } from '../constants';

export interface SingleProjectExportData {
  version: '1.0';
  type: 'single-project';
  exportedAt: string;
  project: Project;
  daysWithTasks: {
    dayLabel: string;
    dateString?: string;
    tasks: Omit<Task, 'projectId'>[];
  }[];
}

export interface AllProjectsExportData {
  version: '1.0';
  type: 'all-projects';
  exportedAt: string;
  projects: Project[];
  days: DaySchedule[];
}

export type ParsedImportResult =
  | {
      type: 'single-project';
      project: Project;
      daysWithTasks: {
        dayLabel: string;
        dateString?: string;
        tasks: Omit<Task, 'projectId'>[];
      }[];
      totalTasksCount: number;
    }
  | {
      type: 'all-projects';
      projects: Project[];
      days: DaySchedule[];
      totalTasksCount: number;
    };

/**
 * Triggers a file download of a JSON object in the browser
 */
export function downloadJsonFile(filename: string, data: unknown): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports a single project along with its tasks across all days
 */
export function exportSingleProject(project: Project, days: DaySchedule[]): void {
  const daysWithTasks = days
    .map((d) => {
      const projTasks = d.tasks.filter((t) => t.projectId === project.id);
      if (projTasks.length === 0) return null;
      return {
        dayLabel: d.label,
        dateString: d.dateString,
        tasks: projTasks.map(({ projectId: _, ...rest }) => rest),
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  const exportData: SingleProjectExportData = {
    version: '1.0',
    type: 'single-project',
    exportedAt: new Date().toISOString(),
    project,
    daysWithTasks,
  };

  const safeName = project.name.replace(/[/\\?%*:|"<>]/g, '_').trim() || '專案';
  const dateTag = new Date().toISOString().slice(0, 10);
  downloadJsonFile(`${safeName}_專案匯出_${dateTag}.json`, exportData);
}

/**
 * Exports all projects and all days into a complete backup JSON
 */
export function exportAllProjects(projects: Project[], days: DaySchedule[]): void {
  const exportData: AllProjectsExportData = {
    version: '1.0',
    type: 'all-projects',
    exportedAt: new Date().toISOString(),
    projects,
    days,
  };

  const dateTag = new Date().toISOString().slice(0, 10);
  downloadJsonFile(`甘特圖全專案排程備份_${dateTag}.json`, exportData);
}

/**
 * Safely parses and validates an uploaded project JSON file
 */
export function parseProjectImport(jsonContent: string): ParsedImportResult {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonContent);
  } catch {
    throw new Error('檔案格式錯誤：不是有效的 JSON 檔案，請確認檔案內容');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('無效的專案資料：檔案未包含有效物件');
  }

  // Case 1: Single project export format
  if (parsed.type === 'single-project' || (parsed.project && Array.isArray(parsed.daysWithTasks))) {
    const rawProj = parsed.project;
    if (!rawProj || typeof rawProj.name !== 'string') {
      throw new Error('無效的專案資料：缺少專案名稱 (project.name)');
    }

    const colorKeys = Object.keys(COLOR_OPTIONS) as TaskColorKey[];
    const validColor: TaskColorKey = colorKeys.includes(rawProj.color) ? rawProj.color : 'blue';

    const cleanProject: Project = {
      id: rawProj.id || `proj-${Date.now()}`,
      name: String(rawProj.name).trim(),
      color: validColor,
      description: rawProj.description ? String(rawProj.description) : undefined,
    };

    const daysWithTasks: SingleProjectExportData['daysWithTasks'] = [];
    let totalTasksCount = 0;

    if (Array.isArray(parsed.daysWithTasks)) {
      parsed.daysWithTasks.forEach((dItem: any) => {
        if (!dItem || !Array.isArray(dItem.tasks)) return;
        const validTasks = dItem.tasks
          .filter((t: any) => t && typeof t.name === 'string' && typeof t.startHour === 'number')
          .map((t: any) => ({
            id: t.id || `task-${Math.random().toString(36).substr(2, 8)}`,
            name: String(t.name),
            startHour: Math.max(8, Math.min(21.5, Number(t.startHour))),
            duration: Math.max(0.5, Math.min(14, Number(t.duration) || 1)),
            color: t.color && colorKeys.includes(t.color) ? t.color : validColor,
            notes: t.notes ? String(t.notes) : undefined,
            trackIndex: typeof t.trackIndex === 'number' ? t.trackIndex : 0,
          }));

        totalTasksCount += validTasks.length;
        daysWithTasks.push({
          dayLabel: String(dItem.dayLabel || 'Day 1'),
          dateString: dItem.dateString ? String(dItem.dateString) : undefined,
          tasks: validTasks,
        });
      });
    }

    return {
      type: 'single-project',
      project: cleanProject,
      daysWithTasks,
      totalTasksCount,
    };
  }

  // Case 2: Full system / all projects backup format
  if (parsed.type === 'all-projects' || (Array.isArray(parsed.projects) && Array.isArray(parsed.days))) {
    const rawProjects = parsed.projects;
    const rawDays = parsed.days;

    if (!Array.isArray(rawProjects) || rawProjects.length === 0) {
      throw new Error('備份檔案中未包含任何專案 (projects)');
    }

    const colorKeys = Object.keys(COLOR_OPTIONS) as TaskColorKey[];

    const validProjects: Project[] = rawProjects.map((p: any, idx: number) => ({
      id: p.id || `proj-${Date.now()}-${idx}`,
      name: String(p.name || `專案 ${idx + 1}`).trim(),
      color: p.color && colorKeys.includes(p.color) ? p.color : 'blue',
      description: p.description ? String(p.description) : undefined,
    }));

    let totalTasksCount = 0;
    const validDays: DaySchedule[] = rawDays.map((d: any, dIdx: number) => {
      const dayTasks = Array.isArray(d.tasks)
        ? d.tasks
            .filter((t: any) => t && typeof t.name === 'string' && typeof t.startHour === 'number')
            .map((t: any) => {
              totalTasksCount++;
              return {
                id: t.id || `task-${Math.random().toString(36).substr(2, 8)}`,
                projectId: t.projectId || validProjects[0].id,
                name: String(t.name),
                startHour: Math.max(8, Math.min(21.5, Number(t.startHour))),
                duration: Math.max(0.5, Math.min(14, Number(t.duration) || 1)),
                color: t.color && colorKeys.includes(t.color) ? t.color : undefined,
                notes: t.notes ? String(t.notes) : undefined,
                trackIndex: typeof t.trackIndex === 'number' ? t.trackIndex : 0,
              };
            })
        : [];

      return {
        id: d.id || `day-${Date.now()}-${dIdx}`,
        label: String(d.label || `Day ${dIdx + 1}`),
        dateString: d.dateString ? String(d.dateString) : undefined,
        tasks: dayTasks,
      };
    });

    return {
      type: 'all-projects',
      projects: validProjects,
      days: validDays,
      totalTasksCount,
    };
  }

  // Case 3: Generic Project object fallback
  if (parsed.name && (parsed.color || parsed.id)) {
    const colorKeys = Object.keys(COLOR_OPTIONS) as TaskColorKey[];
    return {
      type: 'single-project',
      project: {
        id: `proj-${Date.now()}`,
        name: String(parsed.name).trim(),
        color: colorKeys.includes(parsed.color) ? parsed.color : 'blue',
        description: parsed.description ? String(parsed.description) : undefined,
      },
      daysWithTasks: [],
      totalTasksCount: 0,
    };
  }

  throw new Error('無法辨識的專案檔案格式。支援單一專案匯出 JSON 或全專案排程備份 JSON。');
}
