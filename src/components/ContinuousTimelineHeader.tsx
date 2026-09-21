import React, { useState } from 'react';
import { Sun, Moon, Plus, Trash2, Calendar, Edit2, Check, Coffee } from 'lucide-react';
import { DaySchedule } from '../types';
import { 
  START_HOUR, 
  WORK_START_HOUR, 
  LUNCH_START_HOUR, 
  LUNCH_END_HOUR, 
  WORK_END_HOUR, 
  OVERTIME_HOUR, 
  END_HOUR,
  COLLAPSED_LUNCH_WIDTH,
  COLLAPSED_OVERTIME_WIDTH,
  MORNING_SLOTS,
  AFTERNOON_SLOTS,
  OVERTIME_SLOTS
} from '../constants';
import { formatHour, calculateTaskHours, formatDateLabel, getDayWidth } from '../utils/time';

interface ContinuousTimelineHeaderProps {
  days: DaySchedule[];
  hourWidth: number;
  sidebarWidth: number;
  collapseLunch?: boolean;
  onToggleCollapseLunch?: () => void;
  collapseOvertime?: boolean;
  onToggleCollapseOvertime?: () => void;
  onAddDay: () => void;
  onUpdateDay: (dayId: string, updates: Partial<DaySchedule>) => void;
  onDeleteDay: (dayId: string) => void;
}

export const ContinuousTimelineHeader: React.FC<ContinuousTimelineHeaderProps> = ({
  days,
  hourWidth,
  sidebarWidth,
  collapseLunch = false,
  onToggleCollapseLunch,
  collapseOvertime = false,
  onToggleCollapseOvertime,
  onAddDay,
  onUpdateDay,
  onDeleteDay,
}) => {
  const morningSpan = LUNCH_START_HOUR - START_HOUR; // 3.5h (08:30 - 12:00)
  const lunchSpan = LUNCH_END_HOUR - LUNCH_START_HOUR; // 1.0h (12:00 - 13:00)
  const afternoonSpan = WORK_END_HOUR - LUNCH_END_HOUR; // 4.5h (13:00 - 17:30)
  const overtimeSpan = END_HOUR - WORK_END_HOUR; // 4.5h (17:30 - 22:00)
  const dayWidth = getDayWidth(hourWidth, collapseLunch, collapseOvertime);

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
    <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs select-none">
      {/* Row 1: Day Titles, Dates, and Day Summary Bar */}
      <div className="flex border-b border-slate-200 text-xs">
        {/* Left corner sticky sidebar title */}
        <div
          style={{ width: sidebarWidth }}
          className="flex-shrink-0 px-4 py-2 bg-slate-50 border-r border-slate-200 text-slate-700 flex items-center justify-between shadow-xs"
        >
          <div>
            <span className="font-bold text-slate-900 text-xs sm:text-sm">專案維度</span>
            <div className="text-[10px] text-slate-500 font-mono">X軸: 多日連續延伸</div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-medium">
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
                className="flex-shrink-0 px-3 py-1.5 bg-slate-50/70 border-r-2 border-indigo-400/60 flex items-center justify-between gap-2 transition-colors relative group/dayhdr"
              >
                {/* Left: Day Label and Date */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    D{idx + 1}
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="px-1.5 py-0.5 w-16 bg-white border border-indigo-500 rounded text-xs text-slate-800"
                        placeholder="名稱"
                      />
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="px-1.5 py-0.5 bg-white border border-indigo-500 rounded text-xs text-slate-800 font-mono"
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
                      <span className="font-bold text-slate-900 text-sm truncate">
                        {day.label}
                      </span>
                      {day.dateString && (
                        <span className="text-[11px] text-sky-700 font-mono flex items-center gap-0.5 flex-shrink-0">
                          <Calendar className="w-3 h-3 text-sky-600" />
                          {formatDateLabel(day.dateString)}
                        </span>
                      )}
                      <button
                        onClick={() => handleStartEdit(day)}
                        className="opacity-0 group-hover/dayhdr:opacity-100 p-1 text-slate-400 hover:text-slate-700 transition"
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
                    <span className="bg-white text-slate-700 px-1.5 py-0.2 rounded border border-slate-200 font-mono shadow-xs">
                      {day.tasks.length} 項
                    </span>
                    {dayNormal > 0 && (
                      <span className="text-sky-700 font-mono bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                        常 {dayNormal}h
                      </span>
                    )}
                    {dayOvertime > 0 && (
                      <span className="text-amber-700 font-mono font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-0.5">
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
                      className="opacity-0 group-hover/dayhdr:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
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
          <div className="flex items-center px-4 bg-slate-50/60 border-r border-slate-200">
            <button
              onClick={onAddDay}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition flex items-center gap-1.5 whitespace-nowrap active:scale-95 shadow-xs"
              title="在時間軸 X 軸向右延伸下一天"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>增加日期 (Day {days.length + 1})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Normal vs Overtime Phase Range Bar */}
      <div className="flex border-b border-slate-200 text-[11px] font-medium tracking-wide">
        {/* Left corner spacer */}
        <div
          style={{ width: sidebarWidth }}
          className="flex-shrink-0 px-4 py-1 border-r border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-between"
        >
          <span className="font-semibold text-slate-700">時段分配</span>
          <span className="text-[10px] text-slate-500 font-mono">步進: 30分 (0.5h)</span>
        </div>

        {/* Phase strips for each day */}
        <div className="flex">
          {days.map((day) => (
            <div key={day.id} className="flex flex-shrink-0 border-r-2 border-indigo-400/60">
              {/* Morning normal hours (08:30 - 12:00) */}
              <div
                style={{ width: morningSpan * hourWidth }}
                className="flex-shrink-0 bg-sky-50/90 text-sky-800 border-r border-sky-200/80 px-2 py-1 flex items-center gap-1.5 justify-center"
                title="上午正常工時 08:30 ~ 12:00 (3.5小時)"
              >
                <Sun className="w-3 h-3 text-sky-600 flex-shrink-0" />
                <span className="font-semibold whitespace-nowrap">正常 (08:30-12:00)</span>
                <span className="text-[10px] px-1 bg-sky-100 rounded text-sky-800 border border-sky-200 font-mono">3.5h</span>
              </div>

              {/* Lunch break (12:00 - 13:00) - Rest time, not calculated */}
              {collapseLunch ? (
                <div
                  style={{ width: COLLAPSED_LUNCH_WIDTH }}
                  onClick={onToggleCollapseLunch}
                  className="flex-shrink-0 bg-amber-100/70 hover:bg-amber-100 text-amber-800 border-r border-amber-200 flex flex-col items-center justify-center cursor-pointer transition py-0.5 group/foldLunch"
                  title="午休時段已收折 (12:00~13:00)，點擊展開"
                >
                  <Coffee className="w-3.5 h-3.5 text-amber-600 group-hover/foldLunch:scale-110 transition-transform" />
                  <span className="text-[8px] font-mono text-amber-800 leading-tight">展開</span>
                </div>
              ) : (
                <div
                  style={{ width: lunchSpan * hourWidth }}
                  className="flex-shrink-0 bg-amber-50/90 text-amber-800 border-r border-amber-200/80 px-1 py-1 flex items-center justify-between group/lunch"
                  title="中午休息時間 12:00 ~ 13:00 (不計入工時)"
                >
                  <div className="flex items-center gap-1 mx-auto">
                    <Coffee className="w-3 h-3 text-amber-600 flex-shrink-0" />
                    <span className="font-semibold whitespace-nowrap text-[10px]">午休不計</span>
                    <span className="text-[9px] px-1 bg-amber-100/90 rounded text-amber-900 border border-amber-200 font-mono">1h</span>
                  </div>
                  {onToggleCollapseLunch && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCollapseLunch();
                      }}
                      className="opacity-70 group-hover/lunch:opacity-100 px-1 py-0.2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[9px] transition"
                      title="收折午休時段"
                    >
                      收折
                    </button>
                  )}
                </div>
              )}

              {/* Afternoon normal hours (13:00 - 17:30) */}
              <div
                style={{ width: afternoonSpan * hourWidth }}
                className="flex-shrink-0 bg-sky-50/90 text-sky-800 border-r-2 border-amber-400/80 px-2 py-1 flex items-center gap-1.5 justify-center"
                title="下午正常工時 13:00 ~ 17:30 (4.5小時)"
              >
                <Sun className="w-3 h-3 text-sky-600 flex-shrink-0" />
                <span className="font-semibold whitespace-nowrap">正常 (13:00-17:30)</span>
                <span className="text-[10px] px-1 bg-sky-100 rounded text-sky-800 border border-sky-200 font-mono">4.5h</span>
              </div>

              {/* Overtime hours indicator strip (17:30 - 22:00) */}
              {collapseOvertime ? null : (
                <div
                  style={{ width: overtimeSpan * hourWidth }}
                  className="flex-shrink-0 bg-amber-50/90 text-amber-800 px-2 py-1 flex items-center justify-between group/ot border-r border-amber-200/80"
                  title="加班時段 17:30 ~ 22:00 (4.5小時)"
                >
                  <div className="flex items-center gap-1.5 mx-auto">
                    <Moon className="w-3 h-3 text-amber-600 flex-shrink-0" />
                    <span className="font-semibold whitespace-nowrap">加班 (17:30-22:00)</span>
                    <span className="text-[10px] px-1 bg-amber-100 rounded text-amber-900 border border-amber-200 font-mono">4.5h</span>
                  </div>
                  {onToggleCollapseOvertime && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCollapseOvertime();
                      }}
                      className="opacity-70 group-hover/ot:opacity-100 px-1.5 py-0.2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[9px] transition"
                      title="收折加班時段"
                    >
                      收折
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Hourly Ticks Strip with 30m ticks */}
      <div className="flex bg-white text-xs border-b border-slate-200">
        {/* Left header column */}
        <div
          style={{ width: sidebarWidth }}
          className="flex-shrink-0 px-4 py-2 border-r border-slate-200 bg-slate-50 flex items-center text-slate-700 font-semibold"
        >
          <span>專案維度</span>
        </div>

        {/* Hourly cells across all days */}
        <div className="flex relative">
          {days.map((day, dIdx) => (
            <div
              key={day.id}
              className="flex relative border-r-2 border-indigo-400/60"
            >
              {/* Morning Hours: 08:30 (0.5h), 09:00 (1h), 10:00 (1h), 11:00 (1h) */}
              {MORNING_SLOTS.map((slot) => {
                if (slot.hour === 8.5) {
                  return (
                    <div
                      key={slot.hour}
                      style={{ width: slot.span * hourWidth }}
                      className="flex-shrink-0 text-left py-1.5 border-r border-sky-200 flex flex-col justify-center items-start pl-1.5 relative transition-colors bg-sky-50/40 text-sky-800 font-medium group/m85"
                      title="08:30 ~ 09:00 上班首半小時 (正常工時 0.5h)"
                    >
                      <div className="flex items-center gap-0.5 leading-none">
                        <span className="text-[11px] font-mono font-bold text-sky-700">08:30</span>
                      </div>
                      <div className="text-[10px] font-mono origin-left scale-90 text-sky-600 font-medium">
                        +0.5h
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={slot.hour}
                    style={{ width: slot.span * hourWidth }}
                    className="flex-shrink-0 text-left py-1.5 border-r border-slate-200/80 flex flex-col justify-center items-start pl-1.5 relative transition-colors bg-white text-slate-700 font-medium"
                  >
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xs font-mono font-semibold">{slot.label}</span>
                    </div>
                    <div className="text-[10px] font-mono origin-left scale-90 text-slate-400">
                      {slot.sub}
                    </div>
                    {slot.hasMidTick && (
                      <div
                        className="absolute left-1/2 bottom-0 pointer-events-none bg-slate-300 w-[1px] h-2"
                        title={`${slot.label.split(':')[0]}:30 (30分鐘)`}
                      />
                    )}
                  </div>
                );
              })}

              {/* Lunch Hour (12:00 - 13:00) */}
              {collapseLunch ? (
                <div
                  style={{ width: COLLAPSED_LUNCH_WIDTH }}
                  onClick={onToggleCollapseLunch}
                  className="flex-shrink-0 border-r border-amber-200 bg-amber-50 hover:bg-amber-100 flex flex-col items-center justify-center cursor-pointer text-amber-800 py-1 transition"
                  title="12:00~13:00 午休 (點擊展開)"
                >
                  <Coffee className="w-3 h-3 text-amber-600" />
                  <span className="text-[8px] font-mono mt-0.5 text-amber-700">12</span>
                </div>
              ) : (
                <div
                  style={{ width: hourWidth }}
                  className="flex-shrink-0 text-left py-1.5 border-r border-amber-200/80 flex flex-col justify-center items-start pl-1.5 relative transition-colors bg-amber-50/50 text-amber-800 font-medium"
                >
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xs font-mono font-semibold">{formatHour(12)}</span>
                  </div>
                  <div className="text-[10px] font-mono origin-left scale-90 text-amber-700 font-semibold">
                    午休不計
                  </div>
                  <div className="absolute left-1/2 bottom-0 pointer-events-none bg-amber-300/80 w-[1px] h-2" />
                </div>
              )}

              {/* Afternoon Hours (13:00 - 17:30) */}
              {AFTERNOON_SLOTS.map((slot) => {
                if (slot.hour === 17) {
                  return (
                    <div
                      key={slot.hour}
                      style={{ width: slot.span * hourWidth }}
                      className="flex-shrink-0 text-left py-1.5 border-r-2 border-amber-400/80 flex flex-col justify-center items-start pl-1.5 relative transition-colors bg-white text-slate-700 font-medium"
                      title="17:00 ~ 17:30 正常工時 (0.5小時)"
                    >
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-xs font-mono font-semibold">17:00</span>
                      </div>
                      <div className="text-[10px] font-mono origin-left scale-90 text-slate-400">
                        +0.5h
                      </div>
                      {collapseOvertime && (
                        <div className="absolute right-0 top-0 bottom-0 flex items-center translate-x-1/2 pointer-events-none z-10">
                          <span className="text-[9px] text-amber-800 bg-amber-100 px-1 py-0.5 rounded border border-amber-300 font-mono shadow-xs">
                            17:30
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={slot.hour}
                    style={{ width: slot.span * hourWidth }}
                    className="flex-shrink-0 text-left py-1.5 border-r border-slate-200/80 flex flex-col justify-center items-start pl-1.5 relative transition-colors bg-white text-slate-700 font-medium"
                  >
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xs font-mono font-semibold">{slot.label}</span>
                    </div>
                    <div
                      className={`text-[10px] font-mono origin-left scale-90 ${
                        slot.hour === 13 ? 'text-sky-700 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {slot.sub}
                    </div>
                    {slot.hasMidTick && (
                      <div
                        className="absolute left-1/2 bottom-0 pointer-events-none bg-slate-300 w-[1px] h-2"
                        title="30分鐘"
                      />
                    )}
                  </div>
                );
              })}

              {/* Overtime Hours (17:30 - 22:00) or Collapsed Strip */}
              {collapseOvertime ? null : (
                <>
                  {OVERTIME_SLOTS.map((slot) => {
                    if (slot.hour === 17.5) {
                      return (
                        <div
                          key={slot.hour}
                          style={{ width: slot.span * hourWidth }}
                          className="flex-shrink-0 text-left py-1.5 border-r border-amber-300/80 flex flex-col justify-center items-start pl-1.5 relative transition-colors bg-amber-50/70 text-amber-800 font-semibold"
                          title="17:30 ~ 18:00 加班首半小時 (0.5小時)"
                        >
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-xs font-mono text-amber-900 font-bold">17:30</span>
                          </div>
                          <div className="text-[10px] font-mono origin-left scale-90 text-amber-700/80 font-semibold">
                            +0.5h
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={slot.hour}
                        style={{ width: slot.span * hourWidth }}
                        className="flex-shrink-0 text-left py-1.5 border-r border-amber-200/70 flex flex-col justify-center items-start pl-1.5 relative transition-colors bg-amber-50/40 text-amber-800 font-semibold"
                      >
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xs font-mono font-bold text-amber-900">{slot.label}</span>
                        </div>
                        <div className="text-[10px] font-mono origin-left scale-90 text-amber-700 font-semibold">
                          加班
                        </div>
                        {slot.hasMidTick && (
                          <div className="absolute left-1/2 bottom-0 pointer-events-none bg-amber-300/80 w-[1px] h-2" />
                        )}
                      </div>
                    );
                  })}

                  {/* Day boundary end-hour mark (22:00) */}
                  <div className="absolute right-0 top-0 bottom-0 flex items-center translate-x-1/2 pointer-events-none z-10">
                    <span className="text-[9px] text-amber-800 bg-amber-100 px-1 py-0.5 rounded border border-amber-300 font-mono shadow-xs">
                      22:00
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
