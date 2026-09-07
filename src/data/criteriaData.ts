import { CriteriaItem, ProductCategory } from '../types';

export const CATEGORY_INFO: Record<ProductCategory, { label: string; description: string; icon: string }> = {
  dien_gia_dung: {
    label: 'Điện gia dụng',
    description: 'Quạt điện, quạt cây, bàn ủi, máy hút bụi, máy sấy tóc, máy lọc không khí',
    icon: 'Fan'
  },
  dien_tu_dien_lanh: {
    label: 'Điện tử điện lạnh',
    description: 'Tủ lạnh Inverter, điều hòa nhiệt độ, máy giặt lồng ngang, máy hút ẩm',
    icon: 'Refrigerator'
  },
  thiet_bi_nha_bep: {
    label: 'Thiết bị nhà bếp',
    description: 'Nồi cơm điện IH, nồi chiên không dầu, bếp từ, máy xay sinh tố, lò vi sóng',
    icon: 'CookingPot'
  },
  bon_nuoc: {
    label: 'Bồn nước & Thiết bị nhiệt',
    description: 'Bồn nước Inox 304, bồn nhựa cao cấp, bình nóng lạnh, máy nước nóng NLMT',
    icon: 'Droplets'
  },
  khac: {
    label: 'Khác / Cơ khí linh kiện',
    description: 'Các chi tiết kim loại dập khuôn, chi tiết nhựa ép phun, bo mạch điện tử',
    icon: 'Wrench'
  }
};

// Bảng đánh giá mức độ nghiêm trọng (Severity - S) - chuẩn hóa theo tài liệu đính kèm
export const SEVERITY_CRITERIA: CriteriaItem[] = [
  {
    level: 10,
    effect: 'Nguy hiểm không có cảnh báo',
    description: 'Lỗi sai hỏng tiềm ẩn gây ảnh hưởng tới việc an toàn sử dụng mà không có cảnh báo hoặc mức độ nghiêm trọng cao bao gồm cả những vi phạm về quy định bắt buộc.'
  },
  {
    level: 9,
    effect: 'Nguy hiểm có cảnh báo',
    description: 'Lỗi sai hỏng tiềm ẩn gây ảnh hưởng tới việc an toàn sử dụng có cảnh báo hoặc mức độ nghiêm trọng cao bao gồm cả những vi phạm về quy định bắt buộc.'
  },
  {
    level: 8,
    effect: 'Rất cao',
    description: 'Không có liên quan gì đến an toàn hay các quy định liên quan nhưng sản phẩm không sử dụng được hoặc mất chức năng chính.'
  },
  {
    level: 7,
    effect: 'Cao',
    description: 'Tính năng chính vẫn hoạt động được nhưng bị suy giảm làm khách hàng cảm thấy không hài lòng.'
  },
  {
    level: 6,
    effect: 'Bình thường',
    description: 'Sản phẩm có thể sử dụng, tuy nhiên các tính năng phụ không hoạt động nên làm cho khách hàng cảm thấy không hài lòng.'
  },
  {
    level: 5,
    effect: 'Thấp',
    description: 'Tính năng chính của sản phẩm vẫn hoạt động nhưng một vài tính năng tiện ích bị suy giảm làm cho một phần nhỏ khách hàng không hài lòng.'
  },
  {
    level: 4,
    effect: 'Rất thấp',
    description: 'Hỏng hóc nhỏ nhưng hầu hết khách hàng cảm thấy không hài lòng (>70%).'
  },
  {
    level: 3,
    effect: 'Nhẹ',
    description: 'Hỏng hóc nhỏ nhưng bình thường, đa số khách hàng cảm thấy không hài lòng (30% - 70%).'
  },
  {
    level: 2,
    effect: 'Rất nhẹ',
    description: 'Hỏng hóc nhỏ và số ít khách hàng cảm thấy không hài lòng (10% - 35%).'
  },
  {
    level: 1,
    effect: 'Không có',
    description: 'Có hỏng hóc nhỏ và không có ảnh hưởng rõ ràng.'
  }
];

// Bảng đánh giá mức độ xuất hiện (Occurrence - O) - chuẩn hóa theo tài liệu đính kèm
export const OCCURRENCE_CRITERIA: CriteriaItem[] = [
  {
    level: 10,
    effect: 'Rất cao (Gần như không thể tránh)',
    description: 'Gần như không thể tránh được lỗi',
    extraInfo: 'N = 1/2 (~50.000%)'
  },
  {
    level: 9,
    effect: 'Rất cao',
    description: 'Gần như không thể tránh được lỗi',
    extraInfo: 'N = 1/3 (~33.330%)'
  },
  {
    level: 8,
    effect: 'Cao (Lỗi lặp lại)',
    description: 'Lỗi lặp lại thường xuyên trong quá trình vận hành',
    extraInfo: 'N = 1/8 (~12.500%)'
  },
  {
    level: 7,
    effect: 'Cao (Lỗi lặp lại)',
    description: 'Lỗi lặp lại',
    extraInfo: 'N = 1/20 (~5.000%)'
  },
  {
    level: 6,
    effect: 'Bình thường (Thỉnh thoảng)',
    description: 'Lỗi thỉnh thoảng xuất hiện',
    extraInfo: 'N = 1/80 (~1.250%)'
  },
  {
    level: 5,
    effect: 'Bình thường',
    description: 'Lỗi thỉnh thoảng xuất hiện',
    extraInfo: 'N = 1/400 (~0.250%)'
  },
  {
    level: 4,
    effect: 'Bình thường',
    description: 'Lỗi thỉnh thoảng xuất hiện',
    extraInfo: 'N = 1/2000 (~0.050%)'
  },
  {
    level: 3,
    effect: 'Thấp (Tương đối ít)',
    description: 'Lỗi tương đối ít phát sinh',
    extraInfo: 'N = 1/15000 (~0.007%)'
  },
  {
    level: 2,
    effect: 'Thấp (Rất ít)',
    description: 'Lỗi tương đối ít',
    extraInfo: 'N = 1/150000 (~0.001%)'
  },
  {
    level: 1,
    effect: 'Nhẹ (Gần như không có)',
    description: 'Gần như không có lỗi trong toàn bộ vòng đời',
    extraInfo: 'N = 1/1500000 (~0.000%)'
  }
];

// Bảng đánh giá mức độ phát hiện (Detection - D) - chuẩn hóa theo tài liệu đính kèm
export const DETECTION_CRITERIA: CriteriaItem[] = [
  {
    level: 10,
    effect: 'Không chắc chắn tuyệt đối',
    description: 'Không kiểm soát được thiết kế; không tìm ra được nguyên nhân tiềm ẩn, cơ chế và trạng thái sai hỏng hoặc không có cách nào tìm ra được.'
  },
  {
    level: 9,
    effect: 'Rất mong manh',
    description: 'Cơ hội tìm ra nguyên nhân tiềm ẩn, cơ chế hay trạng thái sai hỏng dựa vào việc quản lý thiết kế là rất mong manh. Phân tích mô phỏng không tương quan so với dự kiến.'
  },
  {
    level: 8,
    effect: 'Mong manh',
    description: 'Cơ hội mong manh để tìm ra nguyên nhân: Phê duyệt sản phẩm sau khi thiết kế xong và trước khi sản xuất hàng loạt, với kết quả đánh giá sản phẩm Đạt/Không đạt (thử nghiệm các chức năng chính/cơ bản).'
  },
  {
    level: 7,
    effect: 'Rất thấp',
    description: 'Cơ hội tìm ra nguyên nhân rất thấp: Phê duyệt sản phẩm sau khi thiết kế xong và trước khi sản xuất hàng loạt với việc thử nghiệm sản phẩm cho đến khi xảy ra lỗi, không đạt.'
  },
  {
    level: 6,
    effect: 'Thấp',
    description: 'Cơ hội thấp để tìm ra nguyên nhân: Phê duyệt sản phẩm sau khi thiết kế xong và trước khi sản xuất hàng loạt với thử nghiệm phá hủy (thử nghiệm tính bền của sản phẩm,...)'
  },
  {
    level: 5,
    effect: 'Bình thường',
    description: 'Cơ hội tìm ra nguyên nhân ở mức bình thường: Xác minh sản phẩm (đánh giá độ tin cậy) trước khi hoàn thiện thiết kế thông qua thử nghiệm đánh giá đạt/không đạt (thử nghiệm các chức năng chính, cơ bản).'
  },
  {
    level: 4,
    effect: 'Hơi cao',
    description: 'Xác minh sản phẩm (đánh giá độ tin cậy) trước khi hoàn thiện thiết kế thông qua thử nghiệm sản phẩm cho đến khi nó xảy ra lỗi, không đạt (ví dụ cong vênh, biến dạng, nứt,...)'
  },
  {
    level: 3,
    effect: 'Cao',
    description: 'Xác minh sản phẩm (đánh giá độ tin cậy) trước khi hoàn thiện thiết kế thông qua thử nghiệm phá hủy sản phẩm (giá trị kết quả test trước và sau mỗi chu kỳ, xu hướng kết quả test...)'
  },
  {
    level: 2,
    effect: 'Rất cao',
    description: 'Phân tích thiết kế có khả năng phát hiện lỗi sai hỏng cao. Phân tích mô phỏng (CAE, FEA,...) có mối tương quan cao so với dự kiến và thực tế.'
  },
  {
    level: 1,
    effect: 'Gần như chắc chắn',
    description: 'Nguyên nhân gây sai hỏng không xảy ra vì nó được ngăn chặn hoàn toàn thông qua các giải pháp thiết kế (ví dụ: tiêu chuẩn thiết kế đã được chứng minh, lựa chọn vật liệu phổ biến hoặc tốt nhất,...)'
  }
];

export function calculateRPN(S: number, O: number, D: number): number {
  return (S || 0) * (O || 0) * (D || 0);
}

export function evaluateRPNRisk(rpn: number, S: number): {
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  label: string;
  badgeClass: string;
  recommendation: 'Cần cải tiến' | 'Không cải tiến';
} {
  if (rpn >= 100 || S >= 8) {
    return {
      level: 'CRITICAL',
      label: 'Rủi ro Cao / Ưu tiên 1',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
      recommendation: 'Cần cải tiến'
    };
  } else if (rpn >= 40) {
    return {
      level: 'MEDIUM',
      label: 'Rủi ro Trung bình',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      recommendation: 'Cần cải tiến'
    };
  } else {
    return {
      level: 'LOW',
      label: 'Chấp nhận được',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      recommendation: 'Không cải tiến'
    };
  }
}
