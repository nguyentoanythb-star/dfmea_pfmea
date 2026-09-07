import React from 'react';
import { 
  Sparkles, AlertCircle, Check, ArrowRight, User, 
  Clock, ShieldAlert, Plus, ExternalLink, X
} from 'lucide-react';
import { FMEADocument, FMEAItem, ProductCategory } from '../types';
import { HISTORICAL_FAILURE_LIBRARY } from '../data/historicalFMEAData';
import { CATEGORY_INFO, calculateRPN } from '../data/criteriaData';

interface SmartSuggestionsSidebarProps {
  document: FMEADocument;
  onAddItem: (item: Partial<FMEAItem>) => void;
  onOpenAISuggestions: () => void;
  onClose?: () => void;
}

export const SmartSuggestionsSidebar: React.FC<SmartSuggestionsSidebarProps> = ({
  document,
  onAddItem,
  onOpenAISuggestions,
  onClose,
}) => {
  const currentCategoryInfo = CATEGORY_INFO[document.category] || CATEGORY_INFO.dien_gia_dung;

  // Filter historical templates relevant to the category
  const categoryTemplates = HISTORICAL_FAILURE_LIBRARY.filter(
    (t) => t.category === document.category
  );
  const featuredTemplate = categoryTemplates[0] || HISTORICAL_FAILURE_LIBRARY[0];
  const secondaryTemplate = categoryTemplates[1] || HISTORICAL_FAILURE_LIBRARY[1];

  // Find priority alert items from current document (RPN >= 100 or S >= 8)
  const unassignedCriticalItem = document.items.find(
    (item) => (item.rpn >= 100 || item.S >= 8) && (!item.pic || item.pic === 'Chưa phân công' || item.pic === 'Chưa giao')
  );

  const highestRiskItem = [...document.items].sort((a, b) => b.rpn - a.rpn)[0];

  // Get latest assigned P.I.C item
  const assignedItem = document.items.find((item) => item.pic && item.pic !== 'Chưa phân công' && item.pic !== 'Chưa giao') || document.items[0];

  const handleApplyTemplate = (tpl: typeof featuredTemplate) => {
    onAddItem({
      componentName: tpl.componentName,
      riskIssue: tpl.riskIssue,
      failureMode: tpl.failureMode,
      cause: tpl.cause,
      currentControl: 'Kiểm tra theo tiêu chuẩn cơ sở',
      S: tpl.defaultS,
      O: tpl.defaultO,
      D: tpl.defaultD,
      rpn: calculateRPN(tpl.defaultS, tpl.defaultO, tpl.defaultD),
      conclusion: tpl.defaultS >= 8 || calculateRPN(tpl.defaultS, tpl.defaultO, tpl.defaultD) >= 40 ? 'Cần cải tiến' : 'Không cải tiến',
      action: tpl.suggestedAction,
      pic: 'Chưa phân công',
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: 'pending',
      result: '',
    });
  };

  const getInitials = (name?: string) => {
    if (!name || name === 'Chưa phân công') return 'PIC';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="w-72 lg:w-80 bg-white border-l border-slate-200 flex flex-col overflow-hidden shrink-0 select-none shadow-lg z-20">
      {/* Header matching Sleek Interface */}
      <div className="p-3.5 bg-indigo-600 text-white flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-bold uppercase tracking-tight">Gợi ý thông minh</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={onOpenAISuggestions}
            className="text-[11px] bg-indigo-500 hover:bg-indigo-400 px-2 py-0.5 rounded text-white font-semibold transition-colors"
            title="Mở bảng phân tích AI chi tiết"
          >
            Mở AI
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-indigo-200 hover:text-white hover:bg-indigo-500 rounded transition-colors"
              title="Đóng khung gợi ý để mở rộng bảng"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cards container */}
      <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
        {/* Card 1: Contextual Category Suggestion */}
        {featuredTemplate && (
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg shadow-2xs">
            <div className="text-[10px] font-bold text-indigo-600 uppercase mb-1 flex items-center justify-between">
              <span>Mẫu gợi ý: {currentCategoryInfo.label}</span>
              <span className="font-mono text-indigo-700 bg-white px-1.5 py-0.2 rounded border border-indigo-200">
                RPN: {calculateRPN(featuredTemplate.defaultS, featuredTemplate.defaultO, featuredTemplate.defaultD)}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-800 leading-tight">
              {featuredTemplate.componentName}: {featuredTemplate.failureMode}
            </div>
            <div className="text-[11px] text-slate-600 mt-1.5 leading-snug">
              <strong className="text-slate-700">Nguyên nhân:</strong> {featuredTemplate.cause}
            </div>
            <div className="text-[10px] text-slate-600 mt-2 italic bg-white/90 p-2 rounded border border-indigo-100/80 leading-snug">
              <strong className="text-indigo-800 not-italic">Đối sách:</strong> {featuredTemplate.suggestedAction}
            </div>
            <button
              onClick={() => handleApplyTemplate(featuredTemplate)}
              className="mt-2.5 w-full py-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded hover:bg-indigo-700 transition-colors shadow-2xs flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Áp Dụng Vào Bảng
            </button>
          </div>
        )}

        {/* Card 2: Historical Insights */}
        {secondaryTemplate && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-2xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center justify-between">
              <span>Bài học từ dự án trước</span>
              <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 rounded font-mono font-bold">
                S:{secondaryTemplate.defaultS} O:{secondaryTemplate.defaultO} D:{secondaryTemplate.defaultD}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-800 leading-tight">
              {secondaryTemplate.componentName} - {secondaryTemplate.failureMode}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 leading-snug">
              Thường gặp trong giai đoạn thử nghiệm của {currentCategoryInfo.label}.
            </div>
            <button
              onClick={() => handleApplyTemplate(secondaryTemplate)}
              className="mt-2 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Thêm mục này vào bảng</span>
            </button>
          </div>
        )}

        {/* Card 3: Priority System Alert */}
        <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-lg shadow-2xs">
          <div className="text-[10px] font-bold text-rose-600 uppercase mb-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Cảnh báo an toàn RPN</span>
          </div>
          {unassignedCriticalItem ? (
            <>
              <div className="text-xs font-bold text-slate-800 leading-tight">
                Vượt ngưỡng an toàn ({unassignedCriticalItem.rpn} RPN)
              </div>
              <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                Chi tiết <strong>{unassignedCriticalItem.componentName}</strong> ({unassignedCriticalItem.failureMode}) chưa có người phụ trách.
              </p>
            </>
          ) : highestRiskItem && highestRiskItem.rpn >= 80 ? (
            <>
              <div className="text-xs font-bold text-slate-800 leading-tight">
                Hạng mục RPN cao nhất: {highestRiskItem.componentName}
              </div>
              <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                Điểm RPN: <strong>{highestRiskItem.rpn}</strong> (S:{highestRiskItem.S} O:{highestRiskItem.O} D:{highestRiskItem.D})
              </p>
            </>
          ) : (
            <p className="text-[10px] text-emerald-700 font-medium">
              Không có lỗi nghiêm trọng chưa phân công. Hệ thống hoạt động an toàn.
            </p>
          )}
        </div>
      </div>

      {/* Bottom P.I.C Card matching Sleek Interface */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0">
        <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
          Người phụ trách gần nhất
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs overflow-hidden flex items-center justify-center text-[10px] font-bold">
            {getInitials(assignedItem?.pic)}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-bold truncate text-slate-800">
              {assignedItem?.pic || document.author || 'Chưa phân công'}
            </div>
            <div className="text-[9px] text-slate-400 font-mono">
              Hạn chót: {assignedItem?.dueDate || 'Chưa định ngày'}
            </div>
          </div>
          {assignedItem?.status && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              assignedItem.status === 'completed' 
                ? 'bg-emerald-100 text-emerald-700' 
                : assignedItem.status === 'in_progress'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {assignedItem.status === 'completed' ? 'Xong' : 'Đang xử lý'}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
};
