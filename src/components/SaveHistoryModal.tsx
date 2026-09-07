import React, { useState, useEffect } from 'react';
import { BookmarkPlus, X, Check, Save, Layers, AlertCircle } from 'lucide-react';
import { FMEADocument } from '../types';

interface SaveHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: FMEADocument;
  onSave: (title: string, note: string) => void;
}

export const SaveHistoryModal: React.FC<SaveHistoryModalProps> = ({
  isOpen,
  onClose,
  document,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(`${document.productName} (${document.productCode || 'N/A'} • ${document.fmeaType})`);
      setNote('');
    }
  }, [isOpen, document]);

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), note.trim());
    onClose();
  };

  const highRiskCount = document.items.filter(i => (i.rpn >= 100 || i.S >= 8)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 bg-indigo-600 text-white flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="w-5 h-5 text-amber-300" />
            <h2 className="text-sm font-bold">Lưu Hồ Sơ FMEA Vào Lịch Sử</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-indigo-200 hover:text-white rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="p-5 space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg space-y-1">
            <div className="font-semibold text-indigo-900">
              Bản ghi hiện tại gồm: <strong className="text-indigo-700">{document.items.length} mục phân tích</strong>
              {highRiskCount > 0 && <span className="text-rose-600 font-bold"> ({highRiskCount} cảnh báo rủi ro)</span>}
            </div>
            <p className="text-[11px] text-indigo-700">
              Bản lưu sẽ được đưa vào danh sách lịch sử ở thanh bên trái để bạn có thể mở lại hoặc tái sử dụng bất kỳ lúc nào.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Tên gợi nhớ bản lưu: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Điều hòa Inverter 12000 BTU - Đợt thử nghiệm 1"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Ghi chú triển khai (Tùy chọn):
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Đã duyệt đối sách bộ phận động cơ, chuẩn bị sang giai đoạn PV..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Xác nhận lưu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
