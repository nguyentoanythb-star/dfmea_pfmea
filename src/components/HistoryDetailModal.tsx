import React, { useState } from 'react';
import { 
  X, History, RotateCcw, PlusCircle, AlertTriangle, 
  Layers, ArrowRight, Trash2
} from 'lucide-react';
import { HistoricalDeployment } from '../types';
import { CATEGORY_INFO, evaluateRPNRisk } from '../data/criteriaData';

interface HistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deployment: HistoricalDeployment | null;
  onLoadReplace: (deployment: HistoricalDeployment) => void;
  onLoadAppend: (deployment: HistoricalDeployment) => void;
  onDelete?: (id: string) => void;
}

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({
  isOpen,
  onClose,
  deployment,
  onLoadReplace,
  onLoadAppend,
  onDelete,
}) => {
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  if (!isOpen || !deployment) return null;

  const doc = deployment.documentSnapshot;
  const items = doc.items || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-lg text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  deployment.fmeaType === 'DFMEA'
                    ? 'bg-blue-600 text-white'
                    : 'bg-purple-600 text-white'
                }`}>
                  {deployment.fmeaType}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                  {deployment.title}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {CATEGORY_INFO[deployment.category]?.label} • Lưu lúc: {deployment.savedAt}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Snapshot Summary Info Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4 text-slate-700">
            <div>
              <span className="text-slate-400">Sản phẩm:</span>{' '}
              <strong className="font-semibold">{deployment.productName}</strong> ({deployment.productCode || 'N/A'})
            </div>
            <div>
              <span className="text-slate-400">Giai đoạn:</span>{' '}
              <span className="font-medium text-slate-800">{deployment.phase}</span>
            </div>
            <div>
              <span className="text-slate-400">Số mục phân tích:</span>{' '}
              <strong className="text-indigo-600 font-bold">{deployment.itemCount} mục</strong>
            </div>
            {deployment.highRiskCount > 0 && (
              <div className="flex items-center gap-1 text-rose-600 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{deployment.highRiskCount} cảnh báo rủi ro cao</span>
              </div>
            )}
          </div>

          {deployment.note && (
            <div className="text-[11px] text-slate-500 italic bg-white px-2.5 py-1 rounded border border-slate-200 max-w-sm truncate">
              Ghi chú: {deployment.note}
            </div>
          )}
        </div>

        {/* Items Table Preview */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[220px]">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Danh sách các sai lỗi & đối sách đã triển khai ({items.length} dòng):</span>
          </h3>

          <div className="border border-slate-200 rounded-lg overflow-x-auto shadow-2xs">
            <table className="w-full text-xs text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="px-2.5 py-2 w-10 text-center">STT</th>
                  <th className="px-3 py-2 w-48">Bộ phận / Công đoạn</th>
                  <th className="px-3 py-2 w-52">Sai lỗi tiềm ẩn</th>
                  <th className="px-3 py-2 w-48">Nguyên nhân</th>
                  <th className="px-1.5 py-2 w-8 text-center">S</th>
                  <th className="px-1.5 py-2 w-8 text-center">O</th>
                  <th className="px-1.5 py-2 w-8 text-center">D</th>
                  <th className="px-2 py-2 w-14 text-center">RPN</th>
                  <th className="px-3 py-2">Đối sách cải tiến</th>
                  <th className="px-2.5 py-2 w-24 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {items.map((item, idx) => {
                  const risk = evaluateRPNRisk(item.rpn, item.S);
                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors text-[11px]">
                      <td className="px-2.5 py-2 text-center font-mono text-slate-500 font-semibold">{idx + 1}</td>
                      <td className="px-3 py-2 font-semibold text-slate-800">{item.componentName}</td>
                      <td className="px-3 py-2 text-slate-700">{item.failureMode}</td>
                      <td className="px-3 py-2 text-slate-600">{item.cause}</td>
                      <td className="px-1.5 py-2 text-center font-bold text-slate-800">{item.S}</td>
                      <td className="px-1.5 py-2 text-center font-bold text-slate-800">{item.O}</td>
                      <td className="px-1.5 py-2 text-center font-bold text-slate-800">{item.D}</td>
                      <td className="px-2 py-2 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${risk.badgeClass}`}>
                          {item.rpn}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-700 font-medium">{item.action || '—'}</td>
                      <td className="px-2.5 py-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status === 'completed' ? 'Hoàn tất' : item.status === 'in_progress' ? 'Đang xử lý' : 'Chờ xử lý'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            {onDelete && (
              isConfirmDelete ? (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg animate-in fade-in duration-100">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="text-xs text-rose-700 font-semibold">Chắc chắn xóa bản lưu này?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(deployment.id);
                      setIsConfirmDelete(false);
                      onClose();
                    }}
                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold transition-colors cursor-pointer"
                  >
                    Xác nhận xóa
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmDelete(false)}
                    className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-medium transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors border border-rose-200 cursor-pointer"
                  title="Xóa bản lưu này khỏi lịch sử"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa bản lưu</span>
                </button>
              )
            )}
            {!isConfirmDelete && (
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Chọn cách bạn muốn tái sử dụng:
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Đóng
            </button>

            <button
              onClick={() => {
                onLoadAppend(deployment);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              title="Thêm các mục từ bản ghi này vào bảng hiện tại"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Nối thêm vào bảng (+{items.length} mục)</span>
            </button>

            <button
              onClick={() => {
                onLoadReplace(deployment);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              title="Thay thế toàn bộ bảng hiện tại bằng bản lưu lịch sử này"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mở thay thế toàn bộ bảng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
