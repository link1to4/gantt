import { DaySchedule, Project, TaskColorKey, TaskColorMeta, ZoomLevel } from './types';

export const START_HOUR = 8.5;       // 08:30 甘特圖當日開始 (取消早晨準備時段，直接從 08:30 開始)
export const WORK_START_HOUR = 8.5;  // 08:30 正常上班開始
export const LUNCH_START_HOUR = 12;   // 12:00 中午休息開始 (不計工時)
export const LUNCH_END_HOUR = 13;     // 13:00 中午休息結束
export const WORK_END_HOUR = 17.5;    // 17:30 正常上班結束
export const OVERTIME_HOUR = 17.5;    // 17:30 起為加班時段 (別名)
export const END_HOUR = 22;           // 22:00 甘特圖當日結束
export const TOTAL_HOURS = END_HOUR - START_HOUR; // 13.5 hours (08:30 - 22:00)

export interface TimelineSlot {
  hour: number;
  label: string;
  endLabel?: string;
  span: number; // in hours (0.5h or 1.0h)
  sub: string;
  hasMidTick?: boolean;
  isOvertime?: boolean;
}

export type MorningSlot = TimelineSlot;

export const MORNING_SLOTS: TimelineSlot[] = [
  { hour: 8.5, label: '08:30', endLabel: '09:00', span: 0.5, sub: '+0.5h', hasMidTick: false },
  { hour: 9, label: '09:00', endLabel: '10:00', span: 1.0, sub: '+1h', hasMidTick: true },
  { hour: 10, label: '10:00', endLabel: '11:00', span: 1.0, sub: '+1h', hasMidTick: true },
  { hour: 11, label: '11:00', endLabel: '12:00', span: 1.0, sub: '+1h', hasMidTick: true },
];

export const AFTERNOON_SLOTS: TimelineSlot[] = [
  { hour: 13, label: '13:00', endLabel: '14:00', span: 1.0, sub: '下午工時', hasMidTick: true },
  { hour: 14, label: '14:00', endLabel: '15:00', span: 1.0, sub: '+1h', hasMidTick: true },
  { hour: 15, label: '15:00', endLabel: '16:00', span: 1.0, sub: '+1h', hasMidTick: true },
  { hour: 16, label: '16:00', endLabel: '17:00', span: 1.0, sub: '+1h', hasMidTick: true },
  { hour: 17, label: '17:00', endLabel: '17:30', span: 0.5, sub: '+0.5h', hasMidTick: false },
];

export const OVERTIME_SLOTS: TimelineSlot[] = [
  { hour: 17.5, label: '17:30', endLabel: '18:00', span: 0.5, sub: '+0.5h', hasMidTick: false, isOvertime: true },
  { hour: 18, label: '18:00', endLabel: '19:00', span: 1.0, sub: '+1h', hasMidTick: true, isOvertime: true },
  { hour: 19, label: '19:00', endLabel: '20:00', span: 1.0, sub: '+1h', hasMidTick: true, isOvertime: true },
  { hour: 20, label: '20:00', endLabel: '21:00', span: 1.0, sub: '+1h', hasMidTick: true, isOvertime: true },
  { hour: 21, label: '21:00', endLabel: '22:00', span: 1.0, sub: '+1h', hasMidTick: true, isOvertime: true },
];

// Collapsed widths for lunch break and overtime periods
export const COLLAPSED_LUNCH_WIDTH = 28; // 28px compact folded accordion strip for 12:00 - 13:00
export const COLLAPSED_OVERTIME_WIDTH = 0; // 0px completely collapsed (hidden) for 17:30 - 22:00

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
    border: 'border-blue-500',
    text: 'text-white',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    glow: 'shadow-blue-500/20',
  },
  emerald: {
    key: 'emerald',
    label: '翠綠色',
    bg: 'bg-emerald-600 hover:bg-emerald-700',
    border: 'border-emerald-500',
    text: 'text-white',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    glow: 'shadow-emerald-500/20',
  },
  violet: {
    key: 'violet',
    label: '紫羅蘭',
    bg: 'bg-violet-600 hover:bg-violet-700',
    border: 'border-violet-500',
    text: 'text-white',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    glow: 'shadow-violet-500/20',
  },
  amber: {
    key: 'amber',
    label: '琥珀橘',
    bg: 'bg-amber-600 hover:bg-amber-700',
    border: 'border-amber-500',
    text: 'text-white',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    glow: 'shadow-amber-500/20',
  },
  rose: {
    key: 'rose',
    label: '玫瑰紅',
    bg: 'bg-rose-600 hover:bg-rose-700',
    border: 'border-rose-500',
    text: 'text-white',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    glow: 'shadow-rose-500/20',
  },
  cyan: {
    key: 'cyan',
    label: '天青色',
    bg: 'bg-cyan-600 hover:bg-cyan-700',
    border: 'border-cyan-500',
    text: 'text-white',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    glow: 'shadow-cyan-500/20',
  },
  indigo: {
    key: 'indigo',
    label: '靛青藍',
    bg: 'bg-indigo-600 hover:bg-indigo-700',
    border: 'border-indigo-500',
    text: 'text-white',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    glow: 'shadow-indigo-500/20',
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
    dateString: '2026-09-18',
    tasks: [
      {
        id: 'task-101',
        projectId: 'proj-1',
        name: '首頁視覺排版與原型確認',
        startHour: 8.5,
        duration: 3.5,
        color: 'blue',
        notes: '上午正常工時 08:30~12:00 (3.5h)',
      },
      {
        id: 'task-102',
        projectId: 'proj-1',
        name: '響應式斷點與互動特效',
        startHour: 13,
        duration: 4.5,
        color: 'blue',
        notes: '下午正常工時 13:00~17:30 (4.5h)',
      },
      {
        id: 'task-103',
        projectId: 'proj-2',
        name: '用戶認證模組與 Token 快取',
        startHour: 10,
        duration: 4,
        color: 'emerald',
        notes: '跨中午 12:00~13:00 休息時間，自動扣除 1h 不計工時 (實算 3h)',
      },
      {
        id: 'task-104',
        projectId: 'proj-2',
        name: '夜間推播服務連線壓測',
        startHour: 17.5,
        duration: 3,
        color: 'emerald',
        notes: '於加班時段 17:30~20:30 進行伺服器連線壓測 (加班 3h)',
      },
      {
        id: 'task-105',
        projectId: 'proj-3',
        name: '資料庫 Schema 遷移腳本設計',
        startHour: 13.5,
        duration: 4,
        color: 'violet',
        notes: '下午 13:30~17:30 準備跨版本資料結構無縫遷移 (4h)',
      },
    ],
  },
  {
    id: 'day-2',
    label: 'Day 2',
    dateString: '2026-09-19',
    tasks: [
      {
        id: 'task-201',
        projectId: 'proj-1',
        name: '導覽列與全局搜尋框實作',
        startHour: 8.5,
        duration: 3.5,
        color: 'blue',
        notes: '08:30~12:00 整合快捷鍵呼叫搜尋面板',
      },
      {
        id: 'task-202',
        projectId: 'proj-1',
        name: '視覺組件庫單元測試',
        startHour: 13,
        duration: 4,
        color: 'blue',
        notes: '13:00~17:00 針對深淺色主題與對比度做檢查',
      },
      {
        id: 'task-203',
        projectId: 'proj-2',
        name: '首頁 Feed 流離線快取機制',
        startHour: 10.5,
        duration: 3.5,
        color: 'emerald',
        notes: '10:30~14:00 (扣午休 1h，實算 2.5h)',
      },
      {
        id: 'task-204',
        projectId: 'proj-2',
        name: 'App 夜間上架審查準備',
        startHour: 17.5,
        duration: 3,
        color: 'emerald',
        notes: '加班時段 17:30~20:30 處理截圖與隱私條款',
      },
      {
        id: 'task-205',
        projectId: 'proj-3',
        name: 'Redis 快取層命中率優化',
        startHour: 13.5,
        duration: 4,
        color: 'violet',
        notes: '重構熱門商品列表快取鍵策略',
      },
    ],
  },
  {
    id: 'day-3',
    label: 'Day 3',
    dateString: '2026-09-20',
    tasks: [
      {
        id: 'task-301',
        projectId: 'proj-1',
        name: '全站 SEO 標籤與靜態生成測試',
        startHour: 8.5,
        duration: 3.5,
        color: 'blue',
        notes: '08:30~12:00 驗證 OpenGraph 與結構化資料標籤',
      },
      {
        id: 'task-302',
        projectId: 'proj-2',
        name: '藍牙外設配對協定串接',
        startHour: 13,
        duration: 4.5,
        color: 'emerald',
        notes: '13:00~17:30 低功耗藍牙 (BLE) 自動重連機制',
      },
      {
        id: 'task-303',
        projectId: 'proj-3',
        name: 'API Gateway 流量限流演算法',
        startHour: 9.5,
        duration: 4.5,
        color: 'violet',
        notes: '09:30~14:00 (扣午休 1h，實算 3.5h)',
      },
      {
        id: 'task-304',
        projectId: 'proj-3',
        name: '跨叢集災難備援演練 (DR)',
        startHour: 17.5,
        duration: 3.5,
        color: 'violet',
        notes: '17:30~21:00 加班無預警主備機房切換測試',
      },
    ],
  },
];
