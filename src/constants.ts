import { DaySchedule, Project, TaskColorKey, TaskColorMeta, ZoomLevel } from './types';

export const START_HOUR = 8;
export const OVERTIME_HOUR = 18;
export const END_HOUR = 22;
export const TOTAL_HOURS = END_HOUR - START_HOUR; // 14 hours

export const ZOOM_CONFIG: Record<ZoomLevel, { label: string; hourWidth: number }> = {
  compact: { label: '緊湊', hourWidth: 54 },
  normal: { label: '標準', hourWidth: 72 },
  spacious: { label: '寬敞', hourWidth: 92 },
};

export const COLOR_OPTIONS: Record<TaskColorKey, TaskColorMeta> = {
  blue: {
    key: 'blue',
    label: '海洋藍',
    bg: 'bg-blue-600 hover:bg-blue-700',
    border: 'border-blue-400/40',
    text: 'text-white',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    glow: 'shadow-blue-500/25',
  },
  emerald: {
    key: 'emerald',
    label: '翠綠色',
    bg: 'bg-emerald-600 hover:bg-emerald-700',
    border: 'border-emerald-400/40',
    text: 'text-white',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    glow: 'shadow-emerald-500/25',
  },
  violet: {
    key: 'violet',
    label: '紫羅蘭',
    bg: 'bg-violet-600 hover:bg-violet-700',
    border: 'border-violet-400/40',
    text: 'text-white',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-400/30',
    glow: 'shadow-violet-500/25',
  },
  amber: {
    key: 'amber',
    label: '琥珀橘',
    bg: 'bg-amber-600 hover:bg-amber-700',
    border: 'border-amber-400/40',
    text: 'text-white',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    glow: 'shadow-amber-500/25',
  },
  rose: {
    key: 'rose',
    label: '玫瑰紅',
    bg: 'bg-rose-600 hover:bg-rose-700',
    border: 'border-rose-400/40',
    text: 'text-white',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
    glow: 'shadow-rose-500/25',
  },
  cyan: {
    key: 'cyan',
    label: '天青色',
    bg: 'bg-cyan-600 hover:bg-cyan-700',
    border: 'border-cyan-400/40',
    text: 'text-white',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
    glow: 'shadow-cyan-500/25',
  },
  indigo: {
    key: 'indigo',
    label: '靛青藍',
    bg: 'bg-indigo-600 hover:bg-indigo-700',
    border: 'border-indigo-400/40',
    text: 'text-white',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
    glow: 'shadow-indigo-500/25',
  },
};

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: '官網改版專案',
    color: 'blue',
    description: '官方網站 UI/UX 改版與前台互動實作',
  },
  {
    id: 'proj-2',
    name: '行動 App 開發',
    color: 'emerald',
    description: '跨平台行動應用程式功能與 API 串接',
  },
  {
    id: 'proj-3',
    name: '後端與資料庫重構',
    color: 'violet',
    description: '核心服務微服務化與資料庫效能優化',
  },
];

export const DEFAULT_DAYS: DaySchedule[] = [
  {
    id: 'day-1',
    label: 'Day 1',
    tasks: [
      {
        id: 'task-101',
        projectId: 'proj-1',
        name: '首頁視覺排版與原型確認',
        startHour: 9,
        duration: 3,
        color: 'blue',
        notes: '完成首頁區塊設計並提交評審',
      },
      {
        id: 'task-102',
        projectId: 'proj-1',
        name: '響應式斷點與互動特效',
        startHour: 14,
        duration: 3,
        color: 'blue',
        notes: '手機與平板檢視適配',
      },
      {
        id: 'task-103',
        projectId: 'proj-2',
        name: '用戶認證模組與 Token 快取',
        startHour: 10,
        duration: 4,
        color: 'emerald',
        notes: '實作 OAuth2 與本機安全儲存',
      },
      {
        id: 'task-104',
        projectId: 'proj-2',
        name: '夜間推播服務連線壓測',
        startHour: 18,
        duration: 3,
        color: 'emerald',
        notes: '於加班時段進行伺服器連線壓測',
      },
      {
        id: 'task-105',
        projectId: 'proj-3',
        name: '資料庫 Schema 遷移腳本設計',
        startHour: 13,
        duration: 4,
        color: 'violet',
        notes: '準備跨版本資料結構無縫遷移',
      },
    ],
  },
];
