import React, { useState, useRef } from 'react';
import { X, Upload, FileCode, CheckCircle2, AlertTriangle, ArrowRight, FolderKanban, Download, RefreshCw } from 'lucide-react';
import { Project, DaySchedule } from '../types';
import { COLOR_OPTIONS } from '../constants';
import { parseProjectImport, ParsedImportResult } from '../utils/projectTransfer';

interface ProjectImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingProjects: Project[];
  existingDays: DaySchedule[];
  onImportSingleProject: (data: Extract<ParsedImportResult, { type: 'single-project' }>) => void;
  onImportAllProjects: (data: Extract<ParsedImportResult, { type: 'all-projects' }>, overwrite: boolean) => void;
}

export const ProjectImportModal: React.FC<ProjectImportModalProps> = ({
  isOpen,
  onClose,
  existingProjects,
  existingDays,
  onImportSingleProject,
  onImportAllProjects,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [overwriteMode, setOverwriteMode] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setParsedData(null);
    setErrorMsg(null);
    setFileName('');
    setOverwriteMode(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setErrorMsg('請選取 .json 格式的專案檔案');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const result = parseProjectImport(text);
        setParsedData(result);
      } catch (err: any) {
        setErrorMsg(err.message || '檔案解析失敗，請確認檔案格式是否正確');
        setParsedData(null);
      }
    };
    reader.onerror = () => {
      setErrorMsg('檔案讀取失敗，請重新選取');
      setParsedData(null);
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleConfirmImport = () => {
    if (!parsedData) return;

    if (parsedData.type === 'single-project') {
      onImportSingleProject(parsedData);
      handleClose();
    } else if (parsedData.type === 'all-projects') {
      onImportAllProjects(parsedData, overwriteMode);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-800 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">匯入專案檔案</h3>
              <p className="text-xs text-slate-500">
                上傳單一專案或全備份 JSON 檔案，快速還原排程工作項目
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* File Upload / Dropzone */}
          {!parsedData ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70 hover:border-slate-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
                <FileCode className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-900">
                點擊選取或拖曳專案 JSON 檔案至此
              </p>
              <p className="text-xs text-slate-500 mt-1">
                支援此系統匯出的單一專案檔 (*_專案匯出.json) 或全專案備份檔
              </p>
            </div>
          ) : (
            /* Parsed Preview Card */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-bold text-slate-900">檔案讀取成功</span>
                  </div>
                  <button
                    onClick={resetState}
                    className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>更換檔案</span>
                  </button>
                </div>

                <div className="text-xs text-slate-600 font-mono bg-white px-3 py-1.5 rounded border border-slate-200">
                  {fileName}
                </div>

                {parsedData.type === 'single-project' ? (
                  <div className="space-y-2 pt-1 border-t border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">專案類型：</span>
                      <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                        單一專案匯入
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">專案名稱：</span>
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            COLOR_OPTIONS[parsedData.project.color]?.bg || 'bg-blue-500'
                          }`}
                        />
                        {parsedData.project.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">內含工作項目：</span>
                      <span className="font-mono text-emerald-600 font-bold">
                        共 {parsedData.totalTasksCount} 個排程項目
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">涵蓋天數日程：</span>
                      <span className="font-mono text-slate-700">
                        {parsedData.daysWithTasks.length} 個日程
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1 border-t border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">檔案類型：</span>
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                        全專案完整備份檔
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">專案總數：</span>
                      <span className="font-mono text-indigo-600 font-bold">
                        {parsedData.projects.length} 個專案
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">總工作項目：</span>
                      <span className="font-mono text-emerald-600 font-bold">
                        共 {parsedData.totalTasksCount} 個排程項目
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">包含天數：</span>
                      <span className="font-mono text-slate-700">
                        {parsedData.days.length} 天日程
                      </span>
                    </div>

                    {/* Mode selection for all-projects */}
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                      <div className="font-medium text-slate-700 mb-1.5">匯入模式選擇：</div>
                      <label className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300">
                        <input
                          type="radio"
                          name="importMode"
                          checked={!overwriteMode}
                          onChange={() => setOverwriteMode(false)}
                          className="mt-0.5 text-indigo-600"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">合併新增模式 (推薦)</div>
                          <div className="text-[11px] text-slate-500">
                            保留現有專案與排程，將備份檔案中的專案與項目作為新專案併入
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300">
                        <input
                          type="radio"
                          name="importMode"
                          checked={overwriteMode}
                          onChange={() => setOverwriteMode(true)}
                          className="mt-0.5 text-indigo-600"
                        />
                        <div>
                          <div className="font-semibold text-rose-600">完整覆蓋還原模式</div>
                          <div className="text-[11px] text-slate-500">
                            清空目前的工作區，完全由備份檔案還原所有專案與日程排程
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">匯入解析失敗</p>
                <p className="text-rose-600 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200/60 border border-slate-200 transition"
          >
            取消
          </button>

          <button
            disabled={!parsedData}
            onClick={handleConfirmImport}
            className={`px-5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              parsedData
                ? overwriteMode
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs active:scale-95'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <span>確認匯入專案</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
