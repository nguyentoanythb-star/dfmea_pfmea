import React, { useState } from 'react';
import { X, ShieldAlert, Activity, Search, HelpCircle } from 'lucide-react';
import { SEVERITY_CRITERIA, OCCURRENCE_CRITERIA, DETECTION_CRITERIA } from '../data/criteriaData';

interface CriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'S' | 'O' | 'D';
}

export const CriteriaModal: React.FC<CriteriaModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'S',
}) => {
  const [activeTab, setActiveTab] = useState<'S' | 'O' | 'D'>(defaultTab);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const currentList = activeTab === 'S' 
    ? SEVERITY_CRITERIA 
    : activeTab === 'O' 
    ? OCCURRENCE_CRITERIA 
    : DETECTION_CRITERIA;

  const filtered = currentList.filter(item => 
    item.effect.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.level.toString().includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Bảng Tiêu Chuẩn Đánh Giá Chỉ Số FMEA (AIAG-VDA)</h2>
              <p className="text-xs text-slate-300">Chuẩn hóa thang điểm S (Mức độ nghiêm trọng), O (Mức độ xuất hiện), D (Khả năng phát hiện)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs & Search */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('S')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'S'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Bảng Mức độ nghiêm trọng (S)
            </button>
            <button
              onClick={() => setActiveTab('O')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'O'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Bảng Mức độ xuất hiện (O)
            </button>
            <button
              onClick={() => setActiveTab('D')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'D'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Bảng Khả năng phát hiện (D)
            </button>
          </div>

          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm cấp độ, từ khóa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <div className="text-xs text-slate-500 italic mb-2">
            {activeTab === 'S' && 'Đánh giá mức độ nghiêm trọng của hậu quả lỗi đối với người vận hành, khách hàng hoặc môi trường xung quanh (thang 1 - 10).'}
            {activeTab === 'O' && 'Đánh giá tần suất hoặc xác suất xuất hiện của nguyên nhân sai hỏng trong vòng đời sản phẩm (thang 1 - 10).'}
            {activeTab === 'D' && 'Đánh giá khả năng của phương pháp kiểm soát thiết kế / thử nghiệm phát hiện ra nguyên nhân sai hỏng trước khi xuất xưởng (thang 1 - 10, điểm càng thấp càng tốt).'}
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            {filtered.map((item) => (
              <div
                key={item.level}
                className="p-3.5 flex items-start gap-4 hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-sm ${
                    item.level >= 8
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : item.level >= 5
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}
                >
                  {item.level}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{item.effect}</span>
                    {item.extraInfo && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        {item.extraInfo}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Công thức: RPN = S × O × D (Điểm từ 1 đến 1000)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium transition-colors"
          >
            Đóng bảng tra cứu
          </button>
        </div>
      </div>
    </div>
  );
};
