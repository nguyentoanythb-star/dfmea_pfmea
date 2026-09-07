export type FMEAType = 'DFMEA' | 'PFMEA';

export type ProductCategory = 
  | 'dien_gia_dung' 
  | 'dien_tu_dien_lanh' 
  | 'thiet_bi_nha_bep' 
  | 'bon_nuoc' 
  | 'khac';

export type ActionStatus = 'pending' | 'in_progress' | 'under_review' | 'completed';

export interface FMEAItem {
  id: string;
  itemNo: number;
  componentName: string; // Tên chi tiết / Bộ phận (hoặc Công đoạn trong PFMEA)
  riskIssue: string; // Vấn đề rủi ro / Chức năng (Hoạt động, Nhiệt độ, Độ ồn, Vận tốc gió,...)
  failureMode: string; // Sai lỗi tiềm ẩn
  cause: string; // Nguyên nhân tiềm ẩn
  currentControl?: string; // Kiểm soát hiện tại (Phát hiện / Ngăn ngừa)
  S: number; // Mức độ nghiêm trọng (1 - 10)
  O: number; // Xác suất phát sinh lỗi (1 - 10)
  D: number; // Khả năng phát hiện (1 - 10)
  rpn: number; // S * O * D
  conclusion: 'Không cải tiến' | 'Cần cải tiến';
  action: string; // Đối sách / Hành động khắc phục
  pic: string; // Người phụ trách (P.I.C)
  startDate: string; // Ngày bắt đầu thực hiện (YYYY-MM-DD)
  dueDate: string; // Hạn định (YYYY-MM-DD)
  status: ActionStatus; // Trạng thái xử lý
  result: string; // Kết quả thực hiện
  sAfter?: number; // S' sau cải tiến
  oAfter?: number; // O' sau cải tiến
  dAfter?: number; // D' sau cải tiến
  rpnAfter?: number; // RPN' sau cải tiến
}

export interface FMEADocument {
  id: string;
  fmeaType: FMEAType; // DFMEA hoặc PFMEA
  productName: string; // Tên sản phẩm (VD: Quạt cây Livotec S-400)
  productCode: string; // Mã sản phẩm (VD: S-400, SF-400H)
  category: ProductCategory; // Phân loại danh mục
  phase: string; // Giai đoạn (DV / EV / PV / MP)
  supplier: string; // Nhà cung cấp (NCC)
  location: string; // Nơi sản xuất sản phẩm
  assemblyTest: string; // Test lắp ráp
  functionalTest: string; // Test chức năng
  periodicTest: string; // Kiểm tra định kỳ
  author: string; // Người lập
  reviewer: string; // Kiểm tra
  approver: string; // Phê duyệt
  createdDate: string;
  updatedDate: string;
  items: FMEAItem[];
}

export interface CriteriaItem {
  level: number;
  effect: string;
  description: string;
  extraInfo?: string;
}

export interface HistoricalFailureTemplate {
  id: string;
  category: ProductCategory;
  fmeaType: FMEAType;
  componentName: string;
  riskIssue: string;
  failureMode: string;
  cause: string;
  defaultS: number;
  defaultO: number;
  defaultD: number;
  suggestedAction: string;
  sampleProduct?: string;
}

export interface AISuggestionRequest {
  category: ProductCategory;
  fmeaType: FMEAType;
  productName: string;
  componentName: string;
  riskIssue?: string;
  failureMode?: string;
  cause?: string;
}

export interface AISuggestionResponse {
  suggestions: {
    componentName: string;
    riskIssue: string;
    failureMode: string;
    cause: string;
    recommendedS: number;
    recommendedO: number;
    recommendedD: number;
    action: string;
    controlMethod: string;
    reasoning: string;
  }[];
}

export interface HistoricalDeployment {
  id: string;
  title: string;
  productName: string;
  productCode: string;
  category: ProductCategory;
  fmeaType: FMEAType;
  phase: string;
  supplier?: string;
  itemCount: number;
  highRiskCount: number;
  savedAt: string;
  note?: string;
  documentSnapshot: FMEADocument;
}

