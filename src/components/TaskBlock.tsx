import React, { useState, useRef } from 'react';
import { GripVertical, Pencil, X, Moon, Clock } from 'lucide-react';
import { Task, DragMode } from '../types';
import { START_HOUR, END_HOUR, OVERTIME_HOUR, COLOR_OPTIONS } from '../constants';
import { formatTimeRange, calculateTaskHours, clampTaskBounds } from '../utils/time';

interface TaskBlockProps {
  task: Task;
  dayId: string;
  hourWidth: number;
  rowHeight: number;
  onUpdateTask: (dayId: string, taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (dayId: string, taskId: string) => void;
  onOpenEditModal: (dayId: string, task: Task) => void;
}

export const TaskBlock: React.FC<TaskBlockProps> = ({
  task,
  dayId,
  hourWidth,
  rowHeight,
  onUpdateTask,
  onDeleteTask,
  onOpenEditModal,
}) => {
  const [dragState, setDragState] = useState<{
    mode: DragMode;
    startClientX: number;
    initialStart: number;
    initialDuration: number;
    previewStart: number;
    previewDuration: number;
  } | null>(null);

  const blockRef = useRef<HTMLDivElement>(null);

  // Active or preview values
  const currentStart = dragState ? dragState.previewStart : task.startHour;
  const currentDuration = dragState ? dragState.previewDuration : task.duration;

  // Geometry: 0.5h minimum width = (hourWidth * 0.5) - 6
  const minBlockWidth = Math.max(26, Math.round(hourWidth * 0.5) - 6);
  const leftPx = (currentStart - START_HOUR) * hourWidth + 3;
  const widthPx = Math.max(minBlockWidth, currentDuration * hourWidth - 6);
  const trackIndex = task.trackIndex || 0;
  const topPx = trackIndex * (rowHeight + 8) + 8;

  // Overtime calculations
  const { normalHours, overtimeHours } = calculateTaskHours(currentStart, currentDuration);
  const hasOvertime = overtimeHours > 0;

  const colorKey = task.color || 'blue';
  const colorMeta = COLOR_OPTIONS[colorKey] || COLOR_OPTIONS.blue;

  // Handlers for mouse and touch dragging (30-minute / 0.5-hour step)
  const startInteraction = (
    mode: DragMode,
    clientX: number,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    e.stopPropagation();

    const initial = {
      mode,
      startClientX: clientX,
      initialStart: task.startHour,
      initialDuration: task.duration,
      previewStart: task.startHour,
      previewDuration: task.duration,
    };

    setDragState(initial);

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX =
        'touches' in moveEvent
          ? moveEvent.touches[0].clientX
          : moveEvent.clientX;

      const deltaX = currentX - initial.startClientX;
      // Snapping to half-hour (30 minutes)
      const halfHourWidth = hourWidth / 2;
      const deltaHalfHours = Math.round(deltaX / halfHourWidth);
      const deltaHours = deltaHalfHours * 0.5;

      if (mode === 'move') {
        const rawNewStart = initial.initialStart + deltaHours;
        const maxStart = END_HOUR - initial.initialDuration;
        const boundedStart = Math.max(START_HOUR, Math.min(maxStart, rawNewStart));

        setDragState((prev) =>
          prev
            ? {
                ...prev,
                previewStart: boundedStart,
                previewDuration: initial.initialDuration,
              }
            : null
        );
      } else if (mode === 'resize-end') {
        const rawNewDuration = initial.initialDuration + deltaHours;
        const maxDuration = END_HOUR - initial.initialStart;
        // Minimum duration is 0.5 hour (30 mins)
        const boundedDuration = Math.max(0.5, Math.min(maxDuration, rawNewDuration));

        setDragState((prev) =>
          prev
            ? {
                ...prev,
                previewStart: initial.initialStart,
                previewDuration: boundedDuration,
              }
            : null
        );
      } else if (mode === 'resize-start') {
        const originalEnd = initial.initialStart + initial.initialDuration;
        const rawNewStart = initial.initialStart + deltaHours;
        // Start cannot exceed originalEnd - 0.5
        const boundedStart = Math.max(START_HOUR, Math.min(originalEnd - 0.5, rawNewStart));
        const boundedDuration = Math.round((originalEnd - boundedStart) * 10) / 10;

        setDragState((prev) =>
          prev
            ? {
                ...prev,
                previewStart: boundedStart,
                previewDuration: boundedDuration,
              }
            : null
        );
      }
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);

      setDragState((current) => {
        if (current) {
          const bounded = clampTaskBounds(current.previewStart, current.previewDuration);
          if (
            bounded.startHour !== task.startHour ||
            bounded.duration !== task.duration
          ) {
            onUpdateTask(dayId, task.id, {
              startHour: bounded.startHour,
              duration: bounded.duration,
            });
          }
        }
        return null;
      });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  const handleDoubleClickTitle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = window.prompt('修改任務名稱：', task.name);
    if (newName && newName.trim()) {
      onUpdateTask(dayId, task.id, { name: newName.trim() });
    }
  };

  const isVeryNarrow = widthPx < 60;
  const isCompact = widthPx < 100;

  return (
    <div
      ref={blockRef}
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
        top: `${topPx}px`,
        height: `${rowHeight}px`,
      }}
      className={`group absolute rounded-lg border shadow-md flex items-center justify-between transition-all select-none ${
        colorMeta.bg
      } ${colorMeta.border} ${colorMeta.text} ${colorMeta.glow} ${
        dragState
          ? 'z-40 scale-[1.02] shadow-2xl opacity-95 ring-2 ring-white/80'
          : 'z-10 hover:z-20 hover:shadow-lg'
      }`}
      onMouseDown={(e) => {
        // Only trigger move if clicked directly or on body, not on buttons or handles
        if (
          (e.target as HTMLElement).closest('.task-action-btn') ||
          (e.target as HTMLElement).closest('.resize-handle')
        ) {
          return;
        }
        startInteraction('move', e.clientX, e);
      }}
      onTouchStart={(e) => {
        if (
          (e.target as HTMLElement).closest('.task-action-btn') ||
          (e.target as HTMLElement).closest('.resize-handle')
        ) {
          return;
        }
        startInteraction('move', e.touches[0].clientX, e);
      }}
    >
      {/* Left Resize Handle (Adjusts start time in 30-min steps) */}
      <div
        className="resize-handle absolute left-0 top-0 bottom-0 w-2.5 sm:w-3 cursor-ew-resize hover:bg-white/30 active:bg-white/50 flex items-center justify-center rounded-l-lg transition-colors group/left z-20"
        title="拖拉調整開始時間 (以30分鐘為單位)"
        onMouseDown={(e) => startInteraction('resize-start', e.clientX, e)}
        onTouchStart={(e) => startInteraction('resize-start', e.touches[0].clientX, e)}
      >
        <div className="w-1 h-3.5 bg-white/40 rounded-full group-hover/left:bg-white/90" />
      </div>

      {/* Main Task Content */}
      <div className={`flex items-center justify-between w-full h-full ${isVeryNarrow ? 'px-2' : 'pl-3 pr-2'} overflow-hidden pointer-events-auto`}>
        <div className="flex items-center gap-1 min-w-0 overflow-hidden">
          {!isVeryNarrow && (
            <GripVertical className="w-3 h-3 text-white/50 flex-shrink-0 cursor-grab active:cursor-grabbing" />
          )}
          
          <div className="flex flex-col min-w-0 justify-center">
            <div className="flex items-center gap-1 min-w-0">
              <span
                onDoubleClick={handleDoubleClickTitle}
                className="text-xs sm:text-sm font-semibold truncate leading-snug cursor-text"
                title={`${task.name} (${formatTimeRange(currentStart, currentDuration)}, 雙擊改名)`}
              >
                {task.name}
              </span>

              {hasOvertime && !isCompact && (
                <span
                  className="hidden sm:inline-flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded bg-amber-500 text-slate-900 font-bold shadow-xs flex-shrink-0"
                  title={`含 ${overtimeHours} 小時加班時段`}
                >
                  <Moon className="w-2 h-2" />
                  加班 {overtimeHours}h
                </span>
              )}
            </div>

            {!isVeryNarrow && (
              <div className="flex items-center gap-1 text-[10px] text-white/80 font-mono">
                <Clock className="w-2.5 h-2.5 text-white/60" />
                <span className="truncate">{formatTimeRange(currentStart, currentDuration)}</span>
                <span>({currentDuration}h)</span>
              </div>
            )}
          </div>
        </div>

        {/* Action icons */}
        {!isVeryNarrow && (
          <div className="flex items-center gap-0.5 ml-1 flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenEditModal(dayId, task);
              }}
              className="task-action-btn p-1 rounded hover:bg-black/25 text-white/80 hover:text-white transition opacity-80 group-hover:opacity-100"
              title="編輯項目詳情"
            >
              <Pencil className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTask(dayId, task.id);
              }}
              className="task-action-btn p-1 rounded hover:bg-rose-500 text-white/80 hover:text-white transition opacity-80 group-hover:opacity-100"
              title="刪除此項目"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Right Resize Handle (Adjusts end time / duration in 30-min steps) */}
      <div
        className="resize-handle absolute right-0 top-0 bottom-0 w-2.5 sm:w-3 cursor-ew-resize hover:bg-white/30 active:bg-white/50 flex items-center justify-center rounded-r-lg transition-colors group/right z-20"
        title="拖拉調整結束時間 / 持續長度 (以30分鐘為單位)"
        onMouseDown={(e) => startInteraction('resize-end', e.clientX, e)}
        onTouchStart={(e) => startInteraction('resize-end', e.touches[0].clientX, e)}
      >
        <div className="w-1 h-3.5 bg-white/40 rounded-full group-hover/right:bg-white/90" />
      </div>

      {/* Floating Active Drag Tooltip */}
      {dragState && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md shadow-xl border border-slate-700 pointer-events-none flex items-center gap-2 whitespace-nowrap z-50">
          <span className="font-mono font-bold text-sky-400">
            {formatTimeRange(currentStart, currentDuration)}
          </span>
          <span className="text-slate-400">|</span>
          <span className="font-semibold">{currentDuration} 小時</span>
          {hasOvertime && (
            <span className="text-amber-400 font-bold flex items-center gap-0.5">
              (含加班 {overtimeHours}h)
            </span>
          )}
        </div>
      )}
    </div>
  );
};
