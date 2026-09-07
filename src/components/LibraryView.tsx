import React, { useState } from 'react';
import { 
  Database, Search, Plus, Filter, Sparkles, Check, 
  ArrowRight, ShieldAlert, Wrench, Droplets, CookingPot, Refrigerator, Fan
} from 'lucide-react';
import { ProductCategory, FMEAItem, HistoricalFailureTemplate } from '../types';
import { HISTORICAL_FAILURE_LIBRARY } from '../data/historicalFMEAData';
import { CATEGORY_INFO, calculateRPN, evaluateRPNRisk } from '../data/criteriaData';

interface LibraryViewProps {
  currentCategory: ProductCategory;
  onImportItem: (item: Partial<FMEAItem>) => void;
  onOpenAISuggestions: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  currentCategory,
  onImportItem,
  onOpenAISuggestions,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>(currentCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [importedIds, setImportedIds] = useState<Record<string, boolean>>({});

  const filteredList = HISTORICAL_FAILURE_LIBRARY.filter(item => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch = searchQuery
      ? item.componentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.failureMode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.cause.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.suggestedAction.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchCat && matchSearch;
  });

  const handleImport = (item: HistoricalFailureTemplate) => {
    onImportItem({
      componentName: item.componentName,
      riskIssue: item.riskIssue,
      failureMode: item.failureMode,
      cause: item.cause,
      currentControl: 'Kiểm soát theo tiêu chuẩn ngành',
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
    });

    setImportedIds(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setImportedIds(prev => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  const getCategoryIcon = (cat: ProductCategory) => {
    switch (cat) {
      case 'dien_gia_dung': return <Fan className="w-4 h-4 text-blue-500" />;
      case 'dien_tu_dien_lanh': return <Refrigerator className="w-4 h-4 text-indigo-500" />;
      case 'thiet_bi_nha_bep': return <CookingPot className="w-4 h-4 text-amber-500" />;
      case 'bon_nuoc': return <Droplets className="w-4 h-4 text-sky-500" />;
      default: return <Wrench className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wider">
              Thư viện rủi ro chuẩn hóa
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Tổng hợp {HISTORICAL_FAILURE_LIBRARY.length} bài học kinh nghiệm
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Thư Viện Bài Học Kinh Nghiệm & Rủi Ro Ngành Hàng
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5 leading-relaxed">
            Tra cứu sai hỏng điển hình từ thiết kế và sản xuất (Điện gia dụng, Điện tử điện lạnh, Thiết bị nhà bếp, Bồn nước...). Nhấp để áp dụng ngay vào hồ sơ FMEA hiện hành.
          </p>
        </div>

        <button
          onClick={onOpenAISuggestions}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Gợi Ý Thêm Bằng AI</span>
        </button>
      </div>

      {/* Filter and Categories Grid */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả danh mục ({HISTORICAL_FAILURE_LIBRARY.length})
          </button>

          {(Object.keys(CATEGORY_INFO) as ProductCategory[]).map((catKey) => {
            const count = HISTORICAL_FAILURE_LIBRARY.filter(i => i.category === catKey).length;
            const isSelected = selectedCategory === catKey;

            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {getCategoryIcon(catKey)}
                <span>{CATEGORY_INFO[catKey].label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo chi tiết, sai lỗi, đối sách..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-200">
            Không tìm thấy bài học rủi ro nào cho từ khóa tìm kiếm.
          </div>
        ) : (
          filteredList.map((item) => {
            const rpn = calculateRPN(item.defaultS, item.defaultO, item.defaultD);
            const risk = evaluateRPNRisk(rpn, item.defaultS);
            const isImported = importedIds[item.id];

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                        {getCategoryIcon(item.category)}
                        {item.componentName}
                      </span>
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {item.riskIssue}
                      </span>
                      {item.sampleProduct && (
                        <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                          {item.sampleProduct}
                        </span>
                      )}
                    </div>

                    <div className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono border ${risk.badgeClass}`}>
                      RPN: {rpn}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                    {item.failureMode}
                  </h3>

                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    <strong className="text-slate-800">Nguyên nhân cốt lõi:</strong> {item.cause}
                  </p>

                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-900 mb-4">
                    <strong className="text-emerald-950 font-bold block mb-0.5">Đối sách cải tiến kỹ thuật:</strong>
                    {item.suggestedAction}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                    <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800" title="Mức độ nghiêm trọng">S: {item.defaultS}</span>
                    <span className="px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800" title="Mức độ xuất hiện">O: {item.defaultO}</span>
                    <span className="px-1.5 py-0.5 rounded-sm bg-indigo-100 text-indigo-800" title="Khả năng phát hiện">D: {item.defaultD}</span>
                  </div>

                  <button
                    onClick={() => handleImport(item)}
                    disabled={isImported}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs ${
                      isImported
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isImported ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Đã thêm vào FMEA
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Thêm vào dự án này
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
