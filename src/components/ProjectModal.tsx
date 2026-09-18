import React, { useState } from 'react';
import { X, FolderPlus, Trash2, Edit2, Check, Tag, Plus, FolderKanban, Copy, Download, Upload, DownloadCloud } from 'lucide-react';
import { Project, TaskColorKey, DaySchedule } from '../types';
import { COLOR_OPTIONS } from '../constants';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  days: DaySchedule[];
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onExportProject: (projectId: string) => void;
  onExportAllProjects: () => void;
  onOpenImportModal: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  projects,
  days,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onDuplicateProject,
  onExportProject,
  onExportAllProjects,
  onOpenImportModal,
}) => {
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<TaskColorKey>('blue');
  const [newDesc, setNewDesc] = useState('');

  // Edit buffer
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState<TaskColorKey>('blue');
  const [editDesc, setEditDesc] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (proj: Project) => {
    setEditingProjectId(proj.id);
    setEditName(proj.name);
    setEditColor(proj.color);
    setEditDesc(proj.description || '');
  };

  const handleSaveEdit = (projId: string) => {
    if (!editName.trim()) return;
    onUpdateProject(projId, {
      name: editName.trim(),
      color: editColor,
      description: editDesc.trim(),
    });
    setEditingProjectId(null);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setErrorMsg('請輸入專案名稱');
      return;
    }
    onAddProject({
      name: newName.trim(),
      color: newColor,
      description: newDesc.trim(),
    });
    setNewName('');
    setNewDesc('');
    setErrorMsg('');
  };

  // Count tasks per project
  const projectTaskCount: Record<string, number> = {};
  days.forEach((day) => {
    day.tasks.forEach((task) => {
      projectTaskCount[task.projectId] = (projectTaskCount[task.projectId] || 0) + 1;
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">專案維度管理</h3>
              <p className="text-xs text-slate-400">
                管理各專案分類，不同專案項目將在甘特圖中以獨立列分開呈現
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* New Project Form Card */}
          <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-3">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
              <span>新增專案維度</span>
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-900/50">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateNew} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    專案名稱 *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="例如：電商前台、後台系統..."
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    專案識別色彩
                  </label>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {(Object.keys(COLOR_OPTIONS) as TaskColorKey[]).map((cKey) => {
                      const opt = COLOR_OPTIONS[cKey];
                      return (
                        <button
                          key={cKey}
                          type="button"
                          onClick={() => setNewColor(cKey)}
                          className={`w-6 h-6 rounded-full border transition ${opt.bg} ${
                            newColor === cKey
                              ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                              : 'opacity-70 hover:opacity-100'
                          }`}
                          title={opt.label}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  專案說明 (選填)
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="簡短描述專案目標或負責範疇..."
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>建立專案</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Projects List */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-300">
                  現有專案列表 ({projects.length})
                </span>
                <span className="hidden sm:inline text-slate-500 font-normal text-[11px] ml-2">
                  每個專案於甘特圖以獨立列顯示
                </span>
              </div>

              {/* Quick Import / Export Backup Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenImportModal}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
                  title="匯入專案 JSON 檔案 (支援單一專案或全備份)"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>匯入專案</span>
                </button>

                <button
                  type="button"
                  onClick={onExportAllProjects}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
                  title="匯出所有專案及排程項目的完整 JSON 備份檔"
                >
                  <DownloadCloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>備份全部</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
              {projects.map((proj) => {
                const isEditing = editingProjectId === proj.id;
                const count = projectTaskCount[proj.id] || 0;
                const colorMeta = COLOR_OPTIONS[proj.color] || COLOR_OPTIONS.blue;

                if (isEditing) {
                  return (
                    <div key={proj.id} className="p-3 bg-slate-800/90 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-2.5 py-1 bg-slate-900 border border-indigo-500 rounded text-xs text-white"
                        />
                        <div className="flex gap-1">
                          {(Object.keys(COLOR_OPTIONS) as TaskColorKey[]).map((cKey) => (
                            <button
                              key={cKey}
                              type="button"
                              onClick={() => setEditColor(cKey)}
                              className={`w-5 h-5 rounded-full border transition ${COLOR_OPTIONS[cKey].bg} ${
                                editColor === cKey ? 'ring-2 ring-white scale-110' : 'opacity-60'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="說明..."
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingProjectId(null)}
                          className="px-2.5 py-1 rounded text-xs text-slate-400 hover:bg-slate-700"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(proj.id)}
                          className="px-3 py-1 rounded text-xs bg-indigo-600 text-white font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>儲存</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={proj.id}
                    className="p-3 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm ${colorMeta.bg}`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white truncate">
                            {proj.name}
                          </span>
                          <span className="text-[11px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            {count} 個項目
                          </span>
                        </div>
                        {proj.description && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {proj.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* One-click duplicate project with its items */}
                      <button
                        onClick={() => onDuplicateProject(proj.id)}
                        className="p-1.5 rounded hover:bg-indigo-950/60 text-slate-400 hover:text-indigo-300 transition"
                        title="一鍵複製此專案與所有排程項目"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Export single project */}
                      <button
                        onClick={() => onExportProject(proj.id)}
                        className="p-1.5 rounded hover:bg-emerald-950/60 text-slate-400 hover:text-emerald-300 transition"
                        title="匯出此專案為 JSON 檔案"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit project */}
                      <button
                        onClick={() => handleStartEdit(proj)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="編輯專案名稱與顏色"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete project */}
                      {projects.length > 1 && (
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `確定要刪除專案「${proj.name}」嗎？該專案下的項目也將一併移除。`
                              )
                            ) {
                              onDeleteProject(proj.id);
                            }
                          }}
                          className="p-1.5 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
                          title="刪除專案"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-800/50 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 transition"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
