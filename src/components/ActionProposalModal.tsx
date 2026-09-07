import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Loader2, TrendingDown, ShieldAlert, ArrowRight, BookOpen } from 'lucide-react';
import { FMEAItem, ProductCategory } from '../types';
import { calculateRPN } from '../data/criteriaData';
import { getStoredApiKey } from '../utils/apiKeyStorage';

interface ActionProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FMEAItem | null;
  category: ProductCategory;
  onApplyAction: (itemId: string, action: string, sAfter?: number, oAfter?: number, dAfter?: number) => void;
}

export const ActionProposalModal: React.FC<ActionProposalModalProps> = ({
  isOpen,
  onClose,
  item,
  category,
  onApplyAction,
}) => {
  const [actionText, setActionText] = useState('');
  const [sAfter, setSAfter] = useState<number>(1);
  const [oAfter, setOAfter] = useState<number>(1);
  const [dAfter, setDAfter] = useState<number>(1);
  const [justification, setJustification] = useState('');
  const [source, setSource] = useState<'gemini-ai' | 'historical-knowledge-base' | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (item && isOpen) {
      setActionText(item.action || '');
      setSAfter(item.sAfter || item.S);
      setOAfter(item.oAfter || Math.max(1, Math.floor(item.O / 2)));
      setDAfter(item.dAfter || Math.max(1, Math.floor(item.D / 2)));
      setJustification('');
      setSource('');
      generateAction();
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const currentRpn = item.rpn;
  const newRpn = calculateRPN(sAfter, oAfter, dAfter);
  const reductionPercent = currentRpn > 0 ? Math.round(((currentRpn - newRpn) / currentRpn) * 100) : 0;

  const generateAction = async () => {
    setIsLoading(true);
    try {
      const storedKey = getStoredApiKey();
      const res = await fetch('/api/fmea/suggest-action', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(storedKey ? { 'x-gemini-api-key': storedKey } : {})
        },
        body: JSON.stringify({
          category,
          componentName: item.componentName,
          failureMode: item.failureMode,
          cause: item.cause,
          S: item.S,
          O: item.O,
          D: item.D,
        }),
      });

      const data = await res.json();
      if (data.action) {
        setActionText(data.action);
        if (data.recommendedSAfter) setSAfter(data.recommendedSAfter);
        if (data.recommendedOAfter) setOAfter(data.recommendedOAfter);
        if (data.recommendedDAfter) setDAfter(data.recommendedDAfter);
        if (data.justification) setJustification(data.justification);
        if (data.source) setSource(data.source);
      }
    } catch (err) {
      console.warn('Could not fetch action from server, keeping local default:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    onApplyAction(item.id, actionText, sAfter, oAfter, dAfter);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Sleek Header */}
        <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Đề Xuất Đối Sách Kỹ Thuật</h2>
              <p className="text-xs text-indigo-100">Áp dụng nguyên lý Poka-Yoke & tiêu chuẩn AIAG-VDA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-indigo-500 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Current Failure Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                {item.componentName} [{item.riskIssue}]
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-500">
                  S:{item.S} × O:{item.O} × D:{item.D}
                </span>
                <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                  RPN ban đầu: {currentRpn}
                </span>
              </div>
            </div>
            <div>
              <strong className="text-slate-800">Sai lỗi tiềm ẩn:</strong> {item.failureMode}
            </div>
            <div>
              <strong className="text-slate-800">Nguyên nhân gốc rễ:</strong> {item.cause}
            </div>
          </div>

          {/* Action text input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Đối sách / Giải pháp cải tiến kỹ thuật:</span>
                {source === 'gemini-ai' && (
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded">
                    Gemini AI
                  </span>
                )}
                {source === 'historical-knowledge-base' && (
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                    <BookOpen className="w-3 h-3" />
                    Thư viện FMEA chuẩn
                  </span>
                )}
              </label>
              <button
                onClick={generateAction}
                disabled={isLoading}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                <span>Tạo lại đề xuất</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={actionText}
              onChange={(e) => setActionText(e.target.value)}
              placeholder="Đang phân tích đối sách tối ưu..."
              className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-hidden leading-relaxed"
            />
            {justification && (
              <p className="text-[11px] text-slate-500 italic mt-1">
                Lý giải: {justification}
              </p>
            )}
          </div>

          {/* S', O', D' post action evaluation */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                Dự kiến chỉ số RPN sau khi áp dụng đối sách:
              </span>
              <div className="flex items-center gap-1.5 font-bold font-mono text-xs text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-300">
                <span>RPN mới: {newRpn}</span>
                {reductionPercent > 0 && (
                  <span className="text-emerald-600">(-{reductionPercent}%)</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Mức độ nghiêm trọng (S')
                </label>
                <select
                  value={sAfter}
                  onChange={(e) => setSAfter(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-md p-1.5 text-xs font-bold text-slate-800"
                >
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(v => (
                    <option key={v} value={v}>S' = {v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Mức độ xuất hiện (O')
                </label>
                <select
                  value={oAfter}
                  onChange={(e) => setOAfter(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-md p-1.5 text-xs font-bold text-emerald-800"
                >
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(v => (
                    <option key={v} value={v}>O' = {v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Khả năng phát hiện (D')
                </label>
                <select
                  value={dAfter}
                  onChange={(e) => setDAfter(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-md p-1.5 text-xs font-bold text-indigo-800"
                >
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(v => (
                    <option key={v} value={v}>D' = {v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-4 h-4" />
            Cập Nhật Đối Sách Vào Hạng Mục
          </button>
        </div>
      </div>
    </div>
  );
};
