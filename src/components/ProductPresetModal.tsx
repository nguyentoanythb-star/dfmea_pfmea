import React, { useState } from 'react';
import { 
  X, Check, Wind, Refrigerator, Tv, Fan, 
  CookingPot, Droplets, Flame, Wrench, ShieldCheck, 
  Sparkles, Layers, ArrowRight, Info, AlertTriangle, 
  FileSpreadsheet, Cpu, Factory
} from 'lucide-react';
import { ProductCategory, FMEAType, FMEADocument, FMEAItem } from '../types';
import { CATEGORY_INFO } from '../data/criteriaData';
import { 
  PRODUCT_PRESETS, 
  ProductPreset, 
  getPresetsByCategory, 
  convertPresetItemsToFMEAItems 
} from '../data/productPresetsData';

interface ProductPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCategory: ProductCategory;
  currentFMEAType: FMEAType;
  onSelectPreset: (
    preset: ProductPreset,
    fmeaType: FMEAType,
    mode: 'replace' | 'append'
  ) => void;
}

export const ProductPresetModal: React.FC<ProductPresetModalProps> = ({
  isOpen,
  onClose,
  currentCategory,
  currentFMEAType,
  onSelectPreset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(currentCategory);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    const list = getPresetsByCategory(currentCategory);
    return list[0]?.id || PRODUCT_PRESETS[0].id;
  });
  const [targetFMEAType, setTargetFMEAType] = useState<FMEAType>(currentFMEAType);
  const [applyMode, setApplyMode] = useState<'replace' | 'append'>('replace');

  // Sync selectedCategory and preset if currentCategory changed externally
  React.useEffect(() => {
    if (isOpen) {
      setSelectedCategory(currentCategory);
      setTargetFMEAType(currentFMEAType);
      const list = getPresetsByCategory(currentCategory);
      if (list.length > 0) {
        setSelectedPresetId(list[0].id);
      }
    }
  }, [isOpen, currentCategory, currentFMEAType]);

  if (!isOpen) return null;

  const categoryPresets = getPresetsByCategory(selectedCategory);
  const activePreset = PRODUCT_PRESETS.find(p => p.id === selectedPresetId) || categoryPresets[0] || PRODUCT_PRESETS[0];

  const itemsToShow = targetFMEAType === 'DFMEA' ? activePreset.dfmeaItems : activePreset.pfmeaItems;
  const phaseToShow = targetFMEAType === 'DFMEA' ? activePreset.dfmeaPhase : activePreset.pfmeaPhase;
  const supplierToShow = targetFMEAType === 'DFMEA' ? activePreset.dfmeaSupplier : activePreset.pfmeaSupplier;

  const handleApply = () => {
    onSelectPreset(activePreset, targetFMEAType, applyMode);
    onClose();
  };

  const renderProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wind': return <Wind className="w-5 h-5 text-sky-600" />;
      case 'Refrigerator': return <Refrigerator className="w-5 h-5 text-blue-600" />;
      case 'Tv': return <Tv className="w-5 h-5 text-indigo-600" />;
      case 'Fan': return <Fan className="w-5 h-5 text-teal-600" />;
      case 'CookingPot': return <CookingPot className="w-5 h-5 text-amber-600" />;
      case 'Droplets': return <Droplets className="w-5 h-5 text-cyan-600" />;
      case 'Flame': return <Flame className="w-5 h-5 text-rose-600" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      default: return <Cpu className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] max-h-[820px] flex flex-col overflow-hidden text-slate-800">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                <span>Chọn Sản Phẩm Đặc Trưng & Mẫu FMEA</span>
                <span className="text-[10px] bg-indigo-500/50 text-indigo-200 px-2 py-0.5 rounded font-mono font-semibold">
                  Chuẩn AIAG-VDA
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Chọn ngành hàng, chọn sản phẩm tiêu biểu và tải mẫu phân tích rủi ro thực tế cho Thiết kế (DFMEA) hoặc Sản xuất (PFMEA)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs (Ngành sản phẩm) */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 pt-2 shrink-0 flex overflow-x-auto gap-1">
          {(Object.keys(CATEGORY_INFO) as ProductCategory[]).map((catKey) => {
            const isSelected = selectedCategory === catKey;
            const count = getPresetsByCategory(catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => {
                  setSelectedCategory(catKey);
                  const list = getPresetsByCategory(catKey);
                  if (list.length > 0) {
                    setSelectedPresetId(list[0].id);
                  }
                }}
                className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 border-t border-x shrink-0 ${
                  isSelected
                    ? 'bg-white border-slate-200 text-indigo-700 shadow-2xs -mb-px'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>{CATEGORY_INFO[catKey].label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                  isSelected ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Body: Left product list + Right detailed preview */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Column: List of characteristic products */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 p-3 overflow-y-auto shrink-0 flex flex-col gap-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Sản phẩm đặc trưng ({categoryPresets.length})
            </div>

            {categoryPresets.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Chưa có sản phẩm mẫu trong ngành này.
              </div>
            ) : (
              categoryPresets.map((preset) => {
                const isSelected = preset.id === activePreset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-indigo-600 shadow-xs ring-1 ring-indigo-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-md bg-slate-100 shrink-0 mt-0.5">
                        {renderProductIcon(preset.iconName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {preset.name}
                          </h4>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-indigo-600 font-semibold mt-0.5">
                          {preset.code}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                          {preset.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                          <span>DFMEA: <strong>{preset.dfmeaItems.length} mục</strong></span>
                          <span>•</span>
                          <span>PFMEA: <strong>{preset.pfmeaItems.length} mục</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed Preview & FMEA Type Switcher */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden min-h-0 bg-white">
            {/* Top Bar: Product Banner & DFMEA vs PFMEA Switcher */}
            <div className="pb-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {activePreset.name}
                  </h3>
                  <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold rounded">
                    {activePreset.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activePreset.description}
                </p>
              </div>

              {/* Crucial DFMEA vs PFMEA Selector */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setTargetFMEAType('DFMEA')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                    targetFMEAType === 'DFMEA'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>DFMEA (Thiết Kế)</span>
                </button>
                <button
                  onClick={() => setTargetFMEAType('PFMEA')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                    targetFMEAType === 'PFMEA'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Factory className="w-3.5 h-3.5" />
                  <span>PFMEA (Sản Xuất Mẫu)</span>
                </button>
              </div>
            </div>

            {/* Explanatory Notice: Highlighting Difference between DFMEA and PFMEA */}
            <div className="my-2.5 p-2.5 rounded-lg border text-xs shrink-0 flex items-start gap-2.5 leading-relaxed bg-indigo-50/60 border-indigo-100">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                {targetFMEAType === 'DFMEA' ? (
                  <p className="text-slate-700">
                    <strong className="text-indigo-900">DFMEA (Design FMEA):</strong> Phân tích lỗi thiết kế chi tiết kết cấu, tính toán nhiệt/điện, dung sai lắp ghép, tính chất vật liệu và độ bền trong quá trình người dùng sử dụng.
                  </p>
                ) : (
                  <p className="text-slate-700">
                    <strong className="text-indigo-900">PFMEA (Process FMEA):</strong> Phân tích lỗi tại các công đoạn sản xuất (hàn, nạp gas, dập gân, siết lực bu-lông, đúc bọt xốp, kiểm tra cao áp), sai sót thao tác công nhân và hiệu chuẩn thiết bị gá lắp (jig/fixture).
                  </p>
                )}
                <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                  <span>Giai đoạn đề xuất: <strong className="text-slate-700">{phaseToShow}</strong></span>
                  <span>Đơn vị phụ trách: <strong className="text-slate-700">{supplierToShow}</strong></span>
                </div>
              </div>
            </div>

            {/* Items Table Preview */}
            <div className="flex-1 overflow-auto border border-slate-200 rounded-lg min-h-0 bg-slate-50/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 z-10">
                  <tr>
                    <th className="py-2 px-2 text-center w-8">#</th>
                    <th className="py-2 px-2.5 w-44">
                      {targetFMEAType === 'DFMEA' ? 'Bộ phận / Chi tiết' : 'Công đoạn sản xuất'}
                    </th>
                    <th className="py-2 px-2.5 min-w-[180px]">Sai lỗi tiềm ẩn (Failure Mode)</th>
                    <th className="py-2 px-2.5 min-w-[180px]">Nguyên nhân gốc rễ</th>
                    <th className="py-2 px-1 text-center w-8 text-rose-700">S</th>
                    <th className="py-2 px-1 text-center w-8 text-amber-700">O</th>
                    <th className="py-2 px-1 text-center w-8 text-indigo-700">D</th>
                    <th className="py-2 px-1.5 text-center w-12 font-extrabold text-slate-900">RPN</th>
                    <th className="py-2 px-2.5 min-w-[200px]">Đối sách cải tiến kỹ thuật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {itemsToShow.map((item, idx) => {
                    const rpn = item.S * item.O * item.D;
                    const isHigh = rpn >= 100 || item.S >= 8;
                    return (
                      <tr key={idx} className={`hover:bg-indigo-50/40 transition-colors ${isHigh ? 'bg-rose-50/20' : ''}`}>
                        <td className="py-2 px-2 text-center font-mono text-slate-400 text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-2.5 font-bold text-slate-800">
                          <div>{item.componentName}</div>
                          <div className="text-[10px] font-normal text-slate-500">{item.riskIssue}</div>
                        </td>
                        <td className="py-2 px-2.5 text-slate-700 font-medium">
                          {item.failureMode}
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 text-[11px]">
                          {item.cause}
                        </td>
                        <td className="py-2 px-1 text-center font-bold text-rose-700">{item.S}</td>
                        <td className="py-2 px-1 text-center font-bold text-amber-700">{item.O}</td>
                        <td className="py-2 px-1 text-center font-bold text-indigo-700">{item.D}</td>
                        <td className="py-2 px-1.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-xs ${
                            rpn >= 80 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {rpn}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-slate-700 text-[11px] leading-snug">
                          {item.action}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Action Controls */}
            <div className="pt-3 mt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Option: Replace table vs Append to table */}
              <div className="flex items-center gap-3 text-xs">
                <span className="font-semibold text-slate-700">Tùy chọn tải:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="applyMode"
                    value="replace"
                    checked={applyMode === 'replace'}
                    onChange={() => setApplyMode('replace')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Thay thế toàn bộ bảng hiện tại</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="applyMode"
                    value="append"
                    checked={applyMode === 'append'}
                    onChange={() => setApplyMode('append')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Nối thêm {itemsToShow.length} dòng vào bảng</span>
                </label>
              </div>

              {/* Submit / Apply Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={handleApply}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Áp Dụng Mẫu "{activePreset.name}" ({targetFMEAType})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
