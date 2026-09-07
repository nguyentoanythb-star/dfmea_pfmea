import React, { useState, useEffect } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { NavigationSidebar } from './components/NavigationSidebar';
import { SmartSuggestionsSidebar } from './components/SmartSuggestionsSidebar';
import { FMEATable } from './components/FMEATable';
import { ProgressTracker } from './components/ProgressTracker';
import { LibraryView } from './components/LibraryView';
import { AISuggestionModal } from './components/AISuggestionModal';
import { CriteriaModal } from './components/CriteriaModal';
import { DocumentInfoModal } from './components/DocumentInfoModal';
import { ActionProposalModal } from './components/ActionProposalModal';
import { ProductPresetModal } from './components/ProductPresetModal';
import { APIKeyModal } from './components/APIKeyModal';
import { SaveHistoryModal } from './components/SaveHistoryModal';
import { HistoryDetailModal } from './components/HistoryDetailModal';
import { ProductPreset, convertPresetItemsToFMEAItems } from './data/productPresetsData';
import { FMEADocument, FMEAItem, ProductCategory, FMEAType, HistoricalDeployment } from './types';
import { INITIAL_FMEA_DOCUMENT } from './data/historicalFMEAData';
import { calculateRPN, CATEGORY_INFO } from './data/criteriaData';
import { exportToExcel, exportToPDF } from './utils/exportUtils';
import { getStoredApiKey, hasStoredApiKey } from './utils/apiKeyStorage';
import { getHistoryList, saveCurrentDocumentToHistory, deleteHistoryItem } from './utils/historyStorage';
import { 
  CheckCircle2, AlertTriangle, ShieldCheck, Activity, 
  Layers, ChevronRight, Maximize2, Minimize2, Sparkles, Filter
} from 'lucide-react';

const STORAGE_KEY = 'fmea_document_data_v1';

export default function App() {
  const [document, setDocument] = useState<FMEADocument>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved document:', e);
    }
    return INITIAL_FMEA_DOCUMENT;
  });

  const [activeView, setActiveView] = useState<'table' | 'progress' | 'library'>('table');
  const [isCriteriaOpen, setIsCriteriaOpen] = useState(false);
  const [criteriaTab, setCriteriaTab] = useState<'S' | 'O' | 'D'>('S');
  const [isAISuggestionsOpen, setIsAISuggestionsOpen] = useState(false);
  const [isDocInfoOpen, setIsDocInfoOpen] = useState(false);
  const [isProductPresetModalOpen, setIsProductPresetModalOpen] = useState(false);
  const [actionModalItem, setActionModalItem] = useState<FMEAItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // API Key & History feature states
  const [isAPIKeyModalOpen, setIsAPIKeyModalOpen] = useState(false);
  const [isSaveHistoryModalOpen, setIsSaveHistoryModalOpen] = useState(false);
  const [selectedHistoryDetail, setSelectedHistoryDetail] = useState<HistoricalDeployment | null>(null);
  const [historyList, setHistoryList] = useState<HistoricalDeployment[]>(() => getHistoryList());
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => hasStoredApiKey());
  
  // Layout space optimization states:
  // Right sidebar is closed by default to give maximum horizontal space to the analysis table
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  // Left sidebar can be collapsed to icon rail (56px) or expanded
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  // Maximize Table Focus Mode: collapses left sidebar and closes right sidebar
  const [isTableMaximized, setIsTableMaximized] = useState(false);

  const [isHighRiskFilterActive, setIsHighRiskFilterActive] = useState(false);

  // Save to localStorage when document changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [document]);

  // Listen to API Key and History storage events
  useEffect(() => {
    const handleKeyChange = () => setHasApiKey(hasStoredApiKey());
    const handleHistoryChange = () => setHistoryList(getHistoryList());

    window.addEventListener('fmea_api_key_changed', handleKeyChange);
    window.addEventListener('fmea_history_changed', handleHistoryChange);
    return () => {
      window.removeEventListener('fmea_api_key_changed', handleKeyChange);
      window.removeEventListener('fmea_history_changed', handleHistoryChange);
    };
  }, []);

  const handleSaveCurrentToHistory = (customTitle: string, note: string) => {
    const saved = saveCurrentDocumentToHistory(document, customTitle, note);
    setHistoryList(getHistoryList());
    showToast(`Đã lưu "${saved.title}" vào lịch sử triển khai!`);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistoryList(updated);
    showToast('Đã xóa bản ghi khỏi lịch sử');
  };

  const handleLoadHistoryReplace = (hist: HistoricalDeployment) => {
    setDocument({
      ...hist.documentSnapshot,
      updatedDate: new Date().toISOString().slice(0, 10),
    });
    showToast(`Đã tải bản ghi: "${hist.title}"`);
  };

  const handleLoadHistoryAppend = (hist: HistoricalDeployment) => {
    const newItems = hist.documentSnapshot.items || [];
    setDocument(prev => {
      const currentCount = prev.items.length;
      const adjusted = newItems.map((item, idx) => ({
        ...item,
        id: `fmea-hist-${Date.now()}-${idx}`,
        itemNo: currentCount + idx + 1,
      }));
      return {
        ...prev,
        updatedDate: new Date().toISOString().slice(0, 10),
        items: [...prev.items, ...adjusted],
      };
    });
    showToast(`Đã nối thêm ${newItems.length} mục từ "${hist.title}" vào bảng`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Metrics calculation
  const total = document.items.length;
  const highRiskItems = document.items.filter(i => i.rpn >= 100 || i.S >= 8);
  const completedCount = document.items.filter(i => i.status === 'completed').length;
  const inProgressCount = document.items.filter(i => i.status === 'in_progress' || i.status === 'under_review').length;
  const currentCategoryLabel = CATEGORY_INFO[document.category]?.label || document.category;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // Handlers
  const handleUpdateItem = (itemId: string, updates: Partial<FMEAItem>) => {
    setDocument(prev => ({
      ...prev,
      updatedDate: new Date().toISOString().slice(0, 10),
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updated = { ...item, ...updates };
          if ('S' in updates || 'O' in updates || 'D' in updates) {
            updated.rpn = calculateRPN(updated.S, updated.O, updated.D);
            if (!('conclusion' in updates)) {
              updated.conclusion = (updated.S >= 8 || updated.rpn >= 40) ? 'Cần cải tiến' : 'Không cải tiến';
            }
          }
          return updated;
        }
        return item;
      }),
    }));
  };

  const handleDeleteItem = (itemId: string) => {
    setDocument(prev => ({
      ...prev,
      updatedDate: new Date().toISOString().slice(0, 10),
      items: prev.items.filter(i => i.id !== itemId).map((item, idx) => ({
        ...item,
        itemNo: idx + 1,
      })),
    }));
    showToast('Đã xóa dòng đánh giá');
  };

  const handleAddItem = (customFields?: Partial<FMEAItem>) => {
    const nextNo = document.items.length + 1;
    const newItem: FMEAItem = {
      id: 'fmea-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      itemNo: nextNo,
      componentName: customFields?.componentName || 'Chi tiết mới',
      riskIssue: customFields?.riskIssue || 'Chức năng kỹ thuật',
      failureMode: customFields?.failureMode || 'Mô tả sai lỗi tiềm ẩn',
      cause: customFields?.cause || 'Nguyên nhân tiềm ẩn',
      currentControl: customFields?.currentControl || 'Kiểm soát theo tiêu chuẩn cơ sở',
      S: customFields?.S || 5,
      O: customFields?.O || 3,
      D: customFields?.D || 3,
      rpn: customFields?.rpn || calculateRPN(customFields?.S || 5, customFields?.O || 3, customFields?.D || 3),
      conclusion: (customFields?.S || 5) >= 8 || (customFields?.rpn || 45) >= 40 ? 'Cần cải tiến' : 'Không cải tiến',
      action: customFields?.action || '',
      pic: customFields?.pic || 'Chưa phân công',
      startDate: customFields?.startDate || new Date().toISOString().slice(0, 10),
      dueDate: customFields?.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: customFields?.status || 'pending',
      result: customFields?.result || '',
      ...customFields,
    };

    setDocument(prev => ({
      ...prev,
      updatedDate: new Date().toISOString().slice(0, 10),
      items: [...prev.items, newItem],
    }));

    showToast('Đã thêm dòng phân tích mới');
  };

  const handleAddItems = (newItems: Partial<FMEAItem>[]) => {
    let currentIdx = document.items.length;
    const created = newItems.map(item => {
      currentIdx += 1;
      const s = item.S || 6;
      const o = item.O || 3;
      const d = item.D || 3;
      const rpn = item.rpn || calculateRPN(s, o, d);
      return {
        id: 'fmea-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        itemNo: currentIdx,
        componentName: item.componentName || 'Bộ phận',
        riskIssue: item.riskIssue || 'Chức năng',
        failureMode: item.failureMode || 'Sai lỗi',
        cause: item.cause || 'Nguyên nhân',
        currentControl: item.currentControl || 'Kiểm tra đo lường',
        S: s,
        O: o,
        D: d,
        rpn,
        conclusion: s >= 8 || rpn >= 40 ? 'Cần cải tiến' : 'Không cải tiến',
        action: item.action || '',
        pic: item.pic || 'Chưa phân công',
        startDate: item.startDate || new Date().toISOString().slice(0, 10),
        dueDate: item.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        status: item.status || 'pending',
        result: item.result || '',
        ...item,
      } as FMEAItem;
    });

    setDocument(prev => ({
      ...prev,
      updatedDate: new Date().toISOString().slice(0, 10),
      items: [...prev.items, ...created],
    }));

    showToast(`Đã thêm ${newItems.length} mục phân tích vào bảng`);
  };

  const handleCategoryChange = (category: ProductCategory) => {
    setDocument(prev => ({
      ...prev,
      category,
      updatedDate: new Date().toISOString().slice(0, 10),
    }));
    showToast(`Đã chuyển danh mục sang: ${CATEGORY_INFO[category]?.label || category}`);
  };

  const handleFMEATypeChange = (fmeaType: FMEAType) => {
    setDocument(prev => ({
      ...prev,
      fmeaType,
      updatedDate: new Date().toISOString().slice(0, 10),
    }));
    showToast(`Đã chuyển quy trình sang: ${fmeaType}`);
  };

  const handleToggleTableMaximized = () => {
    const nextState = !isTableMaximized;
    setIsTableMaximized(nextState);
    if (nextState) {
      setIsLeftSidebarCollapsed(true);
      setIsRightSidebarOpen(false);
      showToast('Đã kích hoạt chế độ mở rộng bảng tối đa');
    } else {
      setIsLeftSidebarCollapsed(false);
      showToast('Đã trở về chế độ xem tiêu chuẩn');
    }
  };

  const handleApplyAction = (
    itemId: string, 
    action: string, 
    sAfter?: number, 
    oAfter?: number, 
    dAfter?: number
  ) => {
    const item = document.items.find(i => i.id === itemId);
    if (!item) return;

    const rpnAfter = sAfter && oAfter && dAfter ? sAfter * oAfter * dAfter : undefined;

    handleUpdateItem(itemId, {
      action,
      sAfter,
      oAfter,
      dAfter,
      rpnAfter,
      status: item.status === 'pending' ? 'in_progress' : item.status,
    });

    showToast('Đã lưu đối sách cải tiến vào hồ sơ FMEA');
  };

  const handleClearAllItems = () => {
    setDocument(prev => ({
      ...prev,
      items: [],
      updatedDate: new Date().toISOString().slice(0, 10),
    }));
    showToast('Đã xóa toàn bộ bảng phân tích rủi ro');
  };

  const handleSelectProductPreset = (
    preset: ProductPreset,
    fmeaType: FMEAType,
    mode: 'replace' | 'append'
  ) => {
    const itemsDef = fmeaType === 'DFMEA' ? preset.dfmeaItems : preset.pfmeaItems;
    const newItems = convertPresetItemsToFMEAItems(itemsDef, fmeaType);

    if (mode === 'replace') {
      setDocument(prev => ({
        ...prev,
        productName: preset.name,
        productCode: preset.code,
        category: preset.category,
        fmeaType,
        phase: fmeaType === 'DFMEA' ? preset.dfmeaPhase : preset.pfmeaPhase,
        supplier: fmeaType === 'DFMEA' ? preset.dfmeaSupplier : preset.pfmeaSupplier,
        assemblyTest: fmeaType === 'DFMEA' ? preset.dfmeaAssemblyTest : preset.pfmeaAssemblyTest,
        functionalTest: fmeaType === 'DFMEA' ? preset.dfmeaFunctionalTest : preset.pfmeaFunctionalTest,
        periodicTest: fmeaType === 'DFMEA' ? preset.dfmeaPeriodicTest : preset.pfmeaPeriodicTest,
        updatedDate: new Date().toISOString().slice(0, 10),
        items: newItems,
      }));
      showToast(`Đã tải hồ sơ & mẫu ${fmeaType} của ${preset.name}`);
    } else {
      setDocument(prev => {
        const currentCount = prev.items.length;
        const adjustedItems = newItems.map((item, idx) => ({
          ...item,
          itemNo: currentCount + idx + 1,
        }));
        return {
          ...prev,
          category: preset.category,
          updatedDate: new Date().toISOString().slice(0, 10),
          items: [...prev.items, ...adjustedItems],
        };
      });
      showToast(`Đã nối thêm ${newItems.length} mục từ mẫu ${preset.name}`);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100/70 font-sans overflow-hidden text-slate-900 select-none">
      {/* Sleek Top Header Bar */}
      <HeaderBar
        document={document}
        onCategoryChange={handleCategoryChange}
        onOpenDocInfo={() => setIsDocInfoOpen(true)}
        onOpenAISuggestions={() => setIsAISuggestionsOpen(true)}
        onOpenCriteria={() => setIsCriteriaOpen(true)}
        onOpenProductPresets={() => setIsProductPresetModalOpen(true)}
        onOpenAPIKey={() => setIsAPIKeyModalOpen(true)}
        hasApiKey={hasApiKey}
        onExportExcel={async () => {
          showToast('Đang tạo và tải file Excel...');
          try {
            await exportToExcel(document);
            showToast('Xuất file Excel thành công!');
          } catch (err) {
            console.error(err);
            showToast('Lỗi khi xuất file Excel');
          }
        }}
        onExportPDF={async () => {
          showToast('Đang tạo và tải báo cáo PDF...');
          try {
            await exportToPDF(document);
            showToast('Xuất báo cáo PDF thành công!');
          } catch (err) {
            console.error(err);
            showToast('Lỗi khi xuất file PDF');
          }
        }}
        isRightSidebarOpen={isRightSidebarOpen}
        onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        isLeftSidebarCollapsed={isLeftSidebarCollapsed}
        onToggleLeftSidebar={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
        isTableMaximized={isTableMaximized}
        onToggleTableMaximized={handleToggleTableMaximized}
      />

      {/* Main Layout Area */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* Collapsible Left Navigation Sidebar */}
        <NavigationSidebar
          fmeaType={document.fmeaType}
          onFMEATypeChange={handleFMEATypeChange}
          activeView={activeView}
          onViewChange={(v) => {
            setActiveView(v);
            setIsHighRiskFilterActive(false);
          }}
          highRiskCount={highRiskItems.length}
          totalCount={total}
          completedCount={completedCount}
          onOpenProductPresets={() => setIsProductPresetModalOpen(true)}
          onFilterHighRisk={() => {
            setIsHighRiskFilterActive(!isHighRiskFilterActive);
          }}
          isHighRiskFilterActive={isHighRiskFilterActive}
          isCollapsed={isLeftSidebarCollapsed}
          onToggleCollapse={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
          historyList={historyList}
          onOpenSaveHistory={() => setIsSaveHistoryModalOpen(true)}
          onSelectHistoryItem={(item) => setSelectedHistoryDetail(item)}
          onDeleteHistoryItem={handleDeleteHistoryItem}
          onQuickLoadHistory={(item, mode) => {
            if (mode === 'replace') {
              handleLoadHistoryReplace(item);
            } else {
              handleLoadHistoryAppend(item);
            }
          }}
        />

        {/* Central Workspace Section: High Density & Maximized Table Focus */}
        <section className="flex-1 flex flex-col p-2 sm:p-3 overflow-hidden min-h-0 gap-2 bg-slate-100/80">
          {/* Ultra-Compact Quick KPI Status Ribbon (Takes only ~38px vertically instead of 130px) */}
          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
            {/* Left: Product & Stage Context */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>{document.productName}</span>
                <span className="text-[11px] font-normal text-slate-400">({document.productCode || 'N/A'})</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium hidden md:inline">
                {currentCategoryLabel}
              </span>
              <span className="text-slate-300 hidden md:inline">•</span>
              <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-indigo-100 hidden sm:inline">
                Giai đoạn: {document.phase}
              </span>
            </div>

            {/* Right: Quick KPI Badges & Focus Mode Button */}
            <div className="flex items-center gap-2.5">
              {/* Total risks badge */}
              <div className="flex items-center gap-1 text-slate-600">
                <span className="text-[11px] text-slate-400">Tổng rủi ro:</span>
                <strong className="text-slate-800 font-mono text-xs">{total}</strong>
              </div>

              <span className="text-slate-300">|</span>

              {/* High RPN alerts with toggle filter button */}
              <button
                onClick={() => setIsHighRiskFilterActive(!isHighRiskFilterActive)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer text-xs ${
                  isHighRiskFilterActive
                    ? 'bg-rose-600 text-white font-bold shadow-2xs'
                    : highRiskItems.length > 0
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                title="Nhấp để bật/tắt lọc nhanh các lỗi rủi ro cao (RPN ≥ 100 hoặc S ≥ 8)"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Cảnh báo cao: {highRiskItems.length}</span>
              </button>

              <span className="text-slate-300 hidden sm:inline">|</span>

              {/* Completed count & Progress bar */}
              <div className="items-center gap-1.5 hidden sm:flex">
                <span className="text-[11px] text-slate-400">Hoàn tất:</span>
                <strong className="text-emerald-700 font-mono text-xs">{completedCount}/{total}</strong>
                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500 font-semibold">{progressPercent}%</span>
              </div>

              {/* Table Maximize Quick Toggle */}
              <button
                onClick={handleToggleTableMaximized}
                className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                title={isTableMaximized ? "Thu gọn về kích thước chuẩn" : "Mở rộng bảng toàn màn hình"}
              >
                {isTableMaximized ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
                )}
              </button>
            </div>
          </div>

          {/* Primary View Container: 100% Height Fill */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {activeView === 'table' && (
              <FMEATable
                document={document}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onAddItem={() => handleAddItem()}
                onClearAll={handleClearAllItems}
                onOpenProductPresets={() => setIsProductPresetModalOpen(true)}
                onOpenCriteria={(type) => {
                  if (type) setCriteriaTab(type);
                  setIsCriteriaOpen(true);
                }}
                onSuggestAction={(item) => setActionModalItem(item)}
                onOpenDocInfo={() => setIsDocInfoOpen(true)}
                isHighRiskFilterActive={isHighRiskFilterActive}
              />
            )}

            {activeView === 'progress' && (
              <div className="flex-1 overflow-y-auto bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
                <ProgressTracker
                  items={document.items}
                  onUpdateItem={handleUpdateItem}
                  onSuggestAction={(item) => setActionModalItem(item)}
                />
              </div>
            )}

            {activeView === 'library' && (
              <div className="flex-1 overflow-y-auto bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
                <LibraryView
                  currentCategory={document.category}
                  onImportItem={(item) => handleAddItem(item)}
                  onOpenAISuggestions={() => setIsAISuggestionsOpen(true)}
                />
              </div>
            )}
          </div>
        </section>

        {/* Right Sidebar ("Gợi ý thông minh") - Can be toggled on demand */}
        {isRightSidebarOpen && (
          <SmartSuggestionsSidebar
            document={document}
            onAddItem={handleAddItem}
            onOpenAISuggestions={() => setIsAISuggestionsOpen(true)}
            onClose={() => setIsRightSidebarOpen(false)}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-3.5 py-2 rounded-lg shadow-xl flex items-center gap-2 text-xs font-semibold border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Interactive Modals */}
      <AISuggestionModal
        isOpen={isAISuggestionsOpen}
        onClose={() => setIsAISuggestionsOpen(false)}
        category={document.category}
        fmeaType={document.fmeaType}
        productName={document.productName}
        onAddItems={handleAddItems}
        onOpenAPIKeyModal={() => setIsAPIKeyModalOpen(true)}
      />

      <CriteriaModal
        isOpen={isCriteriaOpen}
        onClose={() => setIsCriteriaOpen(false)}
        defaultTab={criteriaTab}
      />

      <DocumentInfoModal
        isOpen={isDocInfoOpen}
        onClose={() => setIsDocInfoOpen(false)}
        document={document}
        onSave={(updated) => {
          setDocument(prev => ({
            ...prev,
            ...updated,
            updatedDate: new Date().toISOString().slice(0, 10),
          }));
          showToast('Đã lưu thông tin hồ sơ FMEA');
        }}
      />

      <ActionProposalModal
        isOpen={Boolean(actionModalItem)}
        onClose={() => setActionModalItem(null)}
        item={actionModalItem}
        category={document.category}
        onApplyAction={handleApplyAction}
      />

      <ProductPresetModal
        isOpen={isProductPresetModalOpen}
        onClose={() => setIsProductPresetModalOpen(false)}
        currentCategory={document.category}
        currentFMEAType={document.fmeaType}
        onSelectPreset={handleSelectProductPreset}
      />

      <APIKeyModal
        isOpen={isAPIKeyModalOpen}
        onClose={() => setIsAPIKeyModalOpen(false)}
        onSuccess={() => {
          setHasApiKey(hasStoredApiKey());
          showToast('Đã cấu hình Gemini API Key thành công!');
        }}
      />

      <SaveHistoryModal
        isOpen={isSaveHistoryModalOpen}
        onClose={() => setIsSaveHistoryModalOpen(false)}
        document={document}
        onSave={handleSaveCurrentToHistory}
      />

      <HistoryDetailModal
        isOpen={Boolean(selectedHistoryDetail)}
        onClose={() => setSelectedHistoryDetail(null)}
        deployment={selectedHistoryDetail}
        onLoadReplace={handleLoadHistoryReplace}
        onLoadAppend={handleLoadHistoryAppend}
        onDelete={handleDeleteHistoryItem}
      />
    </div>
  );
}
