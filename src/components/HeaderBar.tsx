import React from 'react';
import { 
  FileSpreadsheet, FileText, Sparkles, HelpCircle, 
  Settings, Check, Download, PanelRightClose, PanelRightOpen,
  PanelLeftClose, PanelLeftOpen, Maximize2, Minimize2, Table2, Layers, Key
} from 'lucide-react';
import { FMEADocument, ProductCategory, FMEAType } from '../types';
import { CATEGORY_INFO } from '../data/criteriaData';

interface HeaderBarProps {
  document: FMEADocument;
  onCategoryChange: (cat: ProductCategory) => void;
  onOpenDocInfo: () => void;
  onOpenAISuggestions: () => void;
  onOpenCriteria: () => void;
  onOpenProductPresets?: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onOpenAPIKey?: () => void;
  hasApiKey?: boolean;
  isRightSidebarOpen?: boolean;
  onToggleRightSidebar?: () => void;
  isLeftSidebarCollapsed?: boolean;
  onToggleLeftSidebar?: () => void;
  isTableMaximized?: boolean;
  onToggleTableMaximized?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  document,
  onCategoryChange,
  onOpenDocInfo,
  onOpenAISuggestions,
  onOpenCriteria,
  onOpenProductPresets,
  onExportExcel,
  onExportPDF,
  onOpenAPIKey,
  hasApiKey = false,
  isRightSidebarOpen = false,
  onToggleRightSidebar,
  isLeftSidebarCollapsed = false,
  onToggleLeftSidebar,
  isTableMaximized = false,
  onToggleTableMaximized,
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-5 shrink-0 z-30 shadow-2xs">
      {/* Brand logo & product title */}
      <div className="flex items-center space-x-2.5">
        {onToggleLeftSidebar && (
          <button
            onClick={onToggleLeftSidebar}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            title={isLeftSidebarCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng (Tăng không gian bảng)"}
          >
            {isLeftSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-indigo-600" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}

        <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-xs flex items-center justify-center">
          <Table2 className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 flex items-center gap-1.5 leading-none">
            FMEA <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-4">Optimizer</span>
          </h1>
          <p className="text-[10px] text-slate-500 hidden sm:block leading-tight mt-0.5">
            {document.productName} ({document.productCode || 'N/A'}) • {document.fmeaType}
          </p>
        </div>
      </div>

      {/* Category selector & Action controls */}
      <div className="flex items-center space-x-2">
        {/* Category dropdown */}
        <div className="flex items-center bg-slate-100 rounded-md px-2.5 py-1 border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 mr-1.5 uppercase tracking-wider hidden sm:inline">
            Ngành:
          </span>
          <select
            value={document.category}
            onChange={(e) => {
              const newCat = e.target.value as ProductCategory;
              onCategoryChange(newCat);
              if (onOpenProductPresets) {
                onOpenProductPresets();
              }
            }}
            className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:ring-0 focus:outline-hidden cursor-pointer"
            title="Chọn ngành sản phẩm để xem danh sách sản phẩm mẫu đặc trưng"
          >
            {(Object.keys(CATEGORY_INFO) as ProductCategory[]).map((catKey) => (
              <option key={catKey} value={catKey}>
                {CATEGORY_INFO[catKey].label}
              </option>
            ))}
          </select>
        </div>

        {/* Characteristic Products & FMEA Templates Button */}
        {onOpenProductPresets && (
          <button
            onClick={onOpenProductPresets}
            className="flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold transition-colors shadow-2xs"
            title="Xem các sản phẩm đặc trưng & tải mẫu FMEA (DFMEA / PFMEA)"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Sản Phẩm Mẫu</span>
          </button>
        )}

        {/* Maximize Table Space Toggle */}
        {onToggleTableMaximized && (
          <button
            onClick={onToggleTableMaximized}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border shadow-2xs ${
              isTableMaximized
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title={isTableMaximized ? "Thu nhỏ về giao diện thường" : "Tập trung không gian: Mở rộng bảng tối đa"}
          >
            {isTableMaximized ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Thu Gọn Bảng</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden md:inline">Mở Rộng Bảng Tối Đa</span>
              </>
            )}
          </button>
        )}

        {/* AI Suggestions button */}
        <button
          onClick={onOpenAISuggestions}
          className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold shadow-xs transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Gợi Ý AI</span>
        </button>

        {/* Export Excel */}
        <button
          onClick={onExportExcel}
          className="flex items-center space-x-1.5 bg-white border border-slate-200 hover:bg-slate-50 px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 transition-colors shadow-2xs"
          title="Xuất Báo Cáo Excel (.xlsx)"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden lg:inline">Excel</span>
        </button>

        {/* Export PDF */}
        <button
          onClick={onExportPDF}
          className="flex items-center space-x-1.5 bg-white border border-slate-200 hover:bg-slate-50 px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 transition-colors shadow-2xs"
          title="Xuất Báo Cáo PDF (.pdf)"
        >
          <FileText className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden lg:inline">PDF</span>
        </button>

        {/* API Key Configuration */}
        {onOpenAPIKey && (
          <button
            onClick={onOpenAPIKey}
            className={`flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold transition-colors border shadow-2xs cursor-pointer ${
              hasApiKey
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title={hasApiKey ? "Gemini API Key: Đã kết nối. Nhấp để thay đổi" : "Điền API Key Gemini của bạn"}
          >
            <Key className={`w-3.5 h-3.5 ${hasApiKey ? 'text-emerald-600' : 'text-amber-500'}`} />
            <span className="hidden md:inline">API Key</span>
            <span className={`w-1.5 h-1.5 rounded-full ${hasApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          </button>
        )}

        {/* S-O-D Criteria */}
        <button
          onClick={onOpenCriteria}
          className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-md transition-colors shadow-2xs"
          title="Bảng tra cứu tiêu chuẩn S-O-D (AIAG-VDA)"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Document metadata settings */}
        <button
          onClick={onOpenDocInfo}
          className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-md transition-colors shadow-2xs"
          title="Cài đặt thông tin hồ sơ FMEA"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Toggle Right AI Sidebar */}
        {onToggleRightSidebar && (
          <button
            onClick={onToggleRightSidebar}
            className={`p-1.5 border rounded-md transition-colors shadow-2xs flex items-center justify-center ${
              isRightSidebarOpen 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title={isRightSidebarOpen ? "Đóng khung gợi ý thông minh" : "Mở khung gợi ý thông minh"}
          >
            {isRightSidebarOpen ? (
              <PanelRightClose className="w-3.5 h-3.5" />
            ) : (
              <PanelRightOpen className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};
