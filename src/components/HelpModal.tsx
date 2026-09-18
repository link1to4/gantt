import React from 'react';
import { X, Move, ArrowLeftRight, Edit3, PlusCircle, Moon, Sun, CheckCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <span>甘特圖排程操作指南</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <Move className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">移動項目時間位置</div>
              <div className="text-xs text-slate-400 mt-0.5">
                以滑鼠或手指按住項目方塊中央，向左或向右拖曳，方塊會自動以 <strong>30 分鐘 (半小時)</strong> 為單位精確吸附對齊時間網格。
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <ArrowLeftRight className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">拉伸調整時間長度</div>
              <div className="text-xs text-slate-400 mt-0.5">
                滑鼠懸停於方塊的<strong>左邊緣</strong>可調整開始時間；按住<strong>右邊緣</strong>拉伸可增減持續長度，同樣以 <strong>30 分鐘 (半小時)</strong> 為單位微調。
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <PlusCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">X 軸連續多日延伸 (Day 1 ➔ Day 2 ➔ Day 3...)</div>
              <div className="text-xs text-slate-400 mt-0.5">
                點擊頂部或時間軸右側的<strong>「增加日期」</strong>，時間軸會沿 X 軸依序向右延伸多日排程。在連續檢視下，您甚至可以直接將方塊<strong>橫向跨日拖曳</strong>至其他天的對應時段。
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <Edit3 className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">快速重命名與詳細編輯</div>
              <div className="text-xs text-slate-400 mt-0.5">
                <strong>雙擊方塊標題</strong>可直接修改名稱；點擊方塊上的筆型圖示可開啟完整編輯表單，調整顏色與備註。
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200/90 text-xs flex items-center gap-2.5">
            <Moon className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>工時與休息規則：</strong> 正常工時為 08:30 ~ 17:30，中午 12:00 ~ 13:00 為休息時間不計算工時；17:30 ~ 22:00 為加班時段。跨午休排程會自動扣除 1 小時休息時間，並於頂部資訊列與方塊上精準統計。
            </span>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-800/50 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};
