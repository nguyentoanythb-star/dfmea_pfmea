import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FMEADocument, FMEAItem } from '../types';
import { CATEGORY_INFO } from '../data/criteriaData';
import { ROBOTO_REGULAR_B64, ROBOTO_BOLD_B64 } from './robotoFonts';

/**
 * Trình chuyển đổi trạng thái sang tiếng Việt chuẩn
 */
export function translateStatus(status?: string): string {
  switch (status) {
    case 'completed': return 'Hoàn thành';
    case 'in_progress': return 'Đang xử lý';
    case 'under_review': return 'Chờ kiểm tra';
    case 'pending':
    default:
      return 'Chưa bắt đầu';
  }
}

/**
 * Xuất file Excel chuẩn theo biểu mẫu FMEA doanh nghiệp
 * Đã tối ưu độ rộng cột và cài đặt trang (PageSetup) để vừa vặn 1 trang ngang khi in ký (Fit to 1 Page Wide)
 */
export async function exportToExcel(doc: FMEADocument): Promise<void> {
  const categoryLabel = CATEGORY_INFO[doc.category]?.label || doc.category;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = doc.author || 'FMEA';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(`${doc.fmeaType}_Report`, {
    views: [{ showGridLines: true }]
  });

  // Cấu hình in ấn trang A4 khổ ngang: Fit to 1 page wide (tất cả cột nằm gọn trên 1 trang in, dễ in ký)
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,  // Bắt buộc vừa 1 trang ngang (không bị tràn ngang sang trang khác)
    fitToHeight: 0, // Chiều dọc tự động ngắt theo số dòng
    margins: {
      left: 0.25,
      right: 0.25,
      top: 0.35,
      bottom: 0.35,
      header: 0.15,
      footer: 0.15
    },
    showGridLines: true,
    printTitlesRow: '7:8' // Tự động lặp lại dòng tiêu đề cột trên tất cả các trang in
  };

  // 1. Định nghĩa độ rộng cột gọn gàng, vừa khít tỷ lệ trang in A4 Landscape
  worksheet.columns = [
    { key: 'tt', width: 4.5 },              // A: TT
    { key: 'component', width: 14 },        // B: Chi tiết / Bộ phận
    { key: 'riskIssue', width: 13 },        // C: Vấn đề / Chức năng
    { key: 'failureMode', width: 15 },      // D: Sai lỗi tiềm ẩn
    { key: 'cause', width: 15 },            // E: Nguyên nhân gốc rễ
    { key: 'currentControl', width: 13 },   // F: Kiểm soát hiện tại
    { key: 's', width: 4.5 },               // G: S
    { key: 'o', width: 4.5 },               // H: O
    { key: 'd', width: 4.5 },               // I: D
    { key: 'rpn', width: 5.5 },             // J: RPN
    { key: 'conclusion', width: 9.5 },      // K: Đánh giá
    { key: 'action', width: 16 },           // L: Đối sách cải tiến
    { key: 'pic', width: 10 },              // M: P.I.C
    { key: 'startDate', width: 9 },         // N: Bắt đầu
    { key: 'dueDate', width: 9 },           // O: Hạn chót
    { key: 'status', width: 9.5 },          // P: Trạng thái
    { key: 'result', width: 13 },           // Q: Kết quả
    { key: 'sAfter', width: 4.5 },          // R: S'
    { key: 'oAfter', width: 4.5 },          // S: O'
    { key: 'dAfter', width: 4.5 },          // T: D'
    { key: 'rpnAfter', width: 5.5 }         // U: RPN'
  ];

  // Helper hàm kẻ viền mỏng
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
  };

  // 2. Banner Tiêu đề (Dòng 1) - Tinh gọn, chỉ thông tin chính
  worksheet.mergeCells('A1:U1');
  const mainTitleCell = worksheet.getCell('A1');
  mainTitleCell.value = `BÁO CÁO PHÂN TÍCH ${doc.fmeaType} - ${doc.productName.toUpperCase()}`;
  mainTitleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  mainTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  mainTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 24;

  // 3. Khối Thông tin hồ sơ do người dùng nhập (Dòng 2 đến 4)
  const metaRows = [
    {
      label1: 'Sản phẩm:', val1: doc.productName || '---',
      label2: 'Mã SP:', val2: doc.productCode || '---',
      label3: 'Giai đoạn:', val3: doc.phase || '---'
    },
    {
      label1: 'Ngành hàng:', val1: categoryLabel,
      label2: 'Nhà cung cấp:', val2: doc.supplier || '---',
      label3: 'Nơi sản xuất:', val3: doc.location || '---'
    },
    {
      label1: 'Người lập:', val1: doc.author || '---',
      label2: 'Người kiểm tra:', val2: doc.reviewer || '---',
      label3: 'Người phê duyệt:', val3: doc.approver || '---'
    }
  ];

  // Kiểm tra nếu người dùng có nhập thông tin thử nghiệm thì đưa thêm dòng thứ 4
  const testParts = [
    doc.assemblyTest ? `Lắp ráp: ${doc.assemblyTest}` : null,
    doc.functionalTest ? `Chức năng: ${doc.functionalTest}` : null,
    doc.periodicTest ? `Định kỳ: ${doc.periodicTest}` : null,
  ].filter(Boolean);

  if (testParts.length > 0) {
    metaRows.push({
      label1: 'Thử nghiệm:', val1: testParts.join(' | '),
      label2: 'Loại FMEA:', val2: doc.fmeaType,
      label3: 'Ngày cập nhật:', val3: doc.updatedDate || doc.createdDate || '---'
    });
  }

  metaRows.forEach((rowInfo, idx) => {
    const rowNum = 2 + idx;
    worksheet.getRow(rowNum).height = 19;

    // Block 1 (A-F)
    worksheet.getCell(`A${rowNum}`).value = rowInfo.label1;
    worksheet.getCell(`A${rowNum}`).font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FF475569' } };
    worksheet.getCell(`A${rowNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    worksheet.getCell(`A${rowNum}`).alignment = { vertical: 'middle', horizontal: 'right' };
    worksheet.getCell(`A${rowNum}`).border = thinBorder;

    worksheet.mergeCells(`B${rowNum}:F${rowNum}`);
    const v1Cell = worksheet.getCell(`B${rowNum}`);
    v1Cell.value = rowInfo.val1;
    v1Cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FF0F172A' } };
    v1Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    v1Cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 0.5 };
    v1Cell.border = thinBorder;

    // Block 2 (G-M)
    worksheet.mergeCells(`G${rowNum}:H${rowNum}`);
    const l2Cell = worksheet.getCell(`G${rowNum}`);
    l2Cell.value = rowInfo.label2;
    l2Cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FF475569' } };
    l2Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    l2Cell.alignment = { vertical: 'middle', horizontal: 'right' };
    l2Cell.border = thinBorder;

    worksheet.mergeCells(`I${rowNum}:M${rowNum}`);
    const v2Cell = worksheet.getCell(`I${rowNum}`);
    v2Cell.value = rowInfo.val2;
    v2Cell.font = { name: 'Arial', size: 8.5, color: { argb: 'FF0F172A' } };
    v2Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    v2Cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 0.5 };
    v2Cell.border = thinBorder;

    // Block 3 (N-U)
    worksheet.mergeCells(`N${rowNum}:O${rowNum}`);
    const l3Cell = worksheet.getCell(`N${rowNum}`);
    l3Cell.value = rowInfo.label3;
    l3Cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FF475569' } };
    l3Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    l3Cell.alignment = { vertical: 'middle', horizontal: 'right' };
    l3Cell.border = thinBorder;

    worksheet.mergeCells(`P${rowNum}:U${rowNum}`);
    const v3Cell = worksheet.getCell(`P${rowNum}`);
    v3Cell.value = rowInfo.val3;
    v3Cell.font = { name: 'Arial', size: 8.5, color: { argb: 'FF0F172A' } };
    v3Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    v3Cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 0.5 };
    v3Cell.border = thinBorder;
  });

  const headerGroupRowNum = 2 + metaRows.length + 1; // Cách 1 dòng đệm
  worksheet.getRow(headerGroupRowNum - 1).height = 6;

  // 4. Tiêu đề nhóm cột - Cấp 1
  worksheet.getRow(headerGroupRowNum).height = 20;

  // Group 1: Thông tin phân tích ban đầu (A-F)
  worksheet.mergeCells(`A${headerGroupRowNum}:F${headerGroupRowNum}`);
  const g1 = worksheet.getCell(`A${headerGroupRowNum}`);
  g1.value = '1. THÔNG TIN PHÂN TÍCH BAN ĐẦU';
  g1.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
  g1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  g1.alignment = { vertical: 'middle', horizontal: 'center' };
  g1.border = thinBorder;

  // Group 2: Đánh giá chỉ số rủi ro ban đầu (G-K)
  worksheet.mergeCells(`G${headerGroupRowNum}:K${headerGroupRowNum}`);
  const g2 = worksheet.getCell(`G${headerGroupRowNum}`);
  g2.value = '2. ĐÁNH GIÁ RỦI RO (S-O-D)';
  g2.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
  g2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF312E81' } };
  g2.alignment = { vertical: 'middle', horizontal: 'center' };
  g2.border = thinBorder;

  // Group 3: Kế hoạch đối sách cải tiến (L-P)
  worksheet.mergeCells(`L${headerGroupRowNum}:P${headerGroupRowNum}`);
  const g3 = worksheet.getCell(`L${headerGroupRowNum}`);
  g3.value = '3. ĐỐI SÁCH CẢI TIẾN';
  g3.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
  g3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } };
  g3.alignment = { vertical: 'middle', horizontal: 'center' };
  g3.border = thinBorder;

  // Group 4: Đánh giá sau cải tiến (Q-U)
  worksheet.mergeCells(`Q${headerGroupRowNum}:U${headerGroupRowNum}`);
  const g4 = worksheet.getCell(`Q${headerGroupRowNum}`);
  g4.value = '4. ĐÁNH GIÁ SAU CẢI TIẾN';
  g4.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
  g4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
  g4.alignment = { vertical: 'middle', horizontal: 'center' };
  g4.border = thinBorder;

  // 5. Tiêu đề chi tiết từng cột - Cấp 2
  const colHeaderRowNum = headerGroupRowNum + 1;
  worksheet.getRow(colHeaderRowNum).height = 24;

  const colHeaders = [
    { col: 'A', text: 'TT', fill: 'FF1E293B', fontColor: 'FFFFFFFF' },
    { col: 'B', text: 'Bộ phận / Chi tiết', fill: 'FF1E293B', fontColor: 'FFFFFFFF' },
    { col: 'C', text: 'Chức năng / Yêu cầu', fill: 'FF1E293B', fontColor: 'FFFFFFFF' },
    { col: 'D', text: 'Sai lỗi tiềm ẩn', fill: 'FF1E293B', fontColor: 'FFFFFFFF' },
    { col: 'E', text: 'Nguyên nhân gốc rễ', fill: 'FF1E293B', fontColor: 'FFFFFFFF' },
    { col: 'F', text: 'Kiểm soát hiện tại', fill: 'FF1E293B', fontColor: 'FFFFFFFF' },
    { col: 'G', text: 'S', fill: 'FFFEE2E2', fontColor: 'FF991B1B' },
    { col: 'H', text: 'O', fill: 'FFFEF3C7', fontColor: 'FF92400E' },
    { col: 'I', text: 'D', fill: 'FFE0E7FF', fontColor: 'FF3730A3' },
    { col: 'J', text: 'RPN', fill: 'FF1E293B', fontColor: 'FFFDE047' },
    { col: 'K', text: 'Đánh giá', fill: 'FF312E81', fontColor: 'FFFFFFFF' },
    { col: 'L', text: 'Đối sách cải tiến', fill: 'FF065F46', fontColor: 'FFFFFFFF' },
    { col: 'M', text: 'Phụ trách', fill: 'FF065F46', fontColor: 'FFFFFFFF' },
    { col: 'N', text: 'Bắt đầu', fill: 'FF065F46', fontColor: 'FFFFFFFF' },
    { col: 'O', text: 'Hạn chót', fill: 'FF065F46', fontColor: 'FFFFFFFF' },
    { col: 'P', text: 'Trạng thái', fill: 'FF065F46', fontColor: 'FFFFFFFF' },
    { col: 'Q', text: 'Kết quả', fill: 'FF334155', fontColor: 'FFFFFFFF' },
    { col: 'R', text: "S'", fill: 'FF334155', fontColor: 'FFFFFFFF' },
    { col: 'S', text: "O'", fill: 'FF334155', fontColor: 'FFFFFFFF' },
    { col: 'T', text: "D'", fill: 'FF334155', fontColor: 'FFFFFFFF' },
    { col: 'U', text: "RPN'", fill: 'FF334155', fontColor: 'FFFFFFFF' }
  ];

  colHeaders.forEach((col) => {
    const cell = worksheet.getCell(`${col.col}${colHeaderRowNum}`);
    cell.value = col.text;
    cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: col.fontColor } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: col.fill } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = thinBorder;
  });

  // 6. Dữ liệu bảng
  let currentRow = colHeaderRowNum + 1;
  doc.items.forEach((item, index) => {
    const row = worksheet.getRow(currentRow);
    const isEven = index % 2 === 0;
    const defaultRowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    // Tính toán màu sắc RPN theo tiêu chuẩn rủi ro
    const rpnVal = Number(item.rpn) || 0;
    const sVal = Number(item.S) || 0;
    let rpnBg = 'FFD1FAE5';
    let rpnColor = 'FF065F46';
    if (rpnVal >= 100 || sVal >= 8) {
      rpnBg = 'FFFEE2E2';
      rpnColor = 'FF991B1B';
    } else if (rpnVal >= 40) {
      rpnBg = 'FFFEF3C7';
      rpnColor = 'FF92400E';
    }

    // Màu trạng thái
    let statusBg = 'FFF1F5F9';
    let statusColor = 'FF475569';
    switch (item.status) {
      case 'completed':
        statusBg = 'FFD1FAE5';
        statusColor = 'FF065F46';
        break;
      case 'in_progress':
        statusBg = 'FFDBEAFE';
        statusColor = 'FF1E40AF';
        break;
      case 'under_review':
        statusBg = 'FFEDE9FE';
        statusColor = 'FF5B21B6';
        break;
    }

    // Giá trị các ô
    row.getCell(1).value = item.itemNo || index + 1;
    row.getCell(2).value = item.componentName || '';
    row.getCell(3).value = item.riskIssue || '';
    row.getCell(4).value = item.failureMode || '';
    row.getCell(5).value = item.cause || '';
    row.getCell(6).value = item.currentControl || '';
    row.getCell(7).value = item.S;
    row.getCell(8).value = item.O;
    row.getCell(9).value = item.D;
    row.getCell(10).value = item.rpn;
    row.getCell(11).value = item.conclusion;
    row.getCell(12).value = item.action || '';
    row.getCell(13).value = item.pic || '';
    row.getCell(14).value = item.startDate || '';
    row.getCell(15).value = item.dueDate || '';
    row.getCell(16).value = translateStatus(item.status);
    row.getCell(17).value = item.result || '';
    row.getCell(18).value = item.sAfter ?? '';
    row.getCell(19).value = item.oAfter ?? '';
    row.getCell(20).value = item.dAfter ?? '';
    row.getCell(21).value = item.rpnAfter ?? '';

    // Định dạng font, viền, căn lề và màu sắc từng ô
    for (let c = 1; c <= 21; c++) {
      const cell = row.getCell(c);
      cell.border = thinBorder;
      cell.font = { name: 'Arial', size: 8.5, color: { argb: 'FF0F172A' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultRowBg } };

      // Căn lề
      if ([1, 7, 8, 9, 10, 11, 14, 15, 16, 18, 19, 20, 21].includes(c)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 0.3 };
      }

      // Tô màu chuyên biệt
      if (c === 7) { // S
        cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FFDC2626' } };
      } else if (c === 8) { // O
        cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FFD97706' } };
      } else if (c === 9) { // D
        cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FF4F46E5' } };
      } else if (c === 10) { // RPN
        cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: rpnColor } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rpnBg } };
      } else if (c === 11) { // Kết luận
        if (item.conclusion === 'Cần cải tiến') {
          cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FF991B1B' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
        } else {
          cell.font = { name: 'Arial', size: 8.5, color: { argb: 'FF475569' } };
        }
      } else if (c === 16) { // Trạng thái
        cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: statusColor } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusBg } };
      }
    }

    row.height = 26;
    currentRow++;
  });

  // 7. Khối Ký duyệt tài liệu tối ưu cho việc in ký thực tế
  currentRow += 1;
  worksheet.getRow(currentRow).height = 12; // Dòng đệm

  currentRow++;
  worksheet.getRow(currentRow).height = 20;

  worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
  const sigTitle1 = worksheet.getCell(`A${currentRow}`);
  sigTitle1.value = 'NGƯỜI LẬP';
  sigTitle1.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF1E293B' } };
  sigTitle1.alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet.mergeCells(`G${currentRow}:M${currentRow}`);
  const sigTitle2 = worksheet.getCell(`G${currentRow}`);
  sigTitle2.value = 'NGƯỜI KIỂM TRA';
  sigTitle2.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF1E293B' } };
  sigTitle2.alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet.mergeCells(`N${currentRow}:U${currentRow}`);
  const sigTitle3 = worksheet.getCell(`N${currentRow}`);
  sigTitle3.value = 'NGƯỜI PHÊ DUYỆT';
  sigTitle3.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF1E293B' } };
  sigTitle3.alignment = { vertical: 'middle', horizontal: 'center' };

  currentRow++;
  worksheet.getRow(currentRow).height = 15;
  worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
  worksheet.getCell(`A${currentRow}`).value = '(Ký và ghi rõ họ tên)';
  worksheet.getCell(`A${currentRow}`).font = { name: 'Arial', size: 8, italic: true, color: { argb: 'FF64748B' } };
  worksheet.getCell(`A${currentRow}`).alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet.mergeCells(`G${currentRow}:M${currentRow}`);
  worksheet.getCell(`G${currentRow}`).value = '(Ký và ghi rõ họ tên)';
  worksheet.getCell(`G${currentRow}`).font = { name: 'Arial', size: 8, italic: true, color: { argb: 'FF64748B' } };
  worksheet.getCell(`G${currentRow}`).alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet.mergeCells(`N${currentRow}:U${currentRow}`);
  worksheet.getCell(`N${currentRow}`).value = '(Ký và ghi rõ họ tên)';
  worksheet.getCell(`N${currentRow}`).font = { name: 'Arial', size: 8, italic: true, color: { argb: 'FF64748B' } };
  worksheet.getCell(`N${currentRow}`).alignment = { vertical: 'middle', horizontal: 'center' };

  // Khoảng trống đủ rộng để ký tên thực tế
  currentRow++;
  worksheet.getRow(currentRow).height = 16;
  currentRow++;
  worksheet.getRow(currentRow).height = 16;
  currentRow++;
  worksheet.getRow(currentRow).height = 16;

  // Dòng hiển thị họ tên người ký (nếu người dùng đã nhập, nếu chưa để trống để viết tay)
  currentRow++;
  worksheet.getRow(currentRow).height = 20;

  worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
  const sigName1 = worksheet.getCell(`A${currentRow}`);
  sigName1.value = doc.author || '';
  sigName1.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF1E293B' } };
  sigName1.alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet.mergeCells(`G${currentRow}:M${currentRow}`);
  const sigName2 = worksheet.getCell(`G${currentRow}`);
  sigName2.value = doc.reviewer || '';
  sigName2.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF1E293B' } };
  sigName2.alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet.mergeCells(`N${currentRow}:U${currentRow}`);
  const sigName3 = worksheet.getCell(`N${currentRow}`);
  sigName3.value = doc.approver || '';
  sigName3.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF1E293B' } };
  sigName3.alignment = { vertical: 'middle', horizontal: 'center' };

  // 8. Tạo buffer và tải xuống file Excel
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const fileName = `${doc.fmeaType}_${doc.productCode || 'Export'}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Xuất file PDF trình bày gọn gàng, chuyên nghiệp
 * Tích hợp Font chữ Roboto Unicode TrueType (hỗ trợ 100% tiếng Việt có dấu)
 * Đã loại bỏ các nội dung tự động không đúng ở header/footer, chỉ giữ lại những thông tin người dùng đã nhập
 */
export async function exportToPDF(doc: FMEADocument): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Tích hợp Font chữ tiếng Việt chuẩn
  pdf.addFileToVFS('Roboto-Regular.ttf', ROBOTO_REGULAR_B64);
  pdf.addFileToVFS('Roboto-Bold.ttf', ROBOTO_BOLD_B64);
  pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  pdf.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
  pdf.setFont('Roboto', 'normal');

  const categoryLabel = CATEGORY_INFO[doc.category]?.label || doc.category;

  // 1. Header Banner thanh lịch, chỉ hiển thị thông tin thực tế của tài liệu
  pdf.setFillColor(30, 41, 59);
  pdf.rect(10, 8, 277, 10, 'F');

  pdf.setFont('Roboto', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(255, 255, 255);
  pdf.text(`BÁO CÁO PHÂN TÍCH ${doc.fmeaType}: ${(doc.productName || '').toUpperCase()}`, 14, 14.5);

  if (doc.productCode) {
    pdf.setFontSize(8.5);
    pdf.setTextColor(226, 232, 240);
    pdf.text(`Mã SP: ${doc.productCode}`, 283, 14.5, { align: 'right' });
  }

  // 2. Khung Thông tin chi tiết hồ sơ (Metadata Card) - Chỉ lấy dữ liệu người dùng đã nhập
  const testParts = [
    doc.assemblyTest ? `Lắp ráp: ${doc.assemblyTest}` : null,
    doc.functionalTest ? `Chức năng: ${doc.functionalTest}` : null,
    doc.periodicTest ? `Định kỳ: ${doc.periodicTest}` : null,
  ].filter(Boolean);

  const hasTests = testParts.length > 0;
  const cardHeight = hasTests ? 19 : 15;

  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(10, 20, 277, cardHeight, 1.5, 1.5, 'FD');

  pdf.setFontSize(8);

  // Dòng 1: Sản phẩm, Mã SP, Ngành hàng, Giai đoạn
  pdf.setFont('Roboto', 'bold');
  pdf.setTextColor(71, 85, 105);
  pdf.text('Sản phẩm:', 13, 24.5);
  pdf.setFont('Roboto', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(doc.productName || '---', 28, 24.5);

  pdf.setFont('Roboto', 'bold');
  pdf.setTextColor(71, 85, 105);
  pdf.text('Mã SP:', 100, 24.5);
  pdf.setFont('Roboto', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(doc.productCode || '---', 112, 24.5);

  pdf.setFont('Roboto', 'bold');
  pdf.setTextColor(71, 85, 105);
  pdf.text('Ngành:', 160, 24.5);
  pdf.setFont('Roboto', 'normal');
  pdf.setTextColor(15, 23, 42);
  pdf.text(categoryLabel, 172, 24.5);

  pdf.setFont('Roboto', 'bold');
  pdf.setTextColor(71, 85, 105);
  pdf.text('Giai đoạn:', 225, 24.5);
  pdf.setFont('Roboto', 'normal');
  pdf.setTextColor(15, 23, 42);
  pdf.text(doc.phase || '---', 242, 24.5);

  // Dòng 2: Nhà cung cấp, Nơi sản xuất, Ngày cập nhật
  pdf.setFont('Roboto', 'bold');
  pdf.setTextColor(71, 85, 105);
  pdf.text('Nhà cung cấp:', 13, 29.5);
  pdf.setFont('Roboto', 'normal');
  pdf.setTextColor(15, 23, 42);
  pdf.text(doc.supplier || '---', 34, 29.5);

  pdf.setFont('Roboto', 'bold');
  pdf.setTextColor(71, 85, 105);
  pdf.text('Nơi sản xuất:', 100, 29.5);
  pdf.setFont('Roboto', 'normal');
  pdf.setTextColor(15, 23, 42);
  pdf.text(doc.location || '---', 120, 29.5);

  pdf.setFont('Roboto', 'bold');
  pdf.setTextColor(71, 85, 105);
  pdf.text('Ngày cập nhật:', 200, 29.5);
  pdf.setFont('Roboto', 'normal');
  pdf.setTextColor(15, 23, 42);
  pdf.text(`${doc.updatedDate || doc.createdDate || '---'}`, 223, 29.5);

  // Dòng 3: Thử nghiệm (nếu có nhập)
  if (hasTests) {
    pdf.setFont('Roboto', 'bold');
    pdf.setTextColor(71, 85, 105);
    pdf.text('Thử nghiệm:', 13, 34.5);
    pdf.setFont('Roboto', 'normal');
    pdf.setTextColor(15, 23, 42);
    pdf.text(testParts.join(' | '), 32, 34.5);
  }

  // 3. Bảng dữ liệu FMEA chi tiết với autoTable
  const startY = 20 + cardHeight + 3;

  const tableData = doc.items.map((item, idx) => [
    item.itemNo || idx + 1,
    item.componentName || '',
    item.riskIssue || '',
    item.failureMode || '',
    item.cause || '',
    item.currentControl || '',
    item.S,
    item.O,
    item.D,
    item.rpn,
    item.conclusion,
    item.action || '',
    item.pic || '',
    item.dueDate || '',
    translateStatus(item.status)
  ]);

  autoTable(pdf, {
    startY: startY,
    margin: { left: 10, right: 10, bottom: 12 },
    head: [
      [
        { content: 'THÔNG TIN PHÂN TÍCH BAN ĐẦU', colSpan: 6, styles: { halign: 'center', fillColor: [30, 41, 59] } },
        { content: 'ĐÁNH GIÁ CHỈ SỐ RỦI RO', colSpan: 5, styles: { halign: 'center', fillColor: [49, 46, 129] } },
        { content: 'KẾ HOẠCH HÀNH ĐỘNG CẢI TIẾN', colSpan: 4, styles: { halign: 'center', fillColor: [6, 95, 70] } }
      ],
      [
        'TT', 'Bộ phận / Chi tiết', 'Vấn đề / Yêu cầu', 'Sai lỗi tiềm ẩn', 'Nguyên nhân gốc rễ', 'Kiểm soát hiện tại',
        'S', 'O', 'D', 'RPN', 'Đánh giá', 'Đối sách cải tiến', 'P.I.C', 'Hạn định', 'Trạng thái'
      ]
    ],
    body: tableData,
    styles: {
      font: 'Roboto',
      fontStyle: 'normal',
      fontSize: 7,
      cellPadding: 1.4,
      valign: 'middle',
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      textColor: [15, 23, 42]
    },
    headStyles: {
      font: 'Roboto',
      fontStyle: 'bold',
      fontSize: 7.2,
      textColor: [255, 255, 255],
      halign: 'center',
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 20, fontStyle: 'bold' },
      2: { cellWidth: 18 },
      3: { cellWidth: 24 },
      4: { cellWidth: 26 },
      5: { cellWidth: 22 },
      6: { cellWidth: 6.5, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 6.5, halign: 'center', fontStyle: 'bold' },
      8: { cellWidth: 6.5, halign: 'center', fontStyle: 'bold' },
      9: { cellWidth: 9, halign: 'center', fontStyle: 'bold' },
      10: { cellWidth: 15, halign: 'center' },
      11: { cellWidth: 40 },
      12: { cellWidth: 16 },
      13: { cellWidth: 14, halign: 'center' },
      14: { cellWidth: 16, halign: 'center', fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    didParseCell: (data) => {
      // Tô màu cột S, O, D
      if (data.section === 'body') {
        if (data.column.index === 6) {
          data.cell.styles.textColor = [220, 38, 38]; // Đỏ S
        } else if (data.column.index === 7) {
          data.cell.styles.textColor = [217, 119, 6]; // Vàng hổ phách O
        } else if (data.column.index === 8) {
          data.cell.styles.textColor = [79, 70, 229]; // Chàm D
        } else if (data.column.index === 9) {
          // Tô màu ô RPN theo phân loại rủi ro
          const val = Number(data.cell.raw) || 0;
          const sVal = Number(data.row.raw[6]) || 0;
          if (val >= 100 || sVal >= 8) {
            data.cell.styles.fillColor = [254, 226, 226];
            data.cell.styles.textColor = [153, 27, 27];
            data.cell.styles.fontStyle = 'bold';
          } else if (val >= 40) {
            data.cell.styles.fillColor = [254, 243, 199];
            data.cell.styles.textColor = [146, 64, 14];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.fillColor = [209, 250, 229];
            data.cell.styles.textColor = [6, 95, 70];
            data.cell.styles.fontStyle = 'bold';
          }
        } else if (data.column.index === 10) {
          // Cột kết luận
          const text = String(data.cell.raw || '');
          if (text.includes('Cần cải tiến')) {
            data.cell.styles.fillColor = [254, 226, 226];
            data.cell.styles.textColor = [153, 27, 27];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [71, 85, 105];
          }
        } else if (data.column.index === 14) {
          // Cột trạng thái
          const text = String(data.cell.raw || '');
          if (text === 'Hoàn thành') {
            data.cell.styles.fillColor = [209, 250, 229];
            data.cell.styles.textColor = [6, 95, 70];
          } else if (text === 'Đang xử lý') {
            data.cell.styles.fillColor = [219, 234, 254];
            data.cell.styles.textColor = [30, 64, 175];
          } else if (text === 'Chờ kiểm tra') {
            data.cell.styles.fillColor = [237, 233, 254];
            data.cell.styles.textColor = [91, 33, 182];
          } else {
            data.cell.styles.fillColor = [241, 245, 249];
            data.cell.styles.textColor = [71, 85, 105];
          }
        }
      }
    },
    didDrawPage: (data) => {
      // Footer gọn gàng: Chỉ gồm tên hồ sơ do người dùng nhập và số trang thực tế
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();

      pdf.setFont('Roboto', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(148, 163, 184);

      // Bên trái: Tên sản phẩm / mã hồ sơ của người dùng
      const docLabel = doc.productCode 
        ? `${doc.productName} (${doc.productCode})` 
        : (doc.productName || 'Báo cáo FMEA');

      pdf.text(docLabel, 14, pageHeight - 5);

      // Bên phải: Đánh số trang
      pdf.text(
        `Trang ${data.pageNumber}`,
        pageWidth - 14,
        pageHeight - 5,
        { align: 'right' }
      );
    }
  });

  // 4. Khối chữ ký phê duyệt cuối trang (Gọn gàng, loại bỏ các chức danh giả định)
  const finalY = (pdf as any).lastAutoTable.finalY + 6;
  const pageHeight = pdf.internal.pageSize.getHeight();

  if (finalY + 28 > pageHeight) {
    pdf.addPage();
  }

  const signY = (finalY + 28 > pageHeight) ? 18 : finalY;
  const colW = pdf.internal.pageSize.getWidth() / 3;

  pdf.setFont('Roboto', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(30, 41, 59);

  // Cột 1: Người lập
  pdf.text('NGƯỜI LẬP', colW * 0.5, signY, { align: 'center' });
  pdf.setFont('Roboto', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('(Ký và ghi rõ họ tên)', colW * 0.5, signY + 4, { align: 'center' });
  if (doc.author) {
    pdf.setFont('Roboto', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(doc.author, colW * 0.5, signY + 18, { align: 'center' });
  }

  // Cột 2: Kiểm tra
  pdf.setFont('Roboto', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(30, 41, 59);
  pdf.text('NGƯỜI KIỂM TRA', colW * 1.5, signY, { align: 'center' });
  pdf.setFont('Roboto', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('(Ký và ghi rõ họ tên)', colW * 1.5, signY + 4, { align: 'center' });
  if (doc.reviewer) {
    pdf.setFont('Roboto', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(doc.reviewer, colW * 1.5, signY + 18, { align: 'center' });
  }

  // Cột 3: Phê duyệt
  pdf.setFont('Roboto', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(30, 41, 59);
  pdf.text('NGƯỜI PHÊ DUYỆT', colW * 2.5, signY, { align: 'center' });
  pdf.setFont('Roboto', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('(Ký và ghi rõ họ tên)', colW * 2.5, signY + 4, { align: 'center' });
  if (doc.approver) {
    pdf.setFont('Roboto', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(doc.approver, colW * 2.5, signY + 18, { align: 'center' });
  }

  const fileName = `${doc.fmeaType}_${doc.productCode || 'Report'}_${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(fileName);
}

