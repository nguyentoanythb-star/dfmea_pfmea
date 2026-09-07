import React, { useState } from 'react';
import { 
  Clock, CheckCircle2, AlertTriangle, User, Calendar, 
  Search, Sparkles, TrendingDown, Filter 
} from 'lucide-react';
import { FMEAItem, ActionStatus } from '../types';
import { calculateRPN, evaluateRPNRisk } from '../data/criteriaData';

interface ProgressTrackerProps {
  items: FMEAItem[];
  onUpdateItem: (itemId: string, updates: Partial<FMEAItem>) => void;
  onSuggestAction: (item: FMEAItem) => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  items,
  onUpdateItem,
  onSuggestAction,
}) => {
  const [selectedPic, setSelectedPic] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const pics = Array.from(new Set(items.map(i => i.pic).filter(Boolean)));
  const todayStr = new Date().toISOString().slice(0, 10);

  const total = items.length;
  const completedCount = items.filter(i => i.status === 'completed').length;
  const inProgressCount = items.filter(i => i.status === 'in_progress').length;
  const underReviewCount = items.filter(i => i.status === 'under_review').length;
  const pendingCount = items.filter(i => i.status === 'pending' || !i.status).length;
  
  const overdueItems = items.filter(i => 
    i.dueDate && i.dueDate < todayStr && i.status !== 'completed'
  );
  const overdueCount = overdueItems.length;

  const highRiskItems = items.filter(i => i.rpn >= 100 || i.S >= 8);
  const highRiskCompleted = highRiskItems.filter(i => i.status === 'completed').length;

  const filteredItems = items.filter(item => {
    const matchPic = selectedPic === 'all' || item.pic === selectedPic;
    const isOverdue = item.dueDate && item.dueDate < todayStr && item.status !== 'completed';
    const matchStatus = selectedStatus === 'all' 
      ? true 
      : selectedStatus === 'overdue' 
      ? isOverdue 
      : item.status === selectedStatus;
    const matchSearch = searchQuery 
      ? item.componentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.failureMode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.pic || '').toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchPic && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Metric Cards matching Sleek Interface with border-l-4 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-indigo-500">
          <div className="text-xs text-slate-500 font-medium">Tổng số rủi ro & nhiệm vụ</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">
            {total} <span className="text-xs font-normal text-slate-400 ml-1 italic">(100% hạng mục FMEA)</span>
          </div>
        </div>

        {/* Card 2: High RPN alerts */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-red-500">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>High RPN Alerts (&gt;100 hoặc S≥8)</span>
            {overdueCount > 0 && (
              <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.2 rounded font-bold">
                {overdueCount} quá hạn
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {highRiskItems.length < 10 ? `0${highRiskItems.length}` : highRiskItems.length}
          </div>
        </div>

        {/* Card 3: Completed actions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-emerald-500">
          <div className="text-xs text-slate-500 font-medium">Hành động hoàn tất</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {completedCount} / {total}
            <span className="text-xs font-normal text-slate-400 ml-2 font-mono">
              ({total ? Math.round((completedCount / total) * 100) : 0}%)
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* PIC Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase">P.I.C:</span>
            <select
              value={selectedPic}
              onChange={(e) => setSelectedPic(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tất cả ({pics.length} người)</option>
              {pics.map(pic => (
                <option key={pic} value={pic}>{pic}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Trạng thái:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tất cả ({total})</option>
              <option value="pending">Chưa bắt đầu ({pendingCount})</option>
              <option value="in_progress">Đang xử lý ({inProgressCount})</option>
              <option value="under_review">Chờ kiểm tra ({underReviewCount})</option>
              <option value="completed">Hoàn thành ({completedCount})</option>
              <option value="overdue">Quá hạn ({overdueCount})</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo chi tiết, đối sách, PIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Task List styled sleekly */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">
            Danh sách đầu việc & Tiến độ triển khai
          </h3>
          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
            {filteredItems.length} hạng mục
          </span>
        </div>

        <div className="divide-y divide-slate-100 p-4 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 italic text-xs">
              Không tìm thấy vấn đề nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isOverdue = item.dueDate && item.dueDate < todayStr && item.status !== 'completed';
              const isHigh = item.rpn >= 100 || item.S >= 8;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isOverdue 
                      ? 'border-red-300 bg-red-50/15' 
                      : item.status === 'completed'
                      ? 'border-emerald-200 bg-emerald-50/10'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          #{item.itemNo}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {item.componentName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          [{item.riskIssue}]
                        </span>
                        {item.rpn >= 100 ? (
                          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold font-mono text-[10px]">
                            RPN: {item.rpn}
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold font-mono text-[10px]">
                            RPN: {item.rpn}
                          </span>
                        )}
                        {isOverdue && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-600 text-white font-bold animate-pulse">
                            Quá hạn
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-semibold text-slate-900 mb-1">
                        {item.failureMode}
                      </div>
                      <div className="text-[11px] text-slate-600 mb-2">
                        <strong>Nguyên nhân:</strong> {item.cause}
                      </div>

                      {/* Inputs for Action & Result */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded text-xs">
                          <div className="font-semibold text-slate-700 flex items-center justify-between mb-1">
                            <span className="text-[11px]">Đối sách cải tiến:</span>
                            <button
                              onClick={() => onSuggestAction(item)}
                              className="text-indigo-600 hover:text-indigo-800 text-[10px] font-semibold flex items-center gap-0.5"
                            >
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              Gợi ý AI
                            </button>
                          </div>
                          <input
                            type="text"
                            value={item.action || ''}
                            placeholder="Nhập đối sách khắc phục..."
                            onChange={(e) => onUpdateItem(item.id, { action: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="p-2 bg-slate-50 border border-slate-200 rounded text-xs">
                          <div className="font-semibold text-slate-700 mb-1 text-[11px]">
                            Kết quả xác minh & Ghi chú:
                          </div>
                          <input
                            type="text"
                            value={item.result || ''}
                            placeholder="VD: Đã test đạt chuẩn, khuôn mới..."
                            onChange={(e) => onUpdateItem(item.id, { result: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Meta Controls */}
                    <div className="flex flex-wrap lg:flex-col items-start lg:items-end justify-between gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {/* Status Selector */}
                      <select
                        value={item.status || 'pending'}
                        onChange={(e) => onUpdateItem(item.id, { status: e.target.value as ActionStatus })}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md border focus:outline-hidden cursor-pointer ${
                          item.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'in_progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : item.status === 'under_review'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <option value="pending">Chưa bắt đầu</option>
                        <option value="in_progress">Đang xử lý</option>
                        <option value="under_review">Chờ kiểm tra</option>
                        <option value="completed">Hoàn thành</option>
                      </select>

                      {/* PIC */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-[11px]">P.I.C:</span>
                        <input
                          type="text"
                          value={item.pic || ''}
                          placeholder="Người phụ trách"
                          onChange={(e) => onUpdateItem(item.id, { pic: e.target.value })}
                          className="w-28 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold text-slate-800"
                        />
                      </div>

                      {/* Dates */}
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px]">Hạn chót:</span>
                          <input
                            type="date"
                            value={item.dueDate || ''}
                            onChange={(e) => onUpdateItem(item.id, { dueDate: e.target.value })}
                            className={`border rounded px-1 py-0.5 text-[11px] ${
                              isOverdue ? 'border-red-400 bg-red-50 text-red-700 font-bold' : 'border-slate-200 bg-slate-50'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
