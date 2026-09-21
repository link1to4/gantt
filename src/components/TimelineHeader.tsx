import React from 'react';
import { Sun, Moon, Coffee, ChevronRight, ChevronsRight, Minimize2, Maximize2 } from 'lucide-react';
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
  MORNING_SLOTS
} from '../constants';
import { formatHour } from '../utils/time';

interface TimelineHeaderProps {
  hourWidth: number;
  sidebarWidth: number;
  collapseLunch?: boolean;
  onToggleCollapseLunch?: () => void;
  collapseOvertime?: boolean;
  onToggleCollapseOvertime?: () => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  hourWidth,
  sidebarWidth,
  collapseLunch = false,
  onToggleCollapseLunch,
  collapseOvertime = false,
  onToggleCollapseOvertime,
}) => {
  const morningSpan = LUNCH_START_HOUR - START_HOUR; // 3.5h (08:30 - 12:00)
  const lunchSpan = LUNCH_END_HOUR - LUNCH_START_HOUR; // 1.0h (12:00 - 13:00)
  const afternoonSpan = WORK_END_HOUR - LUNCH_END_HOUR; // 4.5h (13:00 - 17:30)
  const overtimeSpan = END_HOUR - WORK_END_HOUR; // 4.5h (17:30 - 22:00)

  return (
    <div className="sticky top-0 z-30 bg-slate-900 border-b border-slate-700 shadow-sm select-none">
      {/* Upper Phase Range Bar: Normal vs Lunch Break vs Overtime */}
      <div className="flex border-b border-slate-800 text-[11px] font-medium tracking-wide">
        {/* Left corner spacer */}
        <div
          style={{ width: sidebarWidth }}
          className="flex-shrink-0 px-4 py-1.5 border-r border-slate-800 bg-slate-950 text-slate-400 flex items-center justify-between"
        >
          <span className="font-semibold text-slate-300">時段分配</span>
          <span className="text-[10px] text-slate-400 font-mono">步進: 30分 (0.5h)</span>
        </div>

        {/* Morning normal hours indicator strip (08:30 - 12:00) */}
        <div
          style={{ width: morningSpan * hourWidth }}
          className="flex-shrink-0 bg-sky-950/40 text-sky-300 border-r border-slate-700/80 px-2 py-1.5 flex items-center gap-1.5 justify-center"
          title="上午正常工時 08:30 ~ 12:00 (3.5小時)"
        >
          <Sun className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold">正常 (08:30-12:00)</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-sky-900/60 rounded text-sky-200 font-mono">3.5h</span>
        </div>

        {/* Lunch break indicator strip (12:00 - 13:00) */}
        {collapseLunch ? (
          <div
            style={{ width: COLLAPSED_LUNCH_WIDTH }}
            onClick={onToggleCollapseLunch}
            className="flex-shrink-0 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border-r border-slate-700/80 flex flex-col items-center justify-center cursor-pointer transition py-0.5 group/foldLunch"
            title="午休時段已收折 (12:00~13:00)，點擊展開"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-400 group-hover/foldLunch:scale-110 transition-transform" />
            <span className="text-[8px] font-mono text-amber-300/90 leading-tight">展開</span>
          </div>
        ) : (
          <div
            style={{ width: lunchSpan * hourWidth }}
            className="flex-shrink-0 bg-slate-800/90 text-amber-300 border-r border-slate-700/80 px-2 py-1.5 flex items-center justify-between group/lunch"
            title="中午休息時間 12:00 ~ 13:00 (不計入工時)"
          >
            <div className="flex items-center gap-1 mx-auto">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-[10px]">午休不計</span>
              <span className="text-[9px] px-1 bg-slate-900/80 rounded text-slate-300 font-mono">1h</span>
            </div>
            {onToggleCollapseLunch && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapseLunch();
                }}
                className="opacity-70 group-hover/lunch:opacity-100 px-1 py-0.5 bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[9px] transition"
                title="收折午休時段"
              >
                收折
              </button>
            )}
          </div>
        )}

        {/* Afternoon normal hours indicator strip (13:00 - 17:30) */}
        <div
          style={{ width: afternoonSpan * hourWidth }}
          className="flex-shrink-0 bg-sky-950/40 text-sky-300 border-r-2 border-amber-500/80 px-2 py-1.5 flex items-center gap-1.5 justify-center"
          title="下午正常工時 13:00 ~ 17:30 (4.5小時)"
        >
          <Sun className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold">正常 (13:00-17:30)</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-sky-900/60 rounded text-sky-200 font-mono">4.5h</span>
        </div>

        {/* Overtime hours indicator strip (17:30 - 22:00) */}
        {collapseOvertime ? null : (
          <div
            style={{ width: overtimeSpan * hourWidth }}
            className="flex-shrink-0 bg-amber-950/40 text-amber-300 px-2 py-1.5 flex items-center justify-between group/ot"
            title="加班時段 17:30 ~ 22:00 (4.5小時)"
          >
            <div className="flex items-center gap-1.5 mx-auto">
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">加班 (17:30-22:00)</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-900/60 rounded text-amber-200 font-mono">4.5h</span>
            </div>
            {onToggleCollapseOvertime && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapseOvertime();
                }}
                className="opacity-70 group-hover/ot:opacity-100 px-1.5 py-0.5 bg-amber-900/60 hover:bg-amber-800 text-amber-200 hover:text-white rounded text-[9px] transition"
                title="收折加班時段"
              >
                收折
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hourly Ticks Strip */}
      <div className="flex bg-slate-900 text-xs">
        {/* Left header column */}
        <div
          style={{ width: sidebarWidth }}
          className="flex-shrink-0 px-4 py-2.5 border-r border-slate-800 bg-slate-900 flex items-center text-slate-300 font-semibold"
        >
          <span>專案維度 / 排程項目</span>
        </div>

        {/* Hourly cells */}
        <div className="flex relative">
          {/* Morning Hours: 08:30 (0.5h), 09:00 (1h), 10:00 (1h), 11:00 (1h) */}
          {MORNING_SLOTS.map((slot) => {
            if (slot.hour === 8.5) {
              return (
                <div
                  key={slot.hour}
                  style={{ width: slot.span * hourWidth }}
                  className="flex-shrink-0 text-center py-1 border-r border-sky-500/60 flex flex-col justify-center items-center relative transition-colors bg-sky-950/20 text-sky-300 font-medium group/m85"
                  title="08:30 ~ 09:00 上班首半小時 (正常工時 0.5h)"
                >
                  <div className="flex items-center gap-0.5 leading-none">
                    <span className="text-[11px] font-mono font-bold text-sky-400">08:30</span>
                  </div>
                  <div className="text-[9px] font-mono text-sky-300/80 leading-tight">
                    ~09:00
                  </div>
                  <div className="text-[8px] font-mono text-sky-400 font-semibold bg-sky-900/60 px-1 py-0.2 rounded border border-sky-500/30 -mt-0.5 scale-90">
                    0.5h
                  </div>
                </div>
              );
            }

            return (
              <div
                key={slot.hour}
                style={{ width: slot.span * hourWidth }}
                className="flex-shrink-0 text-center py-2 border-r border-slate-800/80 flex flex-col justify-center items-center relative transition-colors bg-slate-900 text-slate-300 font-medium"
              >
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xs font-mono">{slot.label}</span>
                </div>
                <div className="text-[10px] font-mono scale-90 text-slate-500">
                  {slot.sub}
                </div>
                {slot.hasMidTick && (
                  <div
                    className="absolute left-1/2 bottom-0 pointer-events-none bg-slate-700/80 w-[1px] h-2"
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
              className="flex-shrink-0 border-r border-slate-700/80 bg-slate-800/80 hover:bg-slate-800 flex flex-col items-center justify-center cursor-pointer text-amber-300 py-1 transition"
              title="12:00~13:00 午休 (點擊展開)"
            >
              <Coffee className="w-3 h-3 text-amber-400" />
              <span className="text-[8px] font-mono mt-0.5 opacity-80">12</span>
            </div>
          ) : (
            <div
              style={{ width: hourWidth }}
              className="flex-shrink-0 text-center py-2 border-r border-slate-800/80 flex flex-col justify-center items-center relative transition-colors bg-slate-800/50 text-amber-300 font-medium"
            >
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs font-mono">{formatHour(12)}</span>
              </div>
              <div className="text-[10px] font-mono scale-90 text-amber-300 font-semibold">
                午休不計
              </div>
              <div className="absolute left-1/2 bottom-0 pointer-events-none bg-slate-700/80 w-[1px] h-2" />
            </div>
          )}

          {/* Afternoon Hours 13, 14, 15, 16, 17 */}
          {[13, 14, 15, 16, 17].map((hour) => {
            if (hour === 17) {
              return (
                <div
                  key={hour}
                  style={{ width: collapseOvertime ? hourWidth * 0.5 : hourWidth }}
                  className={`flex-shrink-0 text-center py-2 border-r border-slate-800/80 flex relative transition-colors ${
                    collapseOvertime ? 'bg-slate-900 justify-center items-center' : ''
                  }`}
                >
                  {/* Left half: 17:00 ~ 17:30 (Normal work hours) */}
                  <div className={`flex-1 flex flex-col justify-center items-center bg-slate-900 text-slate-300 font-medium ${collapseOvertime ? '' : 'pr-1'}`}>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xs font-mono">17:00</span>
                    </div>
                    <div className="text-[10px] font-mono scale-90 text-sky-400 font-semibold">
                      正常
                    </div>
                  </div>

                  {/* 17:30 dividing line and label */}
                  {collapseOvertime ? (
                    <div className="absolute right-0 top-0 bottom-0 flex items-center translate-x-1/2 pointer-events-none z-10">
                      <span className="text-[9px] text-amber-400 bg-slate-950 px-1 py-0.5 rounded border border-amber-500/40 font-mono">
                        17:30
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Full height vertical amber divider in the middle (50%) */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-amber-500/80 z-20 pointer-events-none" />

                      {/* 17:30 Badge centered between 17:00 and 18:00 */}
                      <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-20 flex flex-col items-center justify-between py-0.5 pointer-events-none">
                        <span className="px-1 py-0.2 bg-amber-950 text-amber-300 border border-amber-500/70 rounded text-[9px] font-mono font-bold shadow-sm whitespace-nowrap">
                          17:30
                        </span>
                        <span className="text-[8px] text-amber-400 font-semibold tracking-tighter whitespace-nowrap">
                          加班起
                        </span>
                      </div>

                      {/* Right half: 17:30 ~ 18:00 (Overtime) */}
                      <div className="flex-1 flex flex-col justify-center items-center bg-amber-950/20 text-amber-400 font-semibold pl-1">
                        <div className="text-[10px] font-mono scale-90 text-amber-400 font-semibold">
                          加班
                        </div>
                        <div className="text-[9px] font-mono text-amber-400/80">
                          +0.5h
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            }

            return (
              <div
                key={hour}
                style={{ width: hourWidth }}
                className="flex-shrink-0 text-center py-2 border-r border-slate-800/80 flex flex-col justify-center items-center relative transition-colors bg-slate-900 text-slate-300 font-medium"
              >
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xs font-mono">{formatHour(hour)}</span>
                </div>
                <div
                  className={`text-[10px] font-mono scale-90 ${
                    hour === 13 ? 'text-sky-400 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {hour === 13 ? '下午工時' : '+1h'}
                </div>
                <div
                  className="absolute left-1/2 bottom-0 pointer-events-none bg-slate-700/80 w-[1px] h-2"
                  title="30分鐘"
                />
              </div>
            );
          })}

          {/* Overtime Hours or Collapsed Strip */}
          {collapseOvertime ? null : (
            <>
              {[18, 19, 20, 21].map((hour) => (
                <div
                  key={hour}
                  style={{ width: hourWidth }}
                  className="flex-shrink-0 text-center py-2 border-r border-slate-800/80 flex flex-col justify-center items-center relative transition-colors bg-amber-950/20 text-amber-400 font-semibold"
                >
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xs font-mono">{formatHour(hour)}</span>
                  </div>
                  <div className="text-[10px] font-mono scale-90 text-amber-400 font-semibold">
                    加班
                  </div>
                  <div className="absolute left-1/2 bottom-0 pointer-events-none bg-slate-700/80 w-[1px] h-2" />
                </div>
              ))}

              {/* Final end-hour mark (22:00) */}
              <div className="absolute right-0 top-0 bottom-0 flex items-center translate-x-1/2 pointer-events-none z-10">
                <span className="text-[10px] text-amber-500 bg-slate-900 px-1 py-0.5 rounded border border-amber-500/40 font-mono">
                  22:00
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

