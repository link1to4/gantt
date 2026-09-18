import React, { useState } from 'react';
import { Sun, Moon, Plus, Trash2, Calendar, Edit2, Check } from 'lucide-react';
import { DaySchedule } from '../types';
import { START_HOUR, OVERTIME_HOUR, END_HOUR, TOTAL_HOURS } from '../constants';
import { formatHour, calculateTaskHours, formatDateLabel } from '../utils/time';

interface ContinuousTimelineHeaderProps {
  days: DaySchedule[];
  hourWidth: number;
  sidebarWidth: number;
  onAddDay: () => void;
  onUpdateDay: (dayId: string, updates: Partial<DaySchedule>) => void;
  onDeleteDay: (dayId: string) => void;
}

export const ContinuousTimelineHeader: React.FC<ContinuousTimelineHeaderProps> = ({
  days,
  hourWidth,
  sidebarWidth,
  onAddDay,
  onUpdateDay,
  onDeleteDay,
}) => {
  const normalSpan = OVERTIME_HOUR - START_HOUR; // 10 hours
  const overtimeSpan = END_HOUR - OVERTIME_HOUR; // 4 hours
  const dayWidth = TOTAL_HOURS * hourWidth;

  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDate, setEditDate] = useState('');

  const handleStartEdit = (day: DaySchedule) => {
    setEditingDayId(day.id);
    setEditLabel(day.label);
    setEditDate(day.dateString || '');
  };

  const handleSaveEdit = (dayId: string) => {
    onUpdateDay(dayId, {
      label: editLabel.trim() || undefined,
      dateString: editDate.trim() || undefined,
    });
    setEditingDayId(null);
  };

  return (
    <div className="sticky top-0 z-30 bg-slate-900 border-b border-slate-700 shadow-md select-none">
      {/* Row 1: Day Titles, Dates, and Day Summary Bar */}
      <div className="flex border-b border-slate-800 text-xs">
        {/* Left corner sticky sidebar title */}
        <div
          style={{ width: sidebarWidth }}
          className="flex-shrink-0 px-4 py-2 bg-slate-950 border-r border-slate-800 text-slate-300 flex items-center justify-between shadow-xs"
        >
          <div>
            <span className="font-bold text-white text-xs sm:text-sm">專案維度</span>
            <div className="text-[10px] text-slate-400 font-mono">X軸: 多日連續延伸</div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono">
            共 {days.length} 天
          </span>
        </div>

        {/* Days Horizontal Extension List */}
        <div className="flex">
          {days.map((day, idx) => {
            // Aggregate hours for this day
            let dayNormal = 0;
            let dayOvertime = 0;
            day.tasks.forEach((t) => {
              const { normalHours, overtimeHours } = calculateTaskHours(t.startHour, t.duration);
              dayNormal += normalHours;
              dayOvertime += overtimeHours;
            });

            const isEditing = editingDayId === day.id;

            return (
              <div
                key={day.id}
                style={{ width: dayWidth }}
                className="flex-shrink-0 px-3 py-1.5 bg-slate-900 border-r-2 border-indigo-500/50 flex items-center justify-between gap-2 transition-colors relative group/dayhdr"
              >
                {/* Left: Day Label and Date */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    D{idx + 1}
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="px-1.5 py-0.5 w-16 bg-slate-800 border border-indigo-500 rounded text-xs text-white"
                        placeholder="名稱"
                      />
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="px-1.5 py-0.5 bg-slate-800 border border-indigo-500 rounded text-xs text-white font-mono"
                      />
                      <button
                        onClick={() => handleSaveEdit(day.id)}
                        className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-500"
                        title="儲存"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="font-bold text-white text-sm truncate">
                        {day.label}
                      </span>
                      {day.dateString && (
                        <span className="text-[11px] text-sky-400 font-mono flex items-center gap-0.5 flex-shrink-0">
                          <Calendar className="w-3 h-3 text-sky-400" />
                          {formatDateLabel(day.dateString)}
                        </span>
                      )}
                      <button
                        onClick={() => handleStartEdit(day)}
                        className="opacity-0 group-hover/dayhdr:opacity-100 p-1 text-slate-400 hover:text-white transition"
                        title="編輯日期與名稱"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Day statistics badge & delete button */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                      {day.tasks.length} 項
                    </span>
                    {dayNormal > 0 && (
                      <span className="text-sky-400 font-mono bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-800/40">
                        常 {dayNormal}h
                      </span>
                    )}
                    {dayOvertime > 0 && (
                      <span className="text-amber-400 font-mono font-bold bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/40 flex items-center gap-0.5">
                        <Moon className="w-2.5 h-2.5" />
                        加 {dayOvertime}h
                      </span>
                    )}
                  </div>

                  {days.length > 1 && (
                    <button
                      onClick={() => {
                        if (window.confirm(`確定要刪除 ${day.label} (${day.dateString || ''}) 嗎？`)) {
                          onDeleteDay(day.id);
                        }
                      }}
                      className="opacity-0 group-hover/dayhdr:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 rounded transition"
                      title={`刪除 ${day.label}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Quick inline "+ 增加日期" button on the far right of header */}
          <div className="flex items-center px-4 bg-slate-900/60 border-r border-slate-800">
            <button
              onClick={onAddDay}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-400 bg-sky-950/50 hover:bg-sky-900/60 border border-sky-700/60 transition flex items-center gap-1.5 whitespace-nowrap active:scale-95 shadow-xs"
              title="在時間軸 X 軸向右延伸下一天"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>增加日期 (Day {days.length + 1})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Normal vs Overtime Phase Range Bar */}
      <div className="flex border-b border-slate-800 text-[11px] font-medium tracking-wide">
        {/* Left corner spacer */}
        <div
          style={{ width: sidebarWidth }}
          className="flex-shrink-0 px-4 py-1 border-r border-slate-800 bg-slate-950 text-slate-400 flex items-center justify-between"
        >
          <span className="font-semibold text-slate-300">時段分配</span>
          <span className="text-[10px] text-slate-400 font-mono">步進: 30分 (0.5h)</span>
        </div>

        {/* Phase strips for each day */}
        <div className="flex">
          {days.map((day) => (
            <div key={day.id} className="flex flex-shrink-0 border-r-2 border-indigo-500/50">
              {/* Normal hours indicator strip */}
              <div
                style={{ width: normalSpan * hourWidth }}
                className="flex-shrink-0 bg-sky-950/40 text-sky-300 border-r-2 border-amber-500/80 px-2 py-1 flex items-center gap-1.5 justify-center"
              >
                <Sun className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-semibold">正常工時 (08:00 - 18:00)</span>
                <span className="text-[10px] px-1 bg-sky-900/60 rounded text-sky-200 font-mono">10h</span>
              </div>

              {/* Overtime hours indicator strip */}
              <div
                style={{ width: overtimeSpan * hourWidth }}
                className="flex-shrink-0 bg-amber-950/40 text-amber-300 px-2 py-1 flex items-center gap-1.5 justify-center"
              >
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">加班時段 (18:00 - 22:00)</span>
                <span className="text-[10px] px-1 bg-amber-900/60 rounded text-amber-200 font-mono">4h</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Hourly Ticks Strip with 30m ticks */}
      <div className="flex bg-slate-900 text-xs">
        {/* Left header column */}
        <div
          style={{ width: sidebarWidth }}
          className="flex-shrink-0 px-4 py-2 border-r border-slate-800 bg-slate-900 flex items-center justify-between text-slate-300 font-semibold"
        >
          <span>專案維度</span>
          <span className="text-[10px] text-slate-500 font-mono">獨立分列呈現</span>
        </div>

        {/* Hourly cells across all days */}
        <div className="flex relative">
          {days.map((day, dIdx) => (
            <div
              key={day.id}
              className="flex relative border-r-2 border-indigo-500/50"
            >
              {Array.from({ length: TOTAL_HOURS }).map((_, i) => {
                const hour = START_HOUR + i;
                const isOvertime = hour >= OVERTIME_HOUR;

                return (
                  <div
                    key={hour}
                    style={{ width: hourWidth }}
                    className={`flex-shrink-0 text-center py-1.5 border-r border-slate-800/80 flex flex-col justify-center items-center relative transition-colors ${
                      isOvertime
                        ? 'bg-amber-950/20 text-amber-400 font-semibold'
                        : 'bg-slate-900 text-slate-300 font-medium'
                    }`}
                  >
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xs font-mono">{formatHour(hour)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono scale-90">
                      {hour === OVERTIME_HOUR ? '加班起' : `+1h`}
                    </div>
                    {/* Half-hour 30-min tick mark */}
                    <div
                      className="absolute left-1/2 bottom-0 w-[1px] h-2 bg-slate-700/80 pointer-events-none"
                      title="30分鐘"
                    />
                  </div>
                );
              })}

              {/* Day boundary end-hour mark (22:00) */}
              <div className="absolute right-0 top-0 bottom-0 flex items-center translate-x-1/2 pointer-events-none z-10">
                <span className="text-[9px] text-amber-400 bg-slate-950 px-1 py-0.5 rounded border border-amber-500/40 font-mono">
                  22:00
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
