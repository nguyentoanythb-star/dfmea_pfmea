import React, { useState } from 'react';
import { 
  X, Sparkles, Database, Plus, Check, Loader2, ArrowRight, Lightbulb, Key
} from 'lucide-react';
import { ProductCategory, FMEAType, FMEAItem } from '../types';
import { CATEGORY_INFO, calculateRPN, evaluateRPNRisk } from '../data/criteriaData';
import { HISTORICAL_FAILURE_LIBRARY } from '../data/historicalFMEAData';
import { getStoredApiKey, hasStoredApiKey } from '../utils/apiKeyStorage';

interface AISuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ProductCategory;
  fmeaType: FMEAType;
  productName: string;
  onAddItems: (items: Partial<FMEAItem>[]) => void;
  onOpenAPIKeyModal?: () => void;
}

export const AISuggestionModal: React.FC<AISuggestionModalProps> = ({
  isOpen,
  onClose,
  category,
  fmeaType,
  productName,
  onAddItems,
  onOpenAPIKeyModal,
}) => {
  const [activeMode, setActiveMode] = useState<'ai' | 'history'>('ai');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(category);
  const [componentInput, setComponentInput] = useState('');
  const [specificIssue, setSpecificIssue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>({});
  const [historySearch, setHistorySearch] = useState('');

  if (!isOpen) return null;

  // Filter historical library by category & search
  const filteredHistory = HISTORICAL_FAILURE_LIBRARY.filter(item => {
    const matchCat = item.category === selectedCategory;
    const matchQuery = historySearch 
      ? item.componentName.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.failureMode.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.cause.toLowerCase().includes(historySearch.toLowerCase())
      : true;
    return matchCat && matchQuery;
  });

  const handleFetchAISuggestions = async () => {
    if (!componentInput.trim()) return;
    setIsLoading(true);
    setAiSuggestions([]);
    setSelectedItems({});

    try {
      const storedKey = getStoredApiKey();
      const res = await fetch('/api/fmea/suggest-risks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(storedKey ? { 'x-gemini-api-key': storedKey } : {})
        },
        body: JSON.stringify({
          category: CATEGORY_INFO[selectedCategory]?.label || selectedCategory,
          fmeaType,
          productName,
          componentName: componentInput,
          currentIssues: specificIssue,
        }),
      });

      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setAiSuggestions(data.suggestions);
        // default select all
        const initialSelected: Record<number, boolean> = {};
        data.suggestions.forEach((_: any, idx: number) => {
          initialSelected[idx] = true;
        });
        setSelectedItems(initialSelected);
      }
    } catch (err) {
      console.error('Failed to get AI suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportAISuggestions = () => {
    const itemsToAdd = aiSuggestions
      .filter((_, idx) => selectedItems[idx])
      .map(item => ({
        componentName: item.componentName || componentInput,
        riskIssue: item.riskIssue || 'Hoạt động',
        failureMode: item.failureMode,
        cause: item.cause,
        currentControl: item.controlMethod || 'Test lắp ráp & Test chức năng',
        S: Number(item.recommendedS) || 7,
        O: Number(item.recommendedO) || 2,
        D: Number(item.recommendedD) || 3,
        rpn: calculateRPN(
          Number(item.recommendedS) || 7,
          Number(item.recommendedO) || 2,
          Number(item.recommendedD) || 3
        ),
        conclusion: ((Number(item.recommendedS) || 7) >= 8 || calculateRPN(item.recommendedS, item.recommendedO, item.recommendedD) >= 40)
          ? 'Cần cải tiến'
          : 'Không cải tiến',
        action: item.action || '',
        pic: 'Chưa phân công',
        startDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        status: 'pending',
        result: '',
      } as Partial<FMEAItem>));

    if (itemsToAdd.length > 0) {
      onAddItems(itemsToAdd);
      onClose();
    }
  };

  const handleImportHistoryItem = (item: typeof HISTORICAL_FAILURE_LIBRARY[0]) => {
    const newItem: Partial<FMEAItem> = {
      componentName: item.componentName,
      riskIssue: item.riskIssue,
      failureMode: item.failureMode,
      cause: item.cause,
      currentControl: 'Kiểm tra theo tiêu chuẩn cơ sở',
      S: item.defaultS,
      O: item.defaultO,
      D: item.defaultD,
      rpn: calculateRPN(item.defaultS, item.defaultO, item.defaultD),
      conclusion: (item.defaultS >= 8 || calculateRPN(item.defaultS, item.defaultO, item.defaultD) >= 40)
        ? 'Cần cải tiến'
        : 'Không cải tiến',
      action: item.suggestedAction,
      pic: 'Chưa phân công',
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: 'pending',
      result: '',
    };

    onAddItems([newItem]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-300">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Gợi Ý Rủi Ro Tự Động & Thư Viện Lịch Sử</h2>
              <p className="text-xs text-blue-200/80">Phân loại theo danh mục ngành hàng để tối ưu độ chính xác dự báo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMode('ai')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeMode === 'ai'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Gợi ý Rủi ro với AI (Gemini)
            </button>
            <button
              onClick={() => setActiveMode('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeMode === 'history'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Thư Viện Lịch Sử Bài Học ({HISTORICAL_FAILURE_LIBRARY.length})
            </button>
          </div>

          {/* Category Dropdown & API Key Config */}
          <div className="flex items-center gap-2.5">
            {onOpenAPIKeyModal && (
              <button
                type="button"
                onClick={onOpenAPIKeyModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors cursor-pointer"
                title="Cấu hình Google Gemini API Key để tùy biến AI"
              >
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">
                  {hasStoredApiKey() ? 'API Key: Đã lưu' : 'Điền API Key'}
                </span>
                <span className={`w-2 h-2 rounded-full ${hasStoredApiKey() ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              </button>
            )}

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Danh mục:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ProductCategory)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {(Object.keys(CATEGORY_INFO) as ProductCategory[]).map((catKey) => (
                  <option key={catKey} value={catKey}>
                    {CATEGORY_INFO[catKey].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeMode === 'ai' ? (
            <div className="space-y-5">
              {/* Input section */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    Nhập chi tiết cần phân tích rủi ro
                  </span>
                  <span className="text-xs text-blue-600 font-medium">
                    Sản phẩm: <strong className="text-blue-900">{productName}</strong> ({fmeaType})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên chi tiết / Bộ phận / Công đoạn <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Cụm Động cơ B4, Bo mạch biến tần, Cổ quạt, Mâm từ..."
                      value={componentInput}
                      onChange={(e) => setComponentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleFetchAISuggestions()}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mô tả thêm / Vấn đề quan tâm (Không bắt buộc)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Rung lắc khi quay tốc độ cao, đọng sương, rò điện..."
                      value={specificIssue}
                      onChange={(e) => setSpecificIssue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleFetchAISuggestions()}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Quick component suggestions buttons */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-xs text-slate-500">Gợi ý nhanh:</span>
                  {[
                    'Cụm Động cơ B4',
                    'Cánh quạt',
                    'Mạch điều khiển (PCB)',
                    'Khớp cổ nâng hạ',
                    'Nắp gáo quạt',
                    'Chân đế & Lò xo'
                  ].map((quickComp) => (
                    <button
                      key={quickComp}
                      onClick={() => setComponentInput(quickComp)}
                      className="px-2 py-0.5 text-xs bg-white hover:bg-blue-100 hover:text-blue-800 text-slate-600 rounded-md border border-slate-200 transition-colors"
                    >
                      {quickComp}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleFetchAISuggestions}
                    disabled={isLoading || !componentInput.trim()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang phân tích dữ liệu lịch sử & tiêu chuẩn...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        Phân Tích & Gợi Ý Rủi Ro Bằng AI
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Suggestions Results */}
              {aiSuggestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Gợi ý rủi ro ({aiSuggestions.length} hạng mục tìm thấy):
                    </span>
                    <span className="text-xs text-slate-500">Chọn các mục bạn muốn thêm vào bảng đánh giá</span>
                  </div>

                  <div className="space-y-3">
                    {aiSuggestions.map((item, idx) => {
                      const rpn = calculateRPN(item.recommendedS, item.recommendedO, item.recommendedD);
                      const risk = evaluateRPNRisk(rpn, item.recommendedS);

                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedItems(prev => ({ ...prev, [idx]: !prev[idx] }))}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            selectedItems[idx]
                              ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 shrink-0 ${
                                  selectedItems[idx]
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {selectedItems[idx] && <Check className="w-3.5 h-3.5" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
                                    {item.componentName || componentInput}
                                  </span>
                                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                                    Vấn đề: {item.riskIssue}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${risk.badgeClass}`}>
                                    RPN: {rpn} ({risk.label})
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 mb-1">
                                  {item.failureMode}
                                </h4>
                                <p className="text-xs text-slate-600 mb-2">
                                  <strong className="text-slate-800">Nguyên nhân:</strong> {item.cause}
                                </p>
                                <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs">
                                  <strong>Đề xuất đối sách:</strong> {item.action}
                                </div>
                              </div>
                            </div>

                            {/* S, O, D Badges */}
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <div className="flex items-center gap-1 text-xs font-mono font-bold">
                                <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded-sm">S:{item.recommendedS}</span>
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-sm">O:{item.recommendedO}</span>
                                <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-sm">D:{item.recommendedD}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleImportAISuggestions}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm Các Mục Đã Chọn Vào Bảng FMEA
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Historical library section */
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Tìm kiếm rủi ro trong thư viện lịch sử..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-3">
                {filteredHistory.map((item) => {
                  const rpn = calculateRPN(item.defaultS, item.defaultO, item.defaultD);
                  const risk = evaluateRPNRisk(rpn, item.defaultS);

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex items-start justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                            {item.componentName}
                          </span>
                          <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            {item.riskIssue}
                          </span>
                          {item.sampleProduct && (
                            <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                              Mẫu: {item.sampleProduct}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${risk.badgeClass}`}>
                            RPN: {rpn}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">{item.failureMode}</h4>
                        <p className="text-xs text-slate-600 mb-2">
                          <strong>Nguyên nhân:</strong> {item.cause}
                        </p>
                        <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                          <strong>Đối sách chuẩn:</strong> {item.suggestedAction}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center gap-1 text-xs font-mono font-bold">
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded-sm">S:{item.defaultS}</span>
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-sm">O:{item.defaultO}</span>
                          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-sm">D:{item.defaultD}</span>
                        </div>
                        <button
                          onClick={() => handleImportHistoryItem(item)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Thêm
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Hệ thống tự động đồng bộ thang điểm S-O-D và tính điểm RPN theo tiêu chuẩn</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
