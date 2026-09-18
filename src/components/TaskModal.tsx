import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Check, Trash2, Moon, Sun, Tag, FileText, FolderKanban } from 'lucide-react';
import { Task, DaySchedule, Project, TaskColorKey } from '../types';
import { START_HOUR, OVERTIME_HOUR, END_HOUR, COLOR_OPTIONS } from '../constants';
import { formatHour, calculateTaskHours, clampTaskBounds } from '../utils/time';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: DaySchedule[];
  projects: Project[];
  initialDayId?: string;
  initialProjectId?: string;
  initialTask?: Task | null;
  onSave: (dayId: string, taskData: Omit<Task, 'trackIndex'>, isNew: boolean) => void;
  onDelete?: (dayId: string, taskId: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  days,
  projects,
  initialDayId,
  initialProjectId,
  initialTask,
  onSave,
  onDelete,
}) => {
  const isEditing = !!initialTask;

  const [selectedDayId, setSelectedDayId] = useState<string>(
    initialDayId || (days[0]?.id ?? '')
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialTask?.projectId || initialProjectId || (projects[0]?.id ?? '')
  );
  const [name, setName] = useState('');
  const [startHour, setStartHour] = useState<number>(9);
  const [duration, setDuration] = useState<number>(2);
  const [color, setColor] = useState<TaskColorKey>('blue');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setName(initialTask.name);
        setStartHour(initialTask.startHour);
        setDuration(initialTask.duration);
        setColor(initialTask.color || 'blue');
        setNotes(initialTask.notes || '');
        setSelectedDayId(initialDayId || days[0]?.id || '');
        setSelectedProjectId(initialTask.projectId || initialProjectId || projects[0]?.id || '');
      } else {
        setName('');
        setStartHour(initialTask ? 9 : 9);
        setDuration(2);
        const targetProjId = initialProjectId || projects[0]?.id || '';
        setSelectedProjectId(targetProjId);
        const matchedProj = projects.find((p) => p.id === targetProjId);
        setColor(matchedProj ? matchedProj.color : 'blue');
        setNotes('');
        setSelectedDayId(initialDayId || days[0]?.id || '');
      }
      setErrorMsg('');
    }
  }, [isOpen, initialTask, initialDayId, initialProjectId, days, projects]);

  if (!isOpen) return null;

  const endHour = startHour + duration;
  const { normalHours, overtimeHours, lunchBreakHours, effectiveHours } = calculateTaskHours(startHour, duration);

  const getHourTag = (h: number) => {
    if (h === 8.5) return ' (上班起)';
    if (h === 12) return ' (午休起)';
    if (h === 13) return ' (午休迄)';
    if (h === 17.5) return ' (加班起)';
    if (h > 17.5) return ' (加班)';
    return '';
  };

  const handleStartHourChange = (newStart: number) => {
    setStartHour(newStart);
    if (newStart + duration > END_HOUR) {
      setDuration(Math.max(0.5, Math.round((END_HOUR - newStart) * 10) / 10));
    }
  };

  const handleEndHourChange = (newEnd: number) => {
    if (newEnd > startHour) {
      setDuration(Math.round((newEnd - startHour) * 10) / 10);
    }
  };

  const handleProjectSelect = (projId: string) => {
    setSelectedProjectId(projId);
    // If not editing, also update default color to the project's color
    if (!isEditing) {
      const proj = projects.find((p) => p.id === projId);
      if (proj) setColor(proj.color);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('請輸入項目名稱');
      return;
    }
    if (!selectedProjectId) {
      setErrorMsg('請選擇所屬專案');
      return;
    }

    const clamped = clampTaskBounds(startHour, duration);
    const taskId = initialTask?.id || `task-${Date.now()}`;

    onSave(
      selectedDayId,
      {
        id: taskId,
        projectId: selectedProjectId,
        name: name.trim(),
        startHour: clamped.startHour,
        duration: clamped.duration,
        color,
        notes: notes.trim(),
      },
      !isEditing
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isEditing ? '編輯項目方塊' : '新增排程項目'}
              </h3>
              <p className="text-xs text-slate-400">
                可指定專案維度、時段區間與備註資訊
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Task Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              項目名稱 <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="例如：首頁視覺排版、API 串接、夜間發布..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Project and Day Selectors (Two columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Target Project */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                所屬專案維度 <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectSelect(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Day */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                排程日期
              </label>
              <select
                value={selectedDayId}
                onChange={(e) => setSelectedDayId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                {days.map((day) => (
                  <option key={day.id} value={day.id}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Slot Controls: Start and End */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-sky-400" />
                開始時間
              </label>
              <select
                value={startHour}
                onChange={(e) => handleStartHourChange(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
              >
                {Array.from({ length: Math.round((END_HOUR - START_HOUR) * 2) }).map((_, i) => {
                  const h = START_HOUR + i * 0.5;
                  return (
                    <option key={h} value={h}>
                      {formatHour(h)}{getHourTag(h)}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                結束時間
              </label>
              <select
                value={endHour}
                onChange={(e) => handleEndHourChange(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
              >
                {Array.from({ length: Math.round((END_HOUR - startHour) * 2) }).map((_, i) => {
                  const h = startHour + (i + 1) * 0.5;
                  const dur = Math.round((h - startHour) * 10) / 10;
                  return (
                    <option key={h} value={h}>
                      {formatHour(h)} ({dur}h){getHourTag(h)}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Time Summary Breakdown Card */}
          <div className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">總持續:</span>
              <span className="font-bold text-white font-mono text-sm">
                {duration}h
              </span>
              <span className="text-slate-400 ml-1">計工時:</span>
              <span className="font-bold text-sky-400 font-mono text-sm">
                {effectiveHours}h
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800 text-sky-300">
                正常: {normalHours}h
              </span>
              {lunchBreakHours > 0 && (
                <span
                  className="px-2 py-0.5 rounded bg-slate-900 border border-amber-500/40 text-amber-300 font-medium flex items-center gap-1"
                  title="中午 12:00~13:00 為休息時間，不計入工時"
                >
                  ☕ 扣午休: {lunchBreakHours}h
                </span>
              )}
              {overtimeHours > 0 ? (
                <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300 font-bold flex items-center gap-1">
                  <Moon className="w-3 h-3" /> 加班: {overtimeHours}h
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500">
                  無加班
                </span>
              )}
            </div>
          </div>

          {/* Working hours rule hint */}
          <div className="text-[11px] text-slate-400 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <span className="text-sky-400 font-bold font-mono">工時說明:</span>
            <span>正常 08:30~17:30，午休 12:00~13:00 不計算工時，17:30 後為加班。</span>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              項目色彩標籤
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(COLOR_OPTIONS) as TaskColorKey[]).map((key) => {
                const opt = COLOR_OPTIONS[key];
                const isSelected = color === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setColor(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                      opt.bg
                    } ${
                      isSelected
                        ? 'ring-2 ring-white border-white'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes / Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              備註說明 (選填)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="相關補充資訊、負責人員或交付成果..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none text-xs"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`確定要刪除「${initialTask.name}」嗎？`)) {
                    onDelete(initialDayId || selectedDayId, initialTask.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/50 border border-rose-900/60 transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>刪除項目</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 border border-slate-700 transition"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isEditing ? '儲存更新' : '建立項目'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
