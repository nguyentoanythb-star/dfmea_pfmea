import React, { useState, useEffect } from 'react';
import { 
  Key, X, CheckCircle2, AlertCircle, Eye, EyeOff, 
  ExternalLink, Loader2, ShieldCheck, Trash2, Sparkles, RefreshCw
} from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, removeStoredApiKey, maskApiKey } from '../utils/apiKeyStorage';

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const APIKeyModal: React.FC<APIKeyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{
    type: 'success' | 'error' | 'idle';
    message: string;
  }>({ type: 'idle', message: '' });

  const currentStoredKey = getStoredApiKey();

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(currentStoredKey);
      setVerifyStatus({ type: 'idle', message: '' });
      setShowKey(false);
    }
  }, [isOpen, currentStoredKey]);

  if (!isOpen) return null;

  const handleVerify = async () => {
    const keyToTest = apiKeyInput.trim();
    if (!keyToTest) {
      setVerifyStatus({
        type: 'error',
        message: 'Vui lòng nhập API Key trước khi kiểm tra kết nối.',
      });
      return;
    }

    setIsVerifying(true);
    setVerifyStatus({ type: 'idle', message: '' });

    try {
      const res = await fetch('/api/fmea/verify-key', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-api-key': keyToTest,
        },
        body: JSON.stringify({ apiKey: keyToTest }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVerifyStatus({
          type: 'success',
          message: data.message || 'Kết nối thành công! API Key của bạn sẵn sàng sử dụng.',
        });
      } else {
        setVerifyStatus({
          type: 'error',
          message: data.message || 'API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại trên Google AI Studio.',
        });
      }
    } catch (err: any) {
      setVerifyStatus({
        type: 'error',
        message: `Lỗi kết nối máy chủ: ${err?.message || 'Không thể liên lạc'}`,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = () => {
    const trimmed = apiKeyInput.trim();
    setStoredApiKey(trimmed);
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleRemove = () => {
    removeStoredApiKey();
    setApiKeyInput('');
    setVerifyStatus({
      type: 'idle',
      message: '',
    });
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-indigo-600 text-white flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-indigo-500 rounded-lg">
              <Key className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold leading-tight">
                Cài đặt Google Gemini API Key
              </h2>
              <p className="text-[11px] text-indigo-100 mt-0.5">
                Điền API Key của bạn để sử dụng toàn bộ tính năng gợi ý AI thông minh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-indigo-500 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          {/* Status Indicator */}
          <div className="flex items-center justify-between p-2.5 rounded-lg border bg-slate-50 border-slate-200">
            <span className="font-semibold text-slate-600">Trạng thái API Key hiện tại:</span>
            {currentStoredKey ? (
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã lưu: {maskApiKey(currentStoredKey)}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Chưa cài đặt (Dùng mặc định/Fallback)</span>
              </span>
            )}
          </div>

          {/* Key Input Section */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Nhập mã API Key Gemini của bạn:
            </label>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setVerifyStatus({ type: 'idle', message: '' });
                }}
                placeholder="Ví dụ: AIzaSyA... (bắt đầu bằng AIzaSy)"
                className="w-full font-mono text-xs px-3.5 py-2.5 pr-20 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
              <div className="absolute right-2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
                  title={showKey ? 'Ẩn khóa' : 'Hiện khóa'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Khóa API được lưu cục bộ trong trình duyệt (Local Storage), hoàn toàn bảo mật và riêng tư.
            </p>
          </div>

          {/* Verification Status Alert */}
          {verifyStatus.type !== 'idle' && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs animate-in fade-in duration-200 ${
                verifyStatus.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {verifyStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed font-medium">
                {verifyStatus.message}
              </div>
            </div>
          )}

          {/* Guide to get API Key */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs space-y-1.5 text-indigo-900">
            <div className="font-bold flex items-center gap-1.5 text-indigo-800">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Chưa có Google Gemini API Key?</span>
            </div>
            <p className="text-[11px] text-indigo-700 leading-normal">
              Bạn có thể tạo mã API Key hoàn toàn miễn phí chỉ trong 30 giây từ Google AI Studio:
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline pt-0.5"
            >
              <span>Lấy API Key tại aistudio.google.com/app/apikey</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Security Guarantee */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Mã bảo mật chỉ dùng để truy vấn AI đề xuất phân tích FMEA, không chia sẻ cho bên thứ ba.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            {currentStoredKey && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg font-medium text-xs transition-colors"
                title="Xóa API Key đã lưu"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Key</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || !apiKeyInput.trim()}
              className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Đang thử...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Kiểm tra kết nối</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lưu API Key</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
