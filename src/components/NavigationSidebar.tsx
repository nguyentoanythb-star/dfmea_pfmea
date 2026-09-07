import React, { useState } from 'react';
import { 
  FileSpreadsheet, Activity, BookOpen, AlertTriangle, Layers,
  ChevronLeft, ChevronRight, History, BookmarkPlus, RotateCcw,
  PlusCircle, Trash2, Eye, Search
} from 'lucide-react';
import { FMEAType, HistoricalDeployment } from '../types';

interface NavigationSidebarProps {
  fmeaType: FMEAType;
  onFMEATypeChange: (type: FMEAType) => void;
  activeView: 'table' | 'progress' | 'library';
  onViewChange: (view: 'table' | 'progress' | 'library') => void;
  highRiskCount: number;
  totalCount: number;
  completedCount: number;
  onOpenProductPresets?: () => void;
  onFilterHighRisk?: () => void;
  isHighRiskFilterActive?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  // History Feature
  historyList: HistoricalDeployment[];
  onOpenSaveHistory: () => void;
  onSelectHistoryItem: (item: HistoricalDeployment) => void;
  onDeleteHistoryItem: (id: string) => void;
  onQuickLoadHistory: (item: HistoricalDeployment, mode: 'replace' | 'append') => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  fmeaType,
  onFMEATypeChange,
  activeView,
  onViewChange,
  highRiskCount,
  totalCount,
  completedCount,
  onOpenProductPresets,
  onFilterHighRisk,
  isHighRiskFilterActive = false,
  isCollapsed = false,
  onToggleCollapse,
  historyList,
  onOpenSaveHistory,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onQuickLoadHistory,
}) => {
  const [historySearch, setHistorySearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredHistory = historyList.filter(item => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.productName.toLowerCase().includes(q) ||
      item.productCode?.toLowerCase().includes(q)
    );
  });

  // Collapsed compact rail view (takes only 56px)
  if (isCollapsed) {
    return (
      <aside className="w-14 border-r border-slate-200 bg-white flex flex-col items-center py-3 shrink-0 select-none z-20 justify-between h-full">
        <div className="flex flex-col items-center space-y-3 w-full px-1.5">
          {/* FMEA Type indicator / switcher */}
          <button
            onClick={() => onFMEATypeChange(fmeaType === 'DFMEA' ? 'PFMEA' : 'DFMEA')}
            className="w-10 h-10 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex flex-col items-center justify-center font-bold text-[10px] transition-colors border border-indigo-200 cursor-pointer"
            title={`Chuyển đổi loại FMEA (Hiện tại: ${fmeaType})`}
          >
            <span>{fmeaType === 'DFMEA' ? 'D' : 'P'}</span>
            <span className="text-[8px] font-medium text-indigo-500">FMEA</span>
          </button>

          <div className="w-8 h-px bg-slate-200 my-1" />

          {/* Table View button */}
          <button
            onClick={() => {
              onViewChange('table');
              if (isHighRiskFilterActive && onFilterHighRisk) onFilterHighRisk();
            }}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors relative cursor-pointer ${
              activeView === 'table' && !isHighRiskFilterActive
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Bảng phân tích FMEA"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-indigo-100 text-indigo-800 text-[9px] font-bold px-1 rounded-full border border-indigo-200">
              {totalCount}
            </span>
          </button>

          {/* High risk filter button */}
          <button
            onClick={onFilterHighRisk}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors relative cursor-pointer ${
              isHighRiskFilterActive
                ? 'bg-rose-600 text-white shadow-xs animate-pulse'
                : highRiskCount > 0
                ? 'text-rose-600 hover:bg-rose-50'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
            title={`Lọc lỗi rủi ro cao: ${highRiskCount} lỗi`}
          >
            <AlertTriangle className="w-5 h-5" />
            {highRiskCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full">
                {highRiskCount}
              </span>
            )}
          </button>

          {/* Progress View */}
          <button
            onClick={() => onViewChange('progress')}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeView === 'progress'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Biểu đồ & Tiến độ đối sách"
          >
            <Activity className="w-5 h-5" />
          </button>

          {/* Library View */}
          <button
            onClick={() => onViewChange('library')}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeView === 'library'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Thư viện FMEA chuẩn"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          {/* Product Presets */}
          {onOpenProductPresets && (
            <button
              onClick={onOpenProductPresets}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition-colors cursor-pointer"
              title="Mẫu sản phẩm đặc trưng & tải FMEA"
            >
              <Layers className="w-5 h-5" />
            </button>
          )}

          <div className="w-8 h-px bg-slate-200 my-1" />

          {/* History Collapsed Trigger */}
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors relative cursor-pointer"
            title={`Lịch sử đã triển khai (${historyList.length} bản ghi). Nhấp để mở rộng`}
          >
            <History className="w-5 h-5" />
            <span className="text-[9px] font-bold mt-0.5 text-indigo-700">{historyList.length}</span>
          </button>
        </div>

        {/* Expand button at bottom */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Mở rộng thanh menu"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </aside>
    );
  }

  // Expanded normal sidebar view: Highly optimized vertical flex allocation
  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col p-2.5 shrink-0 select-none overflow-hidden z-20 h-full">
      {/* TOP SECTION: Controls & Navigation (Compact shrink-0) */}
      <div className="shrink-0">
        {/* SECTION 1: QUY TRÌNH ĐÁNH GIÁ */}
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Quy trình đánh giá
          </span>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
              title="Thu gọn menu"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="space-y-1">
          <button
            onClick={() => {
              onFMEATypeChange('DFMEA');
              onViewChange('table');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              fmeaType === 'DFMEA' && activeView === 'table' && !isHighRiskFilterActive
                ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${fmeaType === 'DFMEA' ? 'bg-indigo-600' : 'bg-slate-300'}`} />
              <span>DFMEA Thiết kế</span>
            </div>
            {fmeaType === 'DFMEA' && (
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-mono font-bold">
                {totalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onFMEATypeChange('PFMEA');
              onViewChange('table');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              fmeaType === 'PFMEA' && activeView === 'table' && !isHighRiskFilterActive
                ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${fmeaType === 'PFMEA' ? 'bg-indigo-600' : 'bg-slate-300'}`} />
              <span>PFMEA Quá trình</span>
            </div>
            {fmeaType === 'PFMEA' && (
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-mono font-bold">
                {totalCount}
              </span>
            )}
          </button>
        </div>

        {/* SECTION 2: GIAO DIỆN LÀM VIỆC */}
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mt-3 mb-1.5">
          Giao diện làm việc
        </div>

        <div className="space-y-1">
          <button
            onClick={() => {
              onViewChange('table');
              if (isHighRiskFilterActive && onFilterHighRisk) onFilterHighRisk();
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeView === 'table' && !isHighRiskFilterActive
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <span>Bảng phân tích FMEA</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => onViewChange('progress')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeView === 'progress'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Tiến độ & Biểu đồ</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">
              {completedCount}/{totalCount}
            </span>
          </button>

          <button
            onClick={() => onViewChange('library')}
            className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeView === 'library'
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Thư viện mẫu chuẩn</span>
          </button>

          {/* Product Presets Picker */}
          {onOpenProductPresets && (
            <button
              onClick={onOpenProductPresets}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/90 border border-indigo-200 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Mẫu SP đặc trưng</span>
              </div>
              <span className="text-[10px] text-indigo-600 bg-white px-1.5 py-0.5 rounded font-bold border border-indigo-100">
                15+ mẫu
              </span>
            </button>
          )}

          {/* High risk filter button */}
          <button
            onClick={onFilterHighRisk}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              isHighRiskFilterActive
                ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className={`w-4 h-4 ${highRiskCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
              <span>Lọc lỗi rủi ro cao</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
              highRiskCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {highRiskCount}
            </span>
          </button>
        </div>
      </div>

      {/* SECTION 3: LỊCH SỬ ĐÃ TRIỂN KHAI - MỞ RỘNG TỐI ĐA TOÀN BỘ DIỆN TÍCH TRỐNG CÒN LẠI */}
      <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex items-center justify-between px-1 mb-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Lịch sử triển khai ({historyList.length})
            </span>
          </div>
          <button
            onClick={onOpenSaveHistory}
            className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-0.5 rounded font-bold transition-colors cursor-pointer border border-indigo-200 bg-indigo-50/50 shadow-2xs"
            title="Lưu bản FMEA hiện tại vào lịch sử"
          >
            <BookmarkPlus className="w-3 h-3 text-indigo-600" />
            <span>+ Lưu</span>
          </button>
        </div>

        {/* Quick filter in history */}
        {historyList.length > 1 && (
          <div className="relative mb-2 px-0.5 shrink-0">
            <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Tìm theo tên sản phẩm, mã hiệu..."
              className="w-full text-[11px] pl-6 pr-2 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-hidden focus:border-indigo-400"
            />
          </div>
        )}

        {/* Expanded Scrollable list of deployed FMEA history snapshots (Full Remaining Height) */}
        <div className="space-y-2 overflow-y-auto flex-1 min-h-0 pr-1 py-0.5">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-6 px-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-400 text-[11px]">
              {historySearch ? 'Không tìm thấy bản lưu phù hợp' : 'Chưa có bản lưu nào. Bấm "+ Lưu" để lưu hồ sơ hiện tại.'}
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-300 hover:shadow-2xs transition-all text-xs group relative flex flex-col gap-1.5"
              >
                {/* Top line: Badges, Saved time & Delete Trigger */}
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                      item.fmeaType === 'DFMEA'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {item.fmeaType}
                    </span>
                    <span className="text-slate-400 font-mono text-[9px]">{item.savedAt.slice(5, 16)}</span>
                  </div>

                  {/* Delete action button with visual feedback */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(confirmDeleteId === item.id ? null : item.id);
                    }}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      confirmDeleteId === item.id 
                        ? 'bg-rose-100 text-rose-700' 
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title="Xóa bản lưu này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Inline Confirmation Alert for Deletion */}
                {confirmDeleteId === item.id && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="bg-rose-50 border border-rose-200 rounded-md p-1.5 my-0.5 flex items-center justify-between animate-in fade-in zoom-in-95 duration-100 shadow-2xs"
                  >
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-rose-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Xác nhận xóa?</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteHistoryItem(item.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
                        title="Xác nhận xóa vĩnh viễn"
                      >
                        Xóa
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                        className="px-1.5 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-[10px] font-medium transition-colors cursor-pointer"
                        title="Hủy thao tác"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {/* Title & Product info */}
                <div 
                  onClick={() => onSelectHistoryItem(item)}
                  className="cursor-pointer"
                >
                  <div className="font-bold text-slate-800 text-[11px] leading-tight line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {item.productName}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between">
                    <span>{item.itemCount} mục • {item.phase}</span>
                    {item.highRiskCount > 0 && (
                      <span className="text-rose-600 font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {item.highRiskCount} cảnh báo
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action Footer Buttons */}
                <div className="pt-1 mt-0.5 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                  <button
                    type="button"
                    onClick={() => onSelectHistoryItem(item)}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    title="Xem chi tiết các mục trước khi sử dụng"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Chi tiết</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onQuickLoadHistory(item, 'append')}
                      className="text-[10px] text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 px-1.5 py-0.5 rounded transition-colors font-medium cursor-pointer border border-slate-200 hover:border-indigo-200 bg-white"
                      title="Nối thêm các mục vào bảng hiện tại"
                    >
                      + Nối vào
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickLoadHistory(item, 'replace')}
                      className="text-[10px] text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer border border-indigo-200"
                      title="Tải thay thế toàn bộ bảng hiện tại"
                    >
                      Mở lại
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Info Box (Compact anchor at bottom) */}
      <div className="mt-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-500 shrink-0 flex items-center justify-between">
        <div className="font-semibold text-slate-600 flex items-center gap-1">
          <Layers className="w-3 h-3 text-indigo-600" />
          <span>Chuẩn AIAG-VDA</span>
        </div>
        <span className="text-[9px] text-slate-400 font-mono">RPN ≥ 100</span>
      </div>
    </aside>
  );
};
