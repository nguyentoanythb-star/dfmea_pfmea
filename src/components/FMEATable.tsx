import React, { useState } from 'react';
import { 
  Plus, Trash2, Sparkles, AlertTriangle, HelpCircle, 
  ArrowUpDown, Search, User, Calendar, Edit3, Check, Filter,
  Columns, Eye, Maximize2, Minimize2, CheckCircle2, Clock,
  ArrowRight, ShieldCheck, FileSpreadsheet, Layers
} from 'lucide-react';
import { FMEAItem, FMEADocument, ActionStatus } from '../types';
import { calculateRPN, evaluateRPNRisk } from '../data/criteriaData';

interface FMEATableProps {
  document: FMEADocument;
  onUpdateItem: (itemId: string, updates: Partial<FMEAItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: () => void;
  onClearAll?: () => void;
  onOpenProductPresets?: () => void;
  onOpenCriteria: (type?: 'S' | 'O' | 'D') => void;
  onSuggestAction: (item: FMEAItem) => void;
  onOpenDocInfo: () => void;
  isHighRiskFilterActive?: boolean;
}

export const FMEATable: React.FC<FMEATableProps> = ({
  document,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onClearAll,
  onOpenProductPresets,
  onOpenCriteria,
  onSuggestAction,
  onOpenDocInfo,
  isHighRiskFilterActive = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [componentFilter, setComponentFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState<string>(isHighRiskFilterActive ? 'CRITICAL' : 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'itemNo' | 'rpn' | 'S'>('itemNo');
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState<'full' | 'compact'>('full');
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Sync if prop changed
  React.useEffect(() => {
    if (isHighRiskFilterActive) {
      setRiskFilter('CRITICAL');
    }
  }, [isHighRiskFilterActive]);

  // Unique component names for filter
  const componentNames = Array.from(new Set(document.items.map(i => i.componentName).filter(Boolean)));

  // Filter and sort items
  const filteredItems = document.items
    .filter(item => {
      const matchComp = componentFilter === 'all' || item.componentName === componentFilter;
      const risk = evaluateRPNRisk(item.rpn, item.S);
      const matchRisk = riskFilter === 'all' 
        ? true 
        : riskFilter === 'CRITICAL' 
        ? (item.rpn >= 100 || item.S >= 8) 
        : risk.level === riskFilter;
      
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
        
      const matchSearch = searchQuery
        ? item.componentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.failureMode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.cause.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.pic || '').toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      return matchComp && matchRisk && matchStatus && matchSearch;
    })
    .sort((a, b) => {
      let valA = a[sortField] || 0;
      let valB = b[sortField] || 0;
      if (typeof valA === 'string') valA = (valA as string).toLowerCase();
      if (typeof valB === 'string') valB = (valB as string).toLowerCase();

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const handleSort = (field: 'itemNo' | 'rpn' | 'S') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleScoreChange = (itemId: string, field: 'S' | 'O' | 'D', value: number) => {
    const item = document.items.find(i => i.id === itemId);
    if (!item) return;

    const newS = field === 'S' ? value : item.S;
    const newO = field === 'O' ? value : item.O;
    const newD = field === 'D' ? value : item.D;
    const newRpn = calculateRPN(newS, newO, newD);
    const conclusion = (newS >= 8 || newRpn >= 40) ? 'Cần cải tiến' : 'Không cải tiến';

    onUpdateItem(itemId, {
      [field]: value,
      rpn: newRpn,
      conclusion,
    });
  };

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
      {/* Sleek Compact Toolbar - Consolidates controls to maximize table space */}
      <div className="bg-slate-50/90 border-b border-slate-200 px-3 py-2 shrink-0 flex flex-wrap items-center justify-between gap-2">
        {/* Left tools: Search, Filters */}
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {/* Search bar */}
          <div className="relative w-52 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm chi tiết, sai lỗi, đối sách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Component Filter */}
          <select
            value={componentFilter}
            onChange={(e) => setComponentFilter(e.target.value)}
            className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-300 rounded-md text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">Tất cả chi tiết ({document.items.length})</option>
            {componentNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          {/* Risk filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-md text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">Tất cả mức độ RPN</option>
            <option value="CRITICAL">🔴 Cảnh báo cao (RPN≥100 hoặc S≥8)</option>
            <option value="MEDIUM">🟡 RPN Trung bình (40-99)</option>
            <option value="LOW">🟢 RPN Thấp (&lt;40)</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-300 rounded-md text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer hidden md:inline-block"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="in_progress">Đang xử lý</option>
            <option value="under_review">Chờ kiểm tra</option>
            <option value="pending">Chưa bắt đầu</option>
          </select>

          {/* View mode toggle (Full vs Compact) */}
          <button
            onClick={() => setViewMode(viewMode === 'full' ? 'compact' : 'full')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors flex items-center gap-1 ${
              viewMode === 'compact'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
            title={viewMode === 'full' ? 'Chuyển sang chế độ thu gọn cột' : 'Chuyển sang chế độ hiển thị đầy đủ 14 cột'}
          >
            <Columns className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">{viewMode === 'full' ? 'Thu Gọn Cột' : 'Đầy Đủ Cột'}</span>
          </button>
        </div>

        {/* Right actions: Item counter, Tra cứu, Mẫu đặc trưng, Xóa toàn bộ, Thêm dòng */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-mono hidden xl:inline">
            Hiển thị <strong>{filteredItems.length}</strong>/{document.items.length} dòng
          </span>

          {/* Mẫu đặc trưng */}
          {onOpenProductPresets && (
            <button
              onClick={onOpenProductPresets}
              className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
              title="Chọn sản phẩm đặc trưng & tải mẫu FMEA (DFMEA / PFMEA)"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Mẫu Đặc Trưng</span>
            </button>
          )}

          {/* Tra cứu S-O-D */}
          <button
            onClick={() => onOpenCriteria()}
            className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 rounded-md transition-colors flex items-center gap-1 shadow-2xs"
            title="Tra cứu tiêu chuẩn chấm điểm S, O, D"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Tra cứu S-O-D</span>
          </button>

          {/* Xóa toàn bộ bảng */}
          {onClearAll && document.items.length > 0 && (
            <button
              onClick={() => setIsConfirmClearOpen(true)}
              className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-300 hover:border-rose-300 rounded-md transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
              title="Xóa toàn bộ các dòng phân tích trong bảng này"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Xóa Toàn Bộ</span>
            </button>
          )}

          <button
            onClick={onAddItem}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Dòng Mới</span>
          </button>
        </div>
      </div>

      {/* Primary Scrollable Spreadsheet Grid - Fills 100% remaining vertical space */}
      <div className="flex-1 min-h-0 overflow-auto relative bg-slate-100/40">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] z-10 select-none shadow-xs border-b border-slate-200">
            <tr>
              {/* TT */}
              <th 
                onClick={() => handleSort('itemNo')}
                className="py-2.5 px-2 text-center w-10 cursor-pointer hover:bg-slate-200 transition-colors border-r border-slate-200"
                title="Số thứ tự - Nhấp để sắp xếp"
              >
                <div className="flex items-center justify-center gap-0.5">
                  <span>TT</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>

              {/* Chi tiết / Chức năng */}
              <th className="py-2.5 px-3 w-44 border-r border-slate-200">
                Chi tiết / Chức năng
              </th>

              {/* Sai lỗi tiềm ẩn */}
              <th className="py-2.5 px-3 min-w-[200px] border-r border-slate-200">
                Sai lỗi tiềm ẩn (Failure Mode)
              </th>

              {/* Nguyên nhân tiềm ẩn */}
              <th className="py-2.5 px-3 min-w-[210px] border-r border-slate-200">
                Nguyên nhân gốc rễ (Causes)
              </th>

              {/* Biện pháp kiểm soát hiện tại (Chỉ hiện khi full mode) */}
              {viewMode === 'full' && (
                <th className="py-2.5 px-3 w-40 border-r border-slate-200">
                  Kiểm soát hiện tại (Controls)
                </th>
              )}

              {/* S-O-D-RPN Group */}
              <th 
                onClick={() => handleSort('S')}
                className="py-2.5 px-1.5 text-center w-11 cursor-pointer hover:bg-rose-100 text-rose-700 border-r border-slate-200"
                title="Mức độ nghiêm trọng (Severity 1-10) - Nhấp để sắp xếp"
              >
                <span className="underline decoration-dotted">S</span>
              </th>
              <th 
                className="py-2.5 px-1.5 text-center w-11 text-amber-700 border-r border-slate-200"
                title="Xác suất xuất hiện (Occurrence 1-10)"
              >
                O
              </th>
              <th 
                className="py-2.5 px-1.5 text-center w-11 text-indigo-700 border-r border-slate-200"
                title="Khả năng phát hiện (Detection 1-10)"
              >
                D
              </th>
              <th 
                onClick={() => handleSort('rpn')}
                className="py-2.5 px-1.5 text-center w-16 cursor-pointer hover:bg-indigo-100 text-slate-900 border-r border-slate-200 font-extrabold"
                title="Risk Priority Number (RPN = S × O × D) - Nhấp để sắp xếp"
              >
                <div className="flex items-center justify-center gap-0.5">
                  <span>RPN</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>

              {/* Kết luận đánh giá */}
              <th className="py-2.5 px-2 text-center w-24 border-r border-slate-200">
                Đánh giá
              </th>

              {/* Đối sách cải tiến kỹ thuật */}
              <th className="py-2.5 px-3 min-w-[240px] border-r border-slate-200">
                Đối sách cải tiến kỹ thuật (Action)
              </th>

              {/* Phụ trách */}
              <th className="py-2.5 px-2.5 w-32 border-r border-slate-200">
                Phụ trách (P.I.C)
              </th>

              {/* Hạn định */}
              <th className="py-2.5 px-2 text-center w-24 border-r border-slate-200">
                Hạn chót
              </th>

              {/* Trạng thái */}
              <th className="py-2.5 px-2.5 text-center w-28 border-r border-slate-200">
                Trạng thái
              </th>

              {/* Thao tác */}
              <th className="py-2.5 px-1 text-center w-9">
                
              </th>
            </tr>
          </thead>

          <tbody className="text-xs divide-y divide-slate-200 bg-white">
            {document.items.length === 0 ? (
              <tr>
                <td colSpan={viewMode === 'full' ? 15 : 14} className="py-20 text-center text-slate-500">
                  <div className="max-w-md mx-auto p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Bảng phân tích FMEA hiện đang trống
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Bạn có thể tải ngay dữ liệu mẫu FMEA của sản phẩm đặc trưng ({document.productName || 'Ngành hàng'}) hoặc tự thêm các dòng phân tích mới.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      {onOpenProductPresets && (
                        <button
                          onClick={onOpenProductPresets}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Layers className="w-4 h-4" />
                          <span>Tải Mẫu Sản Phẩm Đặc Trưng</span>
                        </button>
                      )}
                      <button
                        onClick={onAddItem}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm Dòng Mới</span>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={viewMode === 'full' ? 15 : 14} className="py-16 text-center text-slate-400">
                  <div className="max-w-sm mx-auto space-y-2">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">Không có dữ liệu phù hợp với bộ lọc</p>
                    <p className="text-[11px] text-slate-400">Hãy thử xóa bộ lọc tìm kiếm hoặc nhấp "Thêm Dòng Mới" để tạo đánh giá rủi ro.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item, index) => {
                const isCritical = item.rpn >= 100 || item.S >= 8;

                return (
                  <tr 
                    key={item.id}
                    className={`hover:bg-indigo-50/40 transition-colors group ${
                      isCritical ? 'bg-rose-50/30' : index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                    }`}
                  >
                    {/* TT */}
                    <td className="py-2 px-2 text-center font-mono text-slate-400 text-[11px] border-r border-slate-200">
                      <div className="flex items-center justify-center">
                        {isCritical && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1 shrink-0" title="Cần ưu tiên xử lý" />
                        )}
                        <span>{item.itemNo || index + 1}</span>
                      </div>
                    </td>

                    {/* Chi tiết & Chức năng */}
                    <td className="py-2 px-2.5 border-r border-slate-200">
                      <input
                        type="text"
                        value={item.componentName}
                        onChange={(e) => onUpdateItem(item.id, { componentName: e.target.value })}
                        className="w-full font-bold text-slate-800 text-xs bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-hidden py-0.5 rounded-xs"
                        placeholder="Tên chi tiết..."
                      />
                      <input
                        type="text"
                        value={item.riskIssue}
                        onChange={(e) => onUpdateItem(item.id, { riskIssue: e.target.value })}
                        className="w-full text-[11px] text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-hidden py-0.5 rounded-xs"
                        placeholder="Chức năng / Yêu cầu..."
                      />
                    </td>

                    {/* Sai lỗi tiềm ẩn */}
                    <td className="py-2 px-2.5 border-r border-slate-200">
                      <textarea
                        rows={2}
                        value={item.failureMode}
                        onChange={(e) => onUpdateItem(item.id, { failureMode: e.target.value })}
                        className="w-full font-medium text-slate-800 text-xs bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-hidden p-1 rounded-xs resize-none leading-relaxed"
                        placeholder="Mô tả sai lỗi tiềm ẩn..."
                      />
                    </td>

                    {/* Nguyên nhân gốc rễ */}
                    <td className="py-2 px-2.5 border-r border-slate-200">
                      <textarea
                        rows={2}
                        value={item.cause}
                        onChange={(e) => onUpdateItem(item.id, { cause: e.target.value })}
                        className="w-full text-slate-600 text-[11px] bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-hidden p-1 rounded-xs resize-none leading-relaxed"
                        placeholder="Nguyên nhân phát sinh lỗi..."
                      />
                    </td>

                    {/* Kiểm soát hiện tại */}
                    {viewMode === 'full' && (
                      <td className="py-2 px-2.5 border-r border-slate-200">
                        <textarea
                          rows={2}
                          value={item.currentControl || ''}
                          onChange={(e) => onUpdateItem(item.id, { currentControl: e.target.value })}
                          className="w-full text-slate-500 text-[11px] bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-hidden p-1 rounded-xs resize-none leading-relaxed"
                          placeholder="Quy trình thử nghiệm / Kiểm soát..."
                        />
                      </td>
                    )}

                    {/* S */}
                    <td className="py-2 px-1 text-center border-r border-slate-200">
                      <select
                        value={item.S}
                        onChange={(e) => handleScoreChange(item.id, 'S', Number(e.target.value))}
                        className={`w-9 py-1 text-center font-bold text-xs rounded border cursor-pointer focus:outline-hidden ${
                          item.S >= 8 
                            ? 'text-rose-700 bg-rose-50 border-rose-300' 
                            : 'text-slate-800 bg-white border-slate-200 hover:border-slate-400'
                        }`}
                        title="Điểm nghiêm trọng (Severity)"
                      >
                        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </td>

                    {/* O */}
                    <td className="py-2 px-1 text-center border-r border-slate-200">
                      <select
                        value={item.O}
                        onChange={(e) => handleScoreChange(item.id, 'O', Number(e.target.value))}
                        className="w-9 py-1 text-center font-bold text-xs rounded border border-slate-200 hover:border-slate-400 text-amber-800 bg-white cursor-pointer focus:outline-hidden"
                        title="Xác suất xuất hiện (Occurrence)"
                      >
                        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </td>

                    {/* D */}
                    <td className="py-2 px-1 text-center border-r border-slate-200">
                      <select
                        value={item.D}
                        onChange={(e) => handleScoreChange(item.id, 'D', Number(e.target.value))}
                        className="w-9 py-1 text-center font-bold text-xs rounded border border-slate-200 hover:border-slate-400 text-indigo-800 bg-white cursor-pointer focus:outline-hidden"
                        title="Khả năng phát hiện (Detection)"
                      >
                        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </td>

                    {/* RPN */}
                    <td className="py-2 px-1.5 text-center border-r border-slate-200">
                      {item.rpn >= 100 ? (
                        <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded font-black font-mono text-xs inline-block shadow-2xs">
                          {item.rpn}
                        </span>
                      ) : item.rpn >= 40 ? (
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-bold font-mono text-xs inline-block">
                          {item.rpn}
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold font-mono text-xs inline-block">
                          {item.rpn}
                        </span>
                      )}
                    </td>

                    {/* Kết luận */}
                    <td className="py-2 px-1.5 text-center border-r border-slate-200">
                      {item.conclusion === 'Cần cải tiến' || isCritical ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded inline-block whitespace-nowrap">
                          Cần cải tiến
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded inline-block whitespace-nowrap">
                          Đạt yêu cầu
                        </span>
                      )}
                    </td>

                    {/* Đối sách cải tiến */}
                    <td className="py-2 px-2.5 border-r border-slate-200">
                      <div className="space-y-1">
                        <textarea
                          rows={2}
                          value={item.action || ''}
                          onChange={(e) => onUpdateItem(item.id, { action: e.target.value })}
                          className="w-full text-xs text-slate-800 bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-hidden p-1 rounded-xs resize-none leading-relaxed"
                          placeholder="Mô tả đối sách khắc phục kỹ thuật..."
                        />
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => onSuggestAction(item)}
                            className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-200 transition-colors"
                            title="Nhấp để nhận đối sách kỹ thuật và chỉ số RPN' tối ưu"
                          >
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Đề xuất đối sách AI</span>
                          </button>
                          {item.sAfter && item.oAfter && item.dAfter && (
                            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              RPN' = {calculateRPN(item.sAfter, item.oAfter, item.dAfter)}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phụ trách */}
                    <td className="py-2 px-2 border-r border-slate-200">
                      <input
                        type="text"
                        value={item.pic || ''}
                        onChange={(e) => onUpdateItem(item.id, { pic: e.target.value })}
                        className="w-full text-xs font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-hidden py-1 px-1 rounded-xs"
                        placeholder="Người phụ trách..."
                      />
                    </td>

                    {/* Hạn chót */}
                    <td className="py-2 px-1.5 text-center border-r border-slate-200">
                      <input
                        type="date"
                        value={item.dueDate || ''}
                        onChange={(e) => onUpdateItem(item.id, { dueDate: e.target.value })}
                        className="text-[10px] text-slate-700 bg-transparent border border-slate-200 hover:border-slate-400 rounded px-1 py-0.5 w-full cursor-pointer"
                      />
                    </td>

                    {/* Trạng thái */}
                    <td className="py-2 px-2 text-center border-r border-slate-200">
                      <select
                        value={item.status}
                        onChange={(e) => onUpdateItem(item.id, { status: e.target.value as ActionStatus })}
                        className={`text-[10px] font-bold rounded-md px-1.5 py-1 border cursor-pointer focus:outline-hidden w-full ${
                          item.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : item.status === 'in_progress'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : item.status === 'under_review'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="pending">Chưa làm</option>
                        <option value="in_progress">Đang làm</option>
                        <option value="under_review">Chờ test</option>
                        <option value="completed">Hoàn thành</option>
                      </select>
                    </td>

                    {/* Delete action */}
                    <td className="py-2 px-1 text-center">
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Xóa dòng này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Sleek Table Footer Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-3 py-1.5 shrink-0 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">
            Hồ sơ: <strong className="text-indigo-700">{document.productName}</strong> ({document.fmeaType})
          </span>
          <span className="text-slate-300">|</span>
          <span className="hidden sm:inline">
            Tổng số: <strong className="text-slate-800">{document.items.length}</strong> rủi ro
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="hidden md:inline">
            Cần cải tiến: <strong className="text-rose-700">{document.items.filter(i => i.rpn >= 100 || i.S >= 8).length}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddItem}
            className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm dòng</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog Modal: Xóa toàn bộ bảng */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 text-slate-800 animate-in zoom-in-95 duration-150">
            <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3.5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">
              Xác nhận xóa toàn bộ bảng FMEA?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Bạn có chắc chắn muốn xóa toàn bộ <strong>{document.items.length} dòng</strong> đánh giá rủi ro hiện có trong bảng không? Dữ liệu hiện tại sẽ bị xóa sạch khỏi bảng để bạn làm lại từ đầu hoặc tải mẫu sản phẩm đặc trưng mới.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsConfirmClearOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  setIsConfirmClearOpen(false);
                  if (onClearAll) onClearAll();
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác nhận xóa sạch</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
