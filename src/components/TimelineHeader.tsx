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
    <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs select-none">
      {/* Upper Phase Range Bar: Normal vs Lunch Break vs Overtime */}
      <div className="flex border-b border-slate-200 text-[11px] font-medium tracking-wide">
        {/* Left corner spacer */}
        <div
          style={{ width: sidebarWidth }}
          className="flex-shrink-0 px-4 py-1.5 border-r border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-between"
        >
          <span className="font-semibold text-slate-700">時段分配</span>
          <span className="text-[10px] text-slate-500 font-mono">步進: 30分 (0.5h)</span>
        </div>

        {/* Morning normal hours indicator strip (08:30 - 12:00) */}
        <div
          style={{ width: morningSpan * hourWidth }}
          className="flex-shrink-0 bg-sky-50/90 text-sky-800 border-r border-sky-200/80 px-2 py-1.5 flex items-center gap-1.5 justify-center"
          title="上午正常工時 08:30 ~ 12:00 (3.5小時)"
        >
          <Sun className="w-3.5 h-3.5 text-sky-600" />
          <span className="font-semibold">正常 (08:30-12:00)</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-sky-100 rounded text-sky-800 border border-sky-200 font-mono">3.5h</span>
        </div>

        {/* Lunch break indicator strip (12:00 - 13:00) */}
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
            className="flex-shrink-0 bg-amber-50/90 text-amber-800 border-r border-amber-200/80 px-2 py-1.5 flex items-center justify-between group/lunch"
            title="中午休息時間 12:00 ~ 13:00 (不計入工時)"
          >
            <div className="flex items-center gap-1 mx-auto">
              <Coffee className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold text-[10px]">午休不計</span>
              <span className="text-[9px] px-1 bg-amber-100/90 rounded text-amber-900 border border-amber-200 font-mono">1h</span>
            </div>
            {onToggleCollapseLunch && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapseLunch();
                }}
                className="opacity-70 group-hover/lunch:opacity-100 px-1 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[9px] transition"
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
          className="flex-shrink-0 bg-sky-50/90 text-sky-800 border-r-2 border-amber-400/80 px-2 py-1.5 flex items-center gap-1.5 justify-center"
          title="下午正常工時 13:00 ~ 17:30 (4.5小時)"
        >
          <Sun className="w-3.5 h-3.5 text-sky-600" />
          <span className="font-semibold">正常 (13:00-17:30)</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-sky-100 rounded text-sky-800 border border-sky-200 font-mono">4.5h</span>
        </div>

        {/* Overtime hours indicator strip (17:30 - 22:00) */}
        {collapseOvertime ? null : (
          <div
            style={{ width: overtimeSpan * hourWidth }}
            className="flex-shrink-0 bg-amber-50/90 text-amber-800 px-2 py-1.5 flex items-center justify-between group/ot border-r border-amber-200/80"
            title="加班時段 17:30 ~ 22:00 (4.5小時)"
          >
            <div className="flex items-center gap-1.5 mx-auto">
              <Moon className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold">加班 (17:30-22:00)</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 rounded text-amber-900 border border-amber-200 font-mono">4.5h</span>
            </div>
            {onToggleCollapseOvertime && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapseOvertime();
                }}
                className="opacity-70 group-hover/ot:opacity-100 px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[9px] transition"
                title="收折加班時段"
              >
                收折
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hourly Ticks Strip */}
      <div className="flex bg-white text-xs border-b border-slate-200">
        {/* Left header column */}
        <div
          style={{ width: sidebarWidth }}
          className="flex-shrink-0 px-4 py-2.5 border-r border-slate-200 bg-slate-50 flex items-center text-slate-700 font-semibold"
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
                  className="flex-shrink-0 text-center py-1 border-r border-sky-200 flex flex-col justify-center items-center relative transition-colors bg-sky-50/40 text-sky-800 font-medium group/m85"
                  title="08:30 ~ 09:00 上班首半小時 (正常工時 0.5h)"
                >
                  <div className="flex items-center gap-0.5 leading-none">
                    <span className="text-[11px] font-mono font-bold text-sky-700">08:30</span>
                  </div>
                  <div className="text-[9px] font-mono text-sky-600 leading-tight">
                    ~09:00
                  </div>
                  <div className="text-[8px] font-mono text-sky-800 font-semibold bg-sky-100 px-1 py-0.2 rounded border border-sky-200 -mt-0.5 scale-90">
                    0.5h
                  </div>
                </div>
              );
            }

            return (
              <div
                key={slot.hour}
                style={{ width: slot.span * hourWidth }}
                className="flex-shrink-0 text-center py-2 border-r border-slate-200/80 flex flex-col justify-center items-center relative transition-colors bg-white text-slate-700 font-medium"
              >
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xs font-mono">{slot.label}</span>
                </div>
                <div className="text-[10px] font-mono scale-90 text-slate-400">
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
              className="flex-shrink-0 text-center py-2 border-r border-amber-200/80 flex flex-col justify-center items-center relative transition-colors bg-amber-50/50 text-amber-800 font-medium"
            >
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs font-mono">{formatHour(12)}</span>
              </div>
              <div className="text-[10px] font-mono scale-90 text-amber-700 font-semibold">
                午休不計
              </div>
              <div className="absolute left-1/2 bottom-0 pointer-events-none bg-amber-300/80 w-[1px] h-2" />
            </div>
          )}

          {/* Afternoon Hours 13, 14, 15, 16, 17 */}
          {[13, 14, 15, 16, 17].map((hour) => {
            if (hour === 17) {
              return (
                <div
                  key={hour}
                  style={{ width: collapseOvertime ? hourWidth * 0.5 : hourWidth }}
                  className={`flex-shrink-0 text-center py-2 border-r border-slate-200/80 flex relative transition-colors ${
                    collapseOvertime ? 'bg-white justify-center items-center' : ''
                  }`}
                >
                  {/* Left half: 17:00 ~ 17:30 (Normal work hours) */}
                  <div className={`flex-1 flex flex-col justify-center items-center bg-white text-slate-700 font-medium ${collapseOvertime ? '' : 'pr-1'}`}>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xs font-mono">17:00</span>
                    </div>
                    <div className="text-[10px] font-mono scale-90 text-sky-700 font-semibold">
                      正常
                    </div>
                  </div>

                  {/* 17:30 dividing line and label */}
                  {collapseOvertime ? (
                    <div className="absolute right-0 top-0 bottom-0 flex items-center translate-x-1/2 pointer-events-none z-10">
                      <span className="text-[9px] text-amber-800 bg-amber-100 px-1 py-0.5 rounded border border-amber-300 font-mono shadow-xs">
                        17:30
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* Full height vertical amber divider in the middle (50%) */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-amber-500 z-20 pointer-events-none" />

                      {/* 17:30 Badge centered between 17:00 and 18:00 */}
                      <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-20 flex flex-col items-center justify-between py-0.5 pointer-events-none">
                        <span className="px-1 py-0.2 bg-amber-100 text-amber-900 border border-amber-400 rounded text-[9px] font-mono font-bold shadow-xs whitespace-nowrap">
                          17:30
                        </span>
                        <span className="text-[8px] text-amber-700 font-semibold tracking-tighter whitespace-nowrap">
                          加班起
                        </span>
                      </div>

                      {/* Right half: 17:30 ~ 18:00 (Overtime) */}
                      <div className="flex-1 flex flex-col justify-center items-center bg-amber-50/50 text-amber-800 font-semibold pl-1">
                        <div className="text-[10px] font-mono scale-90 text-amber-700 font-semibold">
                          加班
                        </div>
                        <div className="text-[9px] font-mono text-amber-600">
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
                className="flex-shrink-0 text-center py-2 border-r border-slate-200/80 flex flex-col justify-center items-center relative transition-colors bg-white text-slate-700 font-medium"
              >
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xs font-mono">{formatHour(hour)}</span>
                </div>
                <div
                  className={`text-[10px] font-mono scale-90 ${
                    hour === 13 ? 'text-sky-700 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {hour === 13 ? '下午工時' : '+1h'}
                </div>
                <div
                  className="absolute left-1/2 bottom-0 pointer-events-none bg-slate-300 w-[1px] h-2"
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
                  className="flex-shrink-0 text-center py-2 border-r border-amber-200/70 flex flex-col justify-center items-center relative transition-colors bg-amber-50/40 text-amber-800 font-semibold"
                >
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xs font-mono">{formatHour(hour)}</span>
                  </div>
                  <div className="text-[10px] font-mono scale-90 text-amber-700 font-semibold">
                    加班
                  </div>
                  <div className="absolute left-1/2 bottom-0 pointer-events-none bg-amber-300/80 w-[1px] h-2" />
                </div>
              ))}

              {/* Final end-hour mark (22:00) */}
              <div className="absolute right-0 top-0 bottom-0 flex items-center translate-x-1/2 pointer-events-none z-10">
                <span className="text-[10px] text-amber-800 bg-amber-100 px-1 py-0.5 rounded border border-amber-300 font-mono shadow-xs">
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

