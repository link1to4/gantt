import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { START_HOUR, OVERTIME_HOUR, END_HOUR, TOTAL_HOURS } from '../constants';
import { formatHour } from '../utils/time';

interface TimelineHeaderProps {
  hourWidth: number;
  sidebarWidth: number;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  hourWidth,
  sidebarWidth,
}) => {
  const normalSpan = OVERTIME_HOUR - START_HOUR; // 10 hours
  const overtimeSpan = END_HOUR - OVERTIME_HOUR; // 4 hours

  return (
    <div className="sticky top-0 z-30 bg-slate-900 border-b border-slate-700 shadow-sm select-none">
      {/* Upper Phase Range Bar: Normal vs Overtime */}
      <div className="flex border-b border-slate-800 text-[11px] font-medium tracking-wide">
        {/* Left corner spacer */}
        <div
          style={{ width: sidebarWidth }}
          className="flex-shrink-0 px-4 py-1.5 border-r border-slate-800 bg-slate-950 text-slate-400 flex items-center justify-between"
        >
          <span className="font-semibold text-slate-300">時段分配</span>
          <span className="text-[10px] text-slate-400 font-mono">步進: 30分 (0.5h)</span>
        </div>

        {/* Normal hours indicator strip */}
        <div
          style={{ width: normalSpan * hourWidth }}
          className="flex-shrink-0 bg-sky-950/40 text-sky-300 border-r-2 border-amber-500/80 px-3 py-1.5 flex items-center gap-2 justify-center"
        >
          <Sun className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold">正常工作時段 (08:00 - 18:00)</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-sky-900/60 rounded text-sky-200">10 小時</span>
        </div>

        {/* Overtime hours indicator strip */}
        <div
          style={{ width: overtimeSpan * hourWidth }}
          className="flex-shrink-0 bg-amber-950/40 text-amber-300 px-3 py-1.5 flex items-center gap-2 justify-center"
        >
          <Moon className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold">加班時段 (18:00 - 22:00)</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-amber-900/60 rounded text-amber-200">4 小時</span>
        </div>
      </div>

      {/* Hourly Ticks Strip */}
      <div className="flex bg-slate-900 text-xs">
        {/* Left header column */}
        <div
          style={{ width: sidebarWidth }}
          className="flex-shrink-0 px-4 py-2.5 border-r border-slate-800 bg-slate-900 flex items-center justify-between text-slate-300 font-semibold"
        >
          <span>專案維度 / 排程項目</span>
          <span className="text-[10px] text-slate-500 font-normal">分列呈現</span>
        </div>

        {/* Hourly cells */}
        <div className="flex relative">
          {Array.from({ length: TOTAL_HOURS }).map((_, i) => {
            const hour = START_HOUR + i;
            const isOvertime = hour >= OVERTIME_HOUR;

            return (
              <div
                key={hour}
                style={{ width: hourWidth }}
                className={`flex-shrink-0 text-center py-2 border-r border-slate-800/80 flex flex-col justify-center items-center relative transition-colors ${
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
          
          {/* Final end-hour mark (22:00) */}
          <div className="absolute right-0 top-0 bottom-0 flex items-center translate-x-1/2 pointer-events-none">
            <span className="text-[10px] text-amber-500 bg-slate-900 px-1 py-0.5 rounded border border-amber-500/40 font-mono">
              22:00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
