import { ProductCategory, FMEAType, FMEAItem } from '../types';
import { calculateRPN } from './criteriaData';

export interface ProductPresetItemDef {
  componentName: string;
  riskIssue: string;
  failureMode: string;
  cause: string;
  currentControl: string;
  S: number;
  O: number;
  D: number;
  action: string;
  pic?: string;
  result?: string;
}

export interface ProductPreset {
  id: string;
  name: string;
  code: string;
  category: ProductCategory;
  description: string;
  iconName: string;
  // DFMEA specifics
  dfmeaPhase: string;
  dfmeaSupplier: string;
  dfmeaAssemblyTest: string;
  dfmeaFunctionalTest: string;
  dfmeaPeriodicTest: string;
  dfmeaItems: ProductPresetItemDef[];
  // PFMEA specifics
  pfmeaPhase: string;
  pfmeaSupplier: string;
  pfmeaAssemblyTest: string;
  pfmeaFunctionalTest: string;
  pfmeaPeriodicTest: string;
  pfmeaItems: ProductPresetItemDef[];
}

export const PRODUCT_PRESETS: ProductPreset[] = [
  // ==========================================
  // 1. ĐIỆN TỬ ĐIỆN LẠNH
  // ==========================================
  {
    id: 'dieu_hoa_inverter',
    name: 'Điều hòa không khí Inverter',
    code: 'AC-INV-12K',
    category: 'dien_tu_dien_lanh',
    description: 'Điều hòa 2 chiều Inverter 12.000 BTU, môi chất lạnh Gas R32, tiết kiệm điện 5 sao',
    iconName: 'Wind',
    // DFMEA: Tập trung vào thiết kế kết cấu, vật liệu, tính toán nhiệt, mạch biến tần, độ bền
    dfmeaPhase: 'DV (Design Verification)',
    dfmeaSupplier: 'Phòng R&D Điện Lạnh & Nhà cung cấp máy nén',
    dfmeaAssemblyTest: 'Dung sai lắp ghép vỏ dàn nóng/lạnh, khe hở lồng sóc < 1.2mm',
    dfmeaFunctionalTest: 'Test hiệu suất năng lượng CSPF > 5.2, thời gian làm lạnh phòng 15 phút',
    dfmeaPeriodicTest: 'Thử nghiệm muối biển 1000h dàn tản nhiệt, rung xóc 10G',
    dfmeaItems: [
      {
        componentName: 'Block máy nén Inverter (Twin Rotary)',
        riskIssue: 'Khởi động & Chênh lệch áp suất',
        failureMode: 'Máy nén bị kẹt cơ khí không khởi động được khi tắt bật lại đột ngột',
        cause: 'Áp suất chênh lệch giữa đường hút và đẩy chưa cân bằng trước khi tái khởi động',
        currentControl: 'Cài đặt trễ 3 phút trên vi điều khiển trước khi cho phép kích hoạt lại block',
        S: 8,
        O: 2,
        D: 2,
        action: 'Tích hợp van cân bằng áp suất tự động và thuật toán khởi động mềm (Soft-start) tăng tần số từ từ',
        pic: 'Trần Văn Hoàng (Kỹ sư Máy Nén)',
        result: 'Thử nghiệm ngắt/bật 500 chu kỳ liên tiếp không xảy ra kẹt block'
      },
      {
        componentName: 'Dàn trao đổi nhiệt (Evaporator / Condenser)',
        riskIssue: 'Độ kín môi chất Gas R32',
        failureMode: 'Rò rỉ môi chất lạnh tại mối hàn co ống đồng U-bend',
        cause: 'Độ dày thành ống đồng không đồng đều tại góc uốn gây mỏi kim loại do rung động',
        currentControl: 'Thử áp suất khí nén 4.2 MPa ngâm bể nước phát hiện bọt khí',
        S: 9,
        O: 2,
        D: 2,
        action: 'Tăng chiều dày ống đồng từ 0.65mm lên 0.81mm tại góc uốn, mạ lớp phủ chống ăn mòn Golden Fin',
        pic: 'Nguyễn Văn Toàn (R&D Trao Đổi Nhiệt)',
        result: 'Đạt kiểm định sốc nhiệt -20°C đến 120°C và áp suất phá hủy > 12 MPa'
      },
      {
        componentName: 'Bo mạch biến tần dàn nóng (Outdoor IPM Board)',
        riskIssue: 'Tản nhiệt & Côn trùng xâm nhập',
        failureMode: 'Nổ linh kiện công suất IGBT IPM hoặc báo lỗi E01 khi ngoài trời > 45°C',
        cause: 'Bề mặt tiếp xúc nhôm tản nhiệt chưa tối ưu hoặc thằn lằn, thạch sùng chui vào gây chập chân IC',
        currentControl: 'Cảm biến ngắt quá nhiệt 95°C trên miếng nhôm tản nhiệt',
        S: 8,
        O: 3,
        D: 2,
        action: 'Thiết kế hộp kim loại bọc kín chuẩn IP54, bổ sung lớp đệm tản nhiệt silicon dày 1.5mm có lực ép lò xo định lượng',
        pic: 'Lê Minh Tuấn (Kỹ sư Điện Tử)',
        result: 'Hoạt động liên tục 24/7 ở nhiệt độ môi trường 52°C không giảm tải'
      },
      {
        componentName: 'Máng hứng & Đường thoát nước ngưng',
        riskIssue: 'Thoát nước & Đọng sương',
        failureMode: 'Nước ngưng trào ngược chảy tràn ra mặt tường nhà khách hàng',
        cause: 'Độ dốc rãnh thoát nước máng dàn lạnh không đủ hoặc bị đọng sương bề mặt đáy máng',
        currentControl: 'Thử nghiệm bơm nước lưu lượng 500ml/min kiểm tra tốc độ rút nước',
        S: 6,
        O: 3,
        D: 2,
        action: 'Tăng độ dốc lòng máng từ 1.2° lên 3.0°, lót xốp EPS đúc liền khối chống cầu nhiệt đọng sương',
        pic: 'Phạm Đức Thắng (Thiết kế kết cấu)',
        result: 'Rút cạn nước trong 20 giây ở góc nghiêng lắp đặt lệch ±2 độ'
      },
      {
        componentName: 'Quạt lồng sóc dàn lạnh (Cross-flow Fan)',
        riskIssue: 'Khí động học & Tiếng ồn gió',
        failureMode: 'Quạt phát ra tiếng rít và rung lắc ở cấp tốc độ gió cao (Turbo mode)',
        cause: 'Bước răng nan cánh quạt phân bố đều gây cộng hưởng âm thanh ở dải tần số 1200 Hz',
        currentControl: 'Đo độ ồn buồng tiêu âm chuẩn TCVN',
        S: 5,
        O: 3,
        D: 2,
        action: 'Thiết kế cánh quạt góc nghiêng so le bước răng ngẫu nhiên (Unequal Pitch) triệt tiêu cộng hưởng',
        pic: 'Đặng Tuấn Anh (R&D Khí Động Học)',
        result: 'Độ ồn giảm 3.5 dB(A) ở chế độ Turbo gió mạnh'
      }
    ],
    // PFMEA: Tập trung vào công đoạn sản xuất, gá đặt jig, thông số hàn, nạp gas, kiểm tra cao áp, siết lực
    pfmeaPhase: 'PV (Process Validation) / Sản xuất thử nghiệm',
    pfmeaSupplier: 'Phân xưởng Lắp Ráp Điện Lạnh & Tổ Hàn Ống Đồng',
    pfmeaAssemblyTest: 'Test lực siết bu-lông gá lốc máy 18 ± 1.5 N.m, kiểm tra khớp nối lẫy nhựa',
    pfmeaFunctionalTest: 'Test chân không < 30 Pa, nạp tự động gas R32 680g ± 5g, test cao áp 1800V/2s',
    pfmeaPeriodicTest: 'Audit kiểm tra máy ngửi Heli ngẫu nhiên 3 sản phẩm/ca sản xuất',
    pfmeaItems: [
      {
        componentName: 'Công đoạn Hàn kết nối ống đồng (Brazing Station)',
        riskIssue: 'Mối hàn rỗ khí & Cháy ngấu ống',
        failureMode: 'Mối hàn ống đồng bị rỗ khí hoặc không ngấu kín gây xì gas vi mô khi sử dụng',
        cause: 'Nhiệt độ mỏ hàn gas Oxy-Gas chưa đủ 650°C hoặc công nhân rút mỏ hàn quá nhanh trước khi que hàn bạc điền đầy',
        currentControl: 'Kiểm tra mắt thường 100% và thử kín áp suất khí Nitơ 4.0 MPa trong bể ngâm nước',
        S: 9,
        O: 3,
        D: 3,
        action: 'Lắp đặt máy hàn tự động quay vòng có kiểm soát thời gian gia nhiệt và nhiệt độ hồng ngoại, thổi khí Nitơ bảo vệ lòng ống',
        pic: 'Nguyễn Văn Cường (Quản đốc xưởng hàn)',
        result: 'Tỷ lệ lỗi rò rỉ mối hàn giảm từ 1.8% xuống dưới 0.05%'
      },
      {
        componentName: 'Công đoạn Hút chân không & Nạp Gas R32',
        riskIssue: 'Lượng gas danh định & Độ ẩm đường ống',
        failureMode: 'Áp suất hút chân không không đạt độ sâu hoặc lượng nạp gas sai lệch quá ±20g',
        cause: 'Đầu nối nhanh bị hở gioăng hoặc cảm biến lưu lượng máy nạp gas bị trôi sai số chưa hiệu chuẩn',
        currentControl: 'Hệ thống máy nạp tự động báo đèn đỏ còi hú khi áp chân không > 50 Pa',
        S: 8,
        O: 2,
        D: 2,
        action: 'Bảo trì thay gioăng đầu nối định kỳ 7 ngày/lần, trang bị cân điện tử kiểm chứng khối lượng nạp sau mỗi ca',
        pic: 'Vũ Đình Toàn (Kỹ sư Quá Trình QC)',
        result: 'Độ chính xác nạp gas đạt ±3g ổn định trên 10.000 sản phẩm'
      },
      {
        componentName: 'Công đoạn Lắp đặt máy nén & Siết ốc chân đế',
        riskIssue: 'Mô-men xoắn siết lực (Torque Control)',
        failureMode: 'Ốc chân đế bị lỏng hoặc siết quá lực làm bẹp cao su giảm chấn gây rung lắc vỏ máy',
        cause: 'Công nhân sử dụng súng siết hơi thông thường không kiểm soát được dải mô-men',
        currentControl: 'KCS kiểm tra xác suất bằng cần xiết lực cơ khí',
        S: 6,
        O: 3,
        D: 2,
        action: 'Trang bị súng siết lực điện tử Servo ngắt tự động ở 18 N.m có lưu trữ dữ liệu Poka-Yoke truyền về máy chủ',
        pic: 'Hoàng Quốc Việt (Kỹ sư ME)',
        result: 'Triệt tiêu 100% lỗi lỏng ốc hoặc nứt chân đế máy nén'
      },
      {
        componentName: 'Công đoạn Thử nghiệm an toàn điện (Hipot / Ground / Leakage)',
        riskIssue: 'Cách điện & An toàn điện giật',
        failureMode: 'Dây dẫn điện bị cạnh tôn sắc cứa đứt vỏ cách điện lọt qua khâu đóng gói',
        cause: 'Công nhân luồn dây qua vách ngăn tôn không lắp vòng cao su bảo vệ grommet',
        currentControl: 'Máy thử cao áp Hipot 1800V/2s ngắt tự động nếu dòng rò rỉ > 5mA',
        S: 10,
        O: 2,
        D: 1,
        action: 'Dập dập gân cuốn mép tròn (Hemming) trên toàn bộ lỗ luồn dây của khung tôn, tích hợp camera AI phát hiện thiếu vòng đệm cao su',
        pic: 'Trần Văn Mạnh (Trưởng ban An Toàn)',
        result: 'Không còn cạnh sắc kim loại, đạt chuẩn an toàn điện IEC 60335-2-40'
      },
      {
        componentName: 'Công đoạn Chạy thử buồng cách âm (Acoustic Chamber Test)',
        riskIssue: 'Độ ồn vận hành & Va chạm cơ khí',
        failureMode: 'Đường ống đồng bị rung đập vào tôn vỏ dàn nóng khi máy nén tăng tốc',
        cause: 'Gá định vị ống đồng bị bẻ lệch hướng trong quá trình luồn tay thao tác',
        currentControl: 'Kỹ thuật viên nghe âm thanh trong buồng cách âm 45 giây',
        S: 6,
        O: 3,
        D: 2,
        action: 'Làm đồ gá định hình vị trí uốn ống trước khi vào chuyền, bọc đệm xốp chống rung tại các điểm tiếp xúc gần vách tôn',
        pic: 'Đặng Tuấn Anh (Kỹ sư Sản Xuất)',
        result: 'Đạt 100% kiểm tra rung âm không có tạp âm cơ khí'
      }
    ]
  },

  {
    id: 'tu_lanh_multidoor',
    name: 'Tủ lạnh Inverter Multi-Door',
    code: 'RF-INV-450L',
    category: 'dien_tu_dien_lanh',
    description: 'Tủ lạnh 4 cánh dung tích 450L, công nghệ cấp đông mềm -3°C, hai dàn lạnh độc lập',
    iconName: 'Refrigerator',
    dfmeaPhase: 'DV (Design Verification)',
    dfmeaSupplier: 'Phòng R&D Tủ Lạnh & NCC Dàn Lạnh',
    dfmeaAssemblyTest: 'Độ phẳng cửa tủ, lực hút gioăng từ quanh chu vi cửa > 15N',
    dfmeaFunctionalTest: 'Test làm lạnh ngăn đá < -18°C trong 120 phút, tiêu thụ điện < 1.1 kWh/ngày',
    dfmeaPeriodicTest: 'Thử nghiệm mở đóng cửa 100.000 lần, test lão hóa gioăng cao su',
    dfmeaItems: [
      {
        componentName: 'Cửa tủ & Gioăng đệm nam châm (Door Gasket)',
        riskIssue: 'Kín khí & Cách nhiệt',
        failureMode: 'Hở gioăng cửa gây đọng sương mép tủ và bám tuyết dày đặc trên dàn lạnh',
        cause: 'Lực hút từ tính của hạt nam châm bên trong đệm PVC không đồng đều hoặc gioăng bị co rút nhiệt',
        currentControl: 'Kiểm tra khe hở bằng thước lá 0.2mm luồn quanh chu vi mép cửa',
        S: 7,
        O: 2,
        D: 2,
        action: 'Thiết kế gioăng đệm 4 khoang đệm khí tăng tính đàn hồi, tích hợp dây sưởi điện trở chống đọng sương âm trong thành tủ',
        pic: 'Trần Văn Hoàng (R&D Tủ Lạnh)',
        result: 'Độ kín khít tuyệt đối, không đọng sương ở độ ẩm môi trường 90% RH'
      },
      {
        componentName: 'Hệ thống xả đá tự động (Defrost System)',
        riskIssue: 'Làm lạnh & Xả tuyết',
        failureMode: 'Thanh điện trở xả đá bị cháy đứt làm tuyết đóng kín dàn lạnh mất khả năng lưu thông gió',
        cause: 'Cọc đốt xả đá bằng thủy tinh thạch anh bị sốc nhiệt nứt vỡ khi nước rã đông rơi trúng',
        currentControl: 'Cầu chì nhiệt xả đá TCO ngắt ở 72°C',
        S: 8,
        O: 2,
        D: 2,
        action: 'Chuyển sang thanh sưởi vỏ nhôm đúc nguyên khối chống nước IP67 kèm máng hứng bảo vệ chống nhỏ giọt',
        pic: 'Nguyễn Văn Toàn (Kỹ sư Hệ Thống Lạnh)',
        result: 'Tuổi thọ xả đá đạt trên 10.000 chu kỳ thử nghiệm tăng tốc'
      },
      {
        componentName: 'Quạt đối lưu gió ngăn đông (BLDC Evaporator Fan)',
        riskIssue: 'Lưu thông luồng khí',
        failureMode: 'Quạt bị bó kẹt bởi đá dăm hình thành trong khoang thổi gió',
        cause: 'Khe hở giữa cánh quạt và vách nhựa quá hẹp (< 3mm) khi nước đọng đóng băng',
        currentControl: 'Kiểm tra vận tốc quay của quạt qua tín hiệu phản hồi FG',
        S: 8,
        O: 2,
        D: 2,
        action: 'Tăng khoảng cách khe hở cánh quạt lên 6mm, phủ lớp kỵ nước Hydrophobic lên bề mặt cánh quạt',
        pic: 'Phạm Đức Thắng (Thiết kế chi tiết)',
        result: 'Cánh quạt quay trơn tru không bị bó kẹt sau 30 ngày test thử thách lạnh âm sâu'
      }
    ],
    pfmeaPhase: 'PV (Process Validation)',
    pfmeaSupplier: 'Xưởng Đúc Nhựa & Bơm Bọt Xốp Polyurethane',
    pfmeaAssemblyTest: 'Dung sai lắp cánh tủ lệch mép < 1.0mm, lực hút nam châm đồng đều 4 góc',
    pfmeaFunctionalTest: 'Test rò rỉ gas bằng buồng hút chân không Heli, test tự ngắt máy nén theo cảm biến nhiệt',
    pfmeaPeriodicTest: 'Cắt kiểm tra mật độ bọt xốp foam 1 tủ/lô sản xuất',
    pfmeaItems: [
      {
        componentName: 'Công đoạn Bơm bọt xốp cách nhiệt (PU Foaming)',
        riskIssue: 'Cách nhiệt thân tủ',
        failureMode: 'Thân tủ bị phồng rộp biến dạng hoặc xuất hiện khoang rỗng (Air void) bên trong vách xốp',
        cause: 'Nhiệt độ khuôn sấy trước khi bơm foam chưa đạt 45°C hoặc tỷ lệ trộn Cyclopentane và Polyol bị lệch',
        currentControl: 'Cảm biến hồng ngoại kiểm soát nhiệt độ đồ gá khuôn sấy tự động',
        S: 8,
        O: 2,
        D: 2,
        action: 'Hiệu chuẩn đầu trộn cao áp tự động hàng ca, kiểm soát thời gian lưu khuôn tối thiểu 8 phút trước khi mở gá',
        pic: 'Vũ Đình Toàn (Kỹ sư Hóa Chất Foam)',
        result: 'Mật độ xốp foam đồng đều 34-36 kg/m3, triệt tiêu 100% bọng khí'
      },
      {
        componentName: 'Công đoạn Lắp bản lề cửa tủ trên dưới',
        riskIssue: 'Độ đồng phẳng & Khe hở mép cửa',
        failureMode: 'Cánh tủ bị xệ hoặc mép hai cánh không thẳng hàng lệch quá 2mm',
        cause: 'Lực vặn bu-lông bản lề bị xô lệch vị trí khi công nhân thao tác bằng tay',
        currentControl: 'Dưỡng đo kiểm tra bậc chênh lệch mép cửa KCS 100%',
        S: 6,
        O: 3,
        D: 2,
        action: 'Thiết kế chốt định vị gá lắp bản lề trên khuôn dập tôn vỏ tủ và súng siết lực cố định vị trí',
        pic: 'Hoàng Quốc Việt (Tổ trưởng gá lắp)',
        result: 'Độ lệch mép cánh tủ kiểm soát dưới 0.6mm'
      }
    ]
  },

  {
    id: 'tivi_smart_4k',
    name: 'Smart Tivi 4K Ultra HD',
    code: 'TV-4K-55INCH',
    category: 'dien_tu_dien_lanh',
    description: 'Smart TV 55 inch viền siêu mỏng, tấm nền 4K 120Hz, bộ xử lý hình ảnh AI Engine, âm thanh Dolby',
    iconName: 'Tv',
    dfmeaPhase: 'DV (Thiết kế mẫu)',
    dfmeaSupplier: 'Phòng R&D Thiết bị Nghe Nhìn & NCC Panel Màn Hình',
    dfmeaAssemblyTest: 'Dung sai ép viền Bezel < 0.5mm, tản nhiệt chip SoC < 75°C',
    dfmeaFunctionalTest: 'Test hiển thị độ sáng 500 nits, không điểm chết pixel, HDR10+, kết nối Wi-Fi 6',
    dfmeaPeriodicTest: 'Test bật tắt màn hình 20.000 lần, test nhiệt ẩm 60°C/90%RH 500h',
    dfmeaItems: [
      {
        componentName: 'Tấm nền hiển thị Panel 4K & Đèn nền Mini-LED',
        riskIssue: 'Đốm sáng & Hở sáng viền',
        failureMode: 'Màn hình bị hở sáng ở 4 góc hoặc xuất hiện quầng sáng không đồng đều',
        cause: 'Ứng suất nén ép cơ khí của khung viền nhôm tác động lên mép tấm nền tinh thể lỏng LCD',
        currentControl: 'Kiểm tra quang học tự động AOI trong phòng tối',
        S: 7,
        O: 2,
        D: 2,
        action: 'Thiết kế đệm mút xốp viền silicon có tính đàn hồi cao và khe hở giãn nở nhiệt 0.8mm',
        pic: 'Trần Văn Mạnh (Kỹ sư Quang Học)',
        result: 'Độ đồng đều ánh sáng đạt > 92%, không hở sáng viền'
      },
      {
        componentName: 'Bo mạch nguồn công suất SMPS (Power Supply Unit)',
        riskIssue: 'Tương thích điện từ EMC & Tuổi thọ tụ',
        failureMode: 'Tivi tự khởi động lại hoặc có tiếng rít biến áp xung khi bật chế độ sáng cực đại',
        cause: 'Tụ hóa lọc nguồn đầu ra bị sụt dung lượng do nhiệt độ gần tấm tản nhiệt vượt quá 105°C',
        currentControl: 'Đo phổ bức xạ điện từ EMC và kiểm tra ripple áp',
        S: 8,
        O: 2,
        D: 2,
        action: 'Bố trí quạt tản nhiệt thông minh và chuyển sang tụ rắn polymer tuổi thọ cao chịu nhiệt 125°C',
        pic: 'Lê Minh Tuấn (Kỹ sư Điện Tử)',
        result: 'Ripple áp < 50mVp-p, đạt chuẩn chống nhiễu CISPR 32'
      }
    ],
    pfmeaPhase: 'PV (Sản xuất thử nghiệm)',
    pfmeaSupplier: 'Xưởng Lắp Ráp Điện Tử Phòng Sạch Class 10.000',
    pfmeaAssemblyTest: 'Kiểm tra lực ép khung viền, kiểm tra khớp nối cáp FFC/LVDS',
    pfmeaFunctionalTest: 'Test tự động 100% điểm chết pixel bằng camera phân giải cao, test cổng HDMI/USB',
    pfmeaPeriodicTest: 'Thử rơi tự do thùng đóng gói độ cao 80cm',
    pfmeaItems: [
      {
        componentName: 'Công đoạn Dán cáp dẹt màn hình (COF / TAB Bonding)',
        riskIssue: 'Tiếp xúc tín hiệu hiển thị',
        failureMode: 'Màn hình bị sọc kẻ chỉ dọc hoặc mất một mảng hình ảnh',
        cause: 'Nhiệt độ và áp suất ép nhiệt keo dẫn điện dị hướng ACF không đạt thông số chuẩn',
        currentControl: 'Kiểm tra hiển thị mẫu màu RGB tự động 100%',
        S: 8,
        O: 2,
        D: 2,
        action: 'Bảo dưỡng và hiệu chuẩn định kỳ đầu dao ép nhiệt tự động, giám sát lực ép bằng load-cell',
        pic: 'Nguyễn Văn Cường (Kỹ thuật phòng sạch)',
        result: 'Tỷ lệ lỗi sọc màn hình giảm xuống dưới 0.02%'
      }
    ]
  },

  // ==========================================
  // 2. ĐIỆN GIA DỤNG
  // ==========================================
  {
    id: 'quat_cay_livotec',
    name: 'Quạt cây đứng Livotec S-400',
    code: 'S-400',
    category: 'dien_gia_dung',
    description: 'Quạt đứng gia dụng 5 cánh AS, động cơ B4 bọc kín, đảo gió 90 độ, nút bấm cơ khí 3 tốc độ',
    iconName: 'Fan',
    dfmeaPhase: 'DV (Design Verification)',
    dfmeaSupplier: 'Phòng R&D Điện Gia Dụng Livotec',
    dfmeaAssemblyTest: 'Dung sai lắp gá động cơ & cổ quạt, khe hở lồng quạt an toàn ngón tay < 10mm',
    dfmeaFunctionalTest: 'Lưu lượng gió > 65 m3/min, độ ồn < 55 dB, độ tăng nhiệt cuộn dây Delta T < 65K',
    dfmeaPeriodicTest: 'Thử nghiệm độ bền 5000 giờ liên tục, thử rung lắc lồng cánh',
    dfmeaItems: [
      {
        componentName: 'Cụm Động cơ B4',
        riskIssue: 'Hoạt động & Quá nhiệt',
        failureMode: 'Động cơ bị dừng quay, phát nhiệt cao cháy cầu chì nhiệt',
        cause: 'Kẹt trục quay bạc thau do bụi bẩn bám dính hoặc dầu bôi trơn bị khô bay hơi',
        currentControl: 'Rơ le nhiệt bảo vệ ngắt ở 115°C',
        S: 8,
        O: 2,
        D: 2,
        action: 'Dùng bạc thau tẩm dầu bột kim loại thiêu kết chứa dầu bôi trơn vĩnh cửu kèm phớt dạ chặn dầu hai đầu',
        pic: 'Nguyễn Văn Toàn',
        result: 'Đạt kiểm định 5000 giờ chạy liên tục ở nhiệt độ phòng 40°C không kẹt trục'
      },
      {
        componentName: 'Cánh quạt 5 lá AS',
        riskIssue: 'Độ ồn & Cân bằng động',
        failureMode: 'Cánh quay gây rung giật mạnh thân quạt và phát tiếng ồn rít gió',
        cause: 'Độ dày các lá cánh không đều nhau do co ngót khuôn nhựa gây mất cân bằng động',
        currentControl: 'Kiểm tra cân bằng động trên đồ gá quay',
        S: 5,
        O: 3,
        D: 2,
        action: 'Tối ưu độ dày gân cánh quạt từ 2.2mm lên 2.8mm, kiểm soát sai số cân bằng động < 0.2g trên máy đo laser',
        pic: 'Hoàng Quốc Việt',
        result: 'Rung động giảm 60%, độ ồn gió đạt dưới 52 dB(A)'
      },
      {
        componentName: 'Khớp nâng hạ cổ quạt & Lò xo ống thân',
        riskIssue: 'Cơ khí nâng hạ chiều cao',
        failureMode: 'Cột quạt bị tụt tụt xuống vị trí thấp nhất khi mở khóa nới lỏng ốc siết',
        cause: 'Lò xo nén trợ lực bên trong ống thân có lực đẩy yếu không đỡ nổi trọng lượng cụm đầu quạt',
        currentControl: 'Kiểm tra lực nén lò xo bằng tay',
        S: 6,
        O: 3,
        D: 2,
        action: 'Tăng đường kính sợi thép lò xo từ 2.0mm lên 2.6mm bằng thép 65Mn nhiệt luyện đàn hồi cao F=45N',
        pic: 'Đặng Tuấn Anh',
        result: 'Ống thân nâng hạ êm ái, không bị rơi gục bất ngờ'
      }
    ],
    pfmeaPhase: 'PV (Sản xuất hàng loạt)',
    pfmeaSupplier: 'Phân xưởng Lắp Ráp Quạt Điện',
    pfmeaAssemblyTest: 'Test lực vặn núm khóa cánh ren ngược, lực siết vành đai lồng quạt',
    pfmeaFunctionalTest: 'Test tốc độ gió 3 cấp, test góc quay tuốc-năng 90 độ, test cách điện 1500V',
    pfmeaPeriodicTest: 'Audit kiểm tra ngẫu nhiên độ lệch tâm cánh 5 quạt/ca',
    pfmeaItems: [
      {
        componentName: 'Công đoạn Cân bằng động cánh quạt',
        riskIssue: 'Cân bằng động cánh',
        failureMode: 'Cánh quạt bị lệch tâm > 0.5g lọt vào chuyền lắp ráp gây rung lắc',
        cause: 'Công nhân không kẹp chặt chốt giữ tâm cánh trên máy cân bằng động trước khi bấm đo',
        currentControl: 'Máy đo cân bằng động tự động báo đèn Xanh/Đỏ',
        S: 6,
        O: 3,
        D: 2,
        action: 'Cài đặt chốt khóa khí nén tự động trên máy cân bằng động, máy chỉ kích hoạt khi đã kẹp đủ áp lực',
        pic: 'Trần Văn Mạnh',
        result: '100% cánh quạt qua chuyền đều có độ lệch < 0.15g'
      },
      {
        componentName: 'Công đoạn Luồn dây điện nguồn qua ống thân',
        riskIssue: 'An toàn cách điện',
        failureMode: 'Cạnh sắc kim loại ống thân cứa xước vỏ bọc dây điện nguồn 220V',
        cause: 'Miệng ống thép sau khi cắt chưa được mài vát mép bavia cẩn thận',
        currentControl: 'Máy test cao áp 1500V ngắt tự động nếu rò điện',
        S: 10,
        O: 2,
        D: 2,
        action: 'Bổ sung đầu chụp nhựa bo tròn viền tại 2 đầu miệng ống thép trước khi công nhân thao tác luồn cáp',
        pic: 'Nguyễn Văn Toàn',
        result: 'Không còn hiện tượng trầy xước dây điện, đạt chuẩn an toàn TCVN 5699-2-80'
      }
    ]
  },

  {
    id: 'noi_com_ih',
    name: 'Nồi cơm điện cao tần IH',
    code: 'RC-IH-18',
    category: 'dien_gia_dung',
    description: 'Nồi cơm điện từ cao tần IH 1.8L, lòng nồi niêu hợp kim đa lớp phủ Greblon, điều khiển cảm ứng',
    iconName: 'CookingPot',
    dfmeaPhase: 'DV (Design Verification)',
    dfmeaSupplier: 'Phòng R&D Nồi Cơm Điện & NCC Bo Mạch IH',
    dfmeaAssemblyTest: 'Khe hở mâm từ và đáy lòng nồi < 0.5mm, độ phẳng vành nắp nồi',
    dfmeaFunctionalTest: 'Nấu cơm chín đều trong 35 phút, giữ ấm 24h không thiu không khô cơm',
    dfmeaPeriodicTest: 'Thử nghiệm nấu 1000 mẻ liên tục, kiểm tra độ bám dính lớp men chống dính',
    dfmeaItems: [
      {
        componentName: 'Lòng nồi niêu hợp kim đa lớp',
        riskIssue: 'Chống dính & Dẫn từ',
        failureMode: 'Lớp chống dính bị phồng rộp bong tróc sau 6 tháng sử dụng cọ rửa',
        cause: 'Xử lý bề mặt nhôm đúc trước khi phun sơn chống dính chưa đạt độ nhám Ra tiêu chuẩn',
        currentControl: 'Test độ bám dính bằng dao cắt mắt lưới Cross-hatch và ngâm nước muối sôi',
        S: 8,
        O: 2,
        D: 2,
        action: 'Xử lý phun bi cát tạo vi cấu trúc neo bám cơ học, sử dụng lớp phủ Ceramic Daikin 2 lớp không PFOA',
        pic: 'Trần Văn Hoàng (R&D Vật Liệu)',
        result: 'Đạt kiểm định 10.000 lần cọ rửa búi cước không bong tróc'
      },
      {
        componentName: 'Cụm van xả áp hơi nước thông minh',
        riskIssue: 'Thoát hơi & Chống trào',
        failureMode: 'Nước cháo/cơm bị trào ra ngoài nắp nồi gây bẩn và chập mạch điện tử',
        cause: 'Tiết diện lỗ thoát hơi quá nhỏ hoặc bi van xả áp bị kẹt bọt tinh bột gạo',
        currentControl: 'Nấu thử nghiệm gạo dẻo ST25 ở mức nước tối đa',
        S: 7,
        O: 3,
        D: 2,
        action: 'Thiết kế buồng bẫy bọt tinh bột hai tầng có thể tháo rời vệ sinh dễ dàng, van đối trọng tự mở',
        pic: 'Phạm Đức Thắng (Thiết kế kết cấu)',
        result: 'Chống trào 100% khi nấu cháo và cơm ở mức nước Max'
      }
    ],
    pfmeaPhase: 'PV (Sản xuất thử nghiệm)',
    pfmeaSupplier: 'Xưởng Lắp Ráp Thiết Bị Nhà Bếp',
    pfmeaAssemblyTest: 'Kiểm tra độ kín gioăng nắp nồi, lực ấn phím cảm ứng',
    pfmeaFunctionalTest: 'Test nhận diện lòng nồi IH, test công suất nấu cực đại 1300W',
    pfmeaPeriodicTest: 'Test sốc điện áp xung 2000V trên đường nguồn AC',
    pfmeaItems: [
      {
        componentName: 'Công đoạn Lắp đặt mâm từ cảm ứng IH',
        riskIssue: 'Khoảng cách cảm ứng điện từ',
        failureMode: 'Khoảng cách giữa cuộn dây từ IH và đáy nồi không đều gây cháy cơm cục bộ',
        cause: 'Lò xo đội mâm từ bị xô lệch vị trí khi siết ốc cố định',
        currentControl: 'Kiểm tra khe hở bằng dưỡng đo KCS',
        S: 7,
        O: 3,
        D: 2,
        action: 'Chế tạo đồ gá ép định vị 3 điểm tự cân bằng mâm từ trước khi siết ốc bằng súng lực tự động',
        pic: 'Hoàng Quốc Việt (Kỹ sư ME)',
        result: 'Khe hở đáy nồi và cuộn dây đồng đều chính xác 0.4 ± 0.05 mm'
      }
    ]
  },

  // ==========================================
  // 3. BỒN NƯỚC & THIẾT BỊ NHIỆT
  // ==========================================
  {
    id: 'binh_nong_lanh_30l',
    name: 'Bình nước nóng gián tiếp 30L',
    code: 'WH-30L-TITAN',
    category: 'bon_nuoc',
    description: 'Bình nước nóng gián tiếp 30L ruột tráng men Titanium, cọc đốt Incoloy 800, rơ le kép ngắt nhiệt, ELCB',
    iconName: 'Droplets',
    dfmeaPhase: 'DV (Design Verification)',
    dfmeaSupplier: 'Phòng R&D Thiết Bị Nhiệt & NCC Cọc Đốt Incoloy',
    dfmeaAssemblyTest: 'Dung sai mối ghép ruột bình & vỏ ngoài, độ kín gioăng mặt bích cọc đốt',
    dfmeaFunctionalTest: 'Thời gian đun nóng từ 20°C lên 75°C trong 25 phút, độ giữ nhiệt 48h suy giảm < 15°C',
    dfmeaPeriodicTest: 'Thử nghiệm áp suất phá hủy ruột bình > 25 bar, thử chu kỳ áp lực 100.000 lần',
    dfmeaItems: [
      {
        componentName: 'Ruột bình thép tráng men Titanium',
        riskIssue: 'Chống ăn mòn & Áp lực nước',
        failureMode: 'Ruột bình bị thủng rò rỉ nước sau 2-3 năm sử dụng tại nguồn nước giếng khoan',
        cause: 'Lớp men tráng bị bọt khí tế vi để lộ chân kim loại bị ion Cl- trong nước ăn mòn điện hóa',
        currentControl: 'Soi kiểm tra khuyết tật bề mặt men bằng que quét tia lửa điện cao tần 2500V',
        S: 9,
        O: 2,
        D: 2,
        action: 'Áp dụng công nghệ tráng men Titanium tĩnh điện khô 3 lớp nung 860°C, bổ sung thanh Magie kích thước lớn D22x300mm',
        pic: 'Trần Văn Hoàng (R&D Vật Liệu Nhiệt)',
        result: 'Vượt qua bài test phun sương muối axit 1500 giờ không có vết ăn mòn'
      },
      {
        componentName: 'Cọc đốt gia nhiệt (Incoloy 800 Heating Element)',
        riskIssue: 'An toàn điện & Cách điện ngâm nước',
        failureMode: 'Cọc đốt bị nứt vỏ ống kim loại gây rò điện 220V trực tiếp ra dòng nước tắm',
        cause: 'Bột cách điện Magie Oxit (MgO) bên trong ống bị ẩm hoặc cặn canxi bám dày gây quá nhiệt cục bộ',
        currentControl: 'Thử điện áp cao 2500V ngâm trong nước muối và đo dòng rò < 0.25mA',
        S: 10,
        O: 1,
        D: 2,
        action: 'Sử dụng vỏ ống hợp kim Incoloy 800 siêu bền chống bám cặn, tích hợp thiết bị chống giật ELCB lưỡng cực ngắt dòng rò 15mA trong 0.03s',
        pic: 'Nguyễn Văn Toàn (Kỹ sư An Toàn Điện)',
        result: 'Đạt chứng nhận an toàn quốc tế IEC 60335-2-21'
      },
      {
        componentName: 'Rơ le nhiệt lưỡng kim 2 cấp bảo vệ',
        riskIssue: 'Kiểm soát nhiệt độ nước',
        failureMode: 'Nước đun quá nhiệt độ sôi sinh áp suất cao gây nổ bình khi rơ le điều nhiệt bị dính tiếp điểm',
        cause: 'Hồ quang điện làm cháy dính tiếp điểm rơ le nhiệt sau nhiều chu kỳ đóng cắt dòng điện 11A',
        currentControl: 'Cài đặt rơ le an toàn cấp 2 tự động nảy chốt cơ khí ngắt cả 2 pha ở 93°C',
        S: 10,
        O: 1,
        D: 2,
        action: 'Sử dụng rơ le Cotherm nhập khẩu Pháp có dải tiếp điểm mạ bạc dầy, cơ cấu ngắt cưỡng bức độc lập',
        pic: 'Lê Minh Tuấn (Kỹ sư Điện)',
        result: 'Đạt thử nghiệm đóng cắt 100.000 lần liên tục tải điện 2500W'
      }
    ],
    pfmeaPhase: 'PV (Process Validation)',
    pfmeaSupplier: 'Xưởng Sản Xuất Bình Nước Nóng',
    pfmeaAssemblyTest: 'Kiểm tra siết ốc mặt bích 5 bu-lông lực 12 N.m, kiểm tra ngàm gắn rơ le',
    pfmeaFunctionalTest: 'Thử áp suất thủy tĩnh ruột bình 12 bar ngâm 60 giây, test ngắt ELCB',
    pfmeaPeriodicTest: 'Kiểm tra độ bám dính men tráng bằng thử nghiệm uốn mẫu thép',
    pfmeaItems: [
      {
        componentName: 'Công đoạn Hàn tự động thân và nắp ruột bình (TIG/Plasma)',
        riskIssue: 'Kín áp lực nước 12 bar',
        failureMode: 'Mối hàn chu vi nắp ruột bình bị nứt tế vi gây rò rỉ nước khi thử áp suất',
        cause: 'Khí Argon bảo vệ mối hàn bị gió thổi tạt làm oxi hóa xỉ hàn hoặc dòng hàn không ổn định',
        currentControl: 'Buồng thử áp suất nước 12 bar có đồng hồ đo áp tự động ghi nhận',
        S: 8,
        O: 2,
        D: 1,
        action: 'Trang bị buồng hàn kín chắn gió tự động có cánh tay robot dẫn hướng mối hàn bằng laser quang học',
        pic: 'Nguyễn Văn Cường (Quản đốc xưởng hàn)',
        result: '100% ruột bình đạt kiểm tra áp lực 12 bar không rò rỉ'
      },
      {
        componentName: 'Công đoạn Bơm bọt cách nhiệt Polyurethane (PU Foaming)',
        riskIssue: 'Giữ nhiệt nước nóng',
        failureMode: 'Lớp xốp cách nhiệt bị xẹp lún hoặc không điền đầy quanh cổ cọc đốt làm thoát nhiệt nhanh',
        cause: 'Áp lực súng phun foam bị tụt hoặc lỗ xả khí trên vỏ bình bị bít kín',
        currentControl: 'Cân kiểm tra trọng lượng foam bơm vào vỏ và đo độ dày xốp',
        S: 6,
        O: 2,
        D: 2,
        action: 'Tự động hóa chu trình bơm foam bằng máy áp lực cao KraussMaffei kiểm soát nhiệt độ đồ gá 45°C',
        pic: 'Vũ Đình Toàn (Kỹ sư Quá Trình)',
        result: 'Độ giữ nhiệt đạt chuẩn nhãn năng lượng hiệu suất cao (Tiết kiệm điện cấp 5)'
      }
    ]
  },

  {
    id: 'bon_nuoc_inox_304',
    name: 'Bồn nước Inox 304 Tân Á Đại Thành',
    code: 'ST-INOX-1000L',
    category: 'bon_nuoc',
    description: 'Bồn nước Inox 304 dung tích 1000L đứng, gân lốc kép chịu lực, nắp khóa an toàn chống gió bão',
    iconName: 'ShieldCheck',
    dfmeaPhase: 'DV (Design Verification)',
    dfmeaSupplier: 'Phòng R&D Bồn Inox & Nhà cung cấp thép tấm POSCO',
    dfmeaAssemblyTest: 'Dung sai lốc tròn thân bồn, khe hở chân đế ôm sát thân bồn',
    dfmeaFunctionalTest: 'Chứa đầy tải 1000kg nước ngọt, không phình đáy, không rỉ mối hàn',
    dfmeaPeriodicTest: 'Thử nghiệm gió bão giật cấp 12 có giằng neo, test ăn mòn muối 500h',
    dfmeaItems: [
      {
        componentName: 'Thân bồn & Gân tăng cứng chịu lực',
        riskIssue: 'Biến dạng khi đầy nước',
        failureMode: 'Thân bồn bị phình to hoặc móp méo khi xả nước với lưu lượng lớn',
        cause: 'Số lượng và chiều sâu gân lốc chưa đủ để chịu áp lực thủy tĩnh của cột nước 1.5m',
        currentControl: 'Kiểm tra độ võng thân bồn khi bơm đầy nước bằng đồng hồ so',
        S: 7,
        O: 2,
        D: 2,
        action: 'Thiết kế cụm gân kép lốc nổi sâu 12mm phân bố đều theo chiều cao thân bồn, dùng Inox SUS304 dày 0.6mm',
        pic: 'Trần Văn Hoàng (Kỹ sư Kết Cấu Bồn)',
        result: 'Độ biến dạng phình thân giảm 75%, đạt tiêu chuẩn áp lực thủy tĩnh'
      },
      {
        componentName: 'Mối hàn lăn Seam ghép mí thân bồn',
        riskIssue: 'Độ kín nước',
        failureMode: 'Rò rỉ nước nhỏ giọt dọc theo đường hàn lăn mí thân bồn',
        cause: 'Bề mặt mép tôn inox dính dầu cán hoặc bước xung hàn lăn quá thưa gây hở điểm hàn',
        currentControl: 'Kiểm tra kín nước bằng thẩm thấu chất chỉ thị màu hoặc thử áp suất khí 0.2 MPa',
        S: 8,
        O: 2,
        D: 2,
        action: 'Tẩy rửa tẩy dầu mép hàn bằng cồn công nghiệp, cài đặt máy hàn lăn tự động biến tần điều chỉnh tần số theo độ dày tôn',
        pic: 'Nguyễn Văn Cường (Kỹ thuật xưởng hàn)',
        result: 'Mối hàn đồng nhất, ngấu sâu kín 100% không khuyết tật'
      }
    ],
    pfmeaPhase: 'PV (Sản xuất)',
    pfmeaSupplier: 'Xưởng Cán Lốc & Hàn Inox',
    pfmeaAssemblyTest: 'Kiểm tra độ tròn thân bồn, kiểm tra mối tán đinh chân đế U',
    pfmeaFunctionalTest: 'Test áp suất khí 0.2 MPa kiểm tra bọt xà phòng mối hàn 100%',
    pfmeaPeriodicTest: 'Kiểm tra độ bền kéo mối hàn mẫu inox định kỳ',
    pfmeaItems: [
      {
        componentName: 'Công đoạn Cán lốc tạo sóng gân thân bồn',
        riskIssue: 'Chất lượng bề mặt inox',
        failureMode: 'Trục lô cán bị xước gây vết lằn xước màng bảo vệ làm rách hoặc gỉ sét bồn sau này',
        cause: 'Mạt kim loại bám dính trên bề mặt trục lô cán chưa được vệ sinh sạch',
        currentControl: 'Kiểm tra ngoại quan bề mặt inox sau khi lốc',
        S: 6,
        O: 3,
        D: 2,
        action: 'Bọc lớp nhựa PU chống xước trên quả lô cán và lắp chổi gạt lau bụi tự động làm sạch liên tục',
        pic: 'Hoàng Quốc Việt (Quản đốc xưởng cán)',
        result: 'Bề mặt bồn sáng bóng BA/2B không có bất kỳ vết xước kim loại nào'
      }
    ]
  },

  // ==========================================
  // 4. THIẾT BỊ NHÀ BẾP
  // ==========================================
  {
    id: 'bep_tu_doi_inverter',
    name: 'Bếp từ đôi Inverter Booster',
    code: 'IC-INV-4000W',
    category: 'thiet_bi_nha_bep',
    description: 'Bếp từ đôi 2 vùng nấu công suất 4000W, mặt kính gốm Ceramic Schott Ceran, công nghệ Inverter liên tục',
    iconName: 'Flame',
    dfmeaPhase: 'DV (Design Verification)',
    dfmeaSupplier: 'Phòng R&D Bếp Từ & NCC Mặt Kính Ceramic',
    dfmeaAssemblyTest: 'Độ phẳng khung tôn đáy bếp, độ bám dính gioăng xốp đệm mặt kính',
    dfmeaFunctionalTest: 'Test công suất Booster 2400W/vùng nấu, đun sôi 1L nước trong 2 phút 15 giây',
    dfmeaPeriodicTest: 'Thử nghiệm thả quả cầu thép 500g rơi từ độ cao 50cm lên mặt kính không vỡ',
    dfmeaItems: [
      {
        componentName: 'Mặt kính gốm Ceramic chịu lực',
        riskIssue: 'Sốc nhiệt & Va đập cơ học',
        failureMode: 'Mặt kính bị nứt vỡ khi đang nấu ở nhiệt độ cao vô tình bị rơi vung nồi hoặc giọt nước lạnh',
        cause: 'Vật liệu kính không chịu được độ chênh lệch nhiệt độ sốc nhiệt > 600°C',
        currentControl: 'Test sốc nhiệt đổ nước đá 0°C lên bề mặt kính đang đun nóng 650°C',
        S: 9,
        O: 1,
        D: 2,
        action: 'Sử dụng mặt kính gốm Schott Ceran (CHLB Đức) chịu sốc nhiệt lên tới 750°C và vát cạnh viền kim loại bảo vệ mép kính',
        pic: 'Trần Văn Hoàng (R&D Bếp Từ)',
        result: 'Vượt qua bài test rơi bi thép và sốc nhiệt 750°C theo chuẩn an toàn quốc tế'
      },
      {
        componentName: 'Bo mạch công suất & Modul IGBT',
        riskIssue: 'Quá nhiệt & Chập xung điện áp',
        failureMode: 'Nổ IGBT công suất khi người dùng bấm phím Booster nấu liên tục quá 10 phút',
        cause: 'Quạt tản nhiệt ly tâm lưu lượng gió yếu hoặc keo tản nhiệt silicon bị khô cứng',
        currentControl: 'Cảm biến nhiệt độ NTC gắn sát lưng IGBT tự động hạ công suất khi tản nhiệt > 85°C',
        S: 8,
        O: 2,
        D: 2,
        action: 'Nâng cấp cụm tản nhiệt nhôm đúc nguyên khối có 16 cánh tản nhiệt sâu, dùng quạt lồng sóc không chổi than gió mạnh êm ái',
        pic: 'Lê Minh Tuấn (Kỹ sư Điện Tử Công Suất)',
        result: 'Nhiệt độ IGBT duy trì dưới 72°C khi chạy max tải Booster liên tục'
      }
    ],
    pfmeaPhase: 'PV (Sản xuất)',
    pfmeaSupplier: 'Xưởng Lắp Ráp Thiết Bị Bếp',
    pfmeaAssemblyTest: 'Lực siết ốc cố định mâm từ, kiểm tra gioăng chống nước lọt khe kính',
    pfmeaFunctionalTest: 'Test tự động nhận diện kích thước đáy nồi từ 12cm - 26cm, test dòng hài EMC',
    pfmeaPeriodicTest: 'Test ngâm mặt kính trong nước kiểm tra chuẩn chống nước mặt bếp IPX4',
    pfmeaItems: [
      {
        componentName: 'Công đoạn Tra keo tản nhiệt cho modul IGBT',
        riskIssue: 'Độ dày màng keo dẫn nhiệt',
        failureMode: 'Lượng keo silicon tra không đều làm xuất hiện bọt khí gây quá nhiệt chết IGBT',
        cause: 'Công nhân bôi keo thủ công bằng thìa gạt dẫn đến chỗ dày chỗ mỏng',
        currentControl: 'Kiểm tra độ phủ keo bằng dưỡng kính trong suốt',
        S: 8,
        O: 3,
        D: 2,
        action: 'Trang bị máy tra keo tự động robot định lượng chính xác 0.25ml keo phân bố dạng lưới chữ X',
        pic: 'Hoàng Quốc Việt (Kỹ sư Quá Trình ME)',
        result: 'Độ phủ keo 100% diện tích tiếp xúc, giảm nhiệt độ tiếp giáp 6°C'
      }
    ]
  },

  // ==========================================
  // 5. KHÁC / CƠ KHÍ & LINH KIỆN
  // ==========================================
  {
    id: 'bo_mach_nguon_smps',
    name: 'Bo mạch nguồn biến tần SMPS',
    code: 'SMPS-65W-UNIV',
    category: 'khac',
    description: 'Bộ nguồn xung công suất 65W dải điện áp rộng 90V - 265V AC, hiệu suất 92%, bảo vệ quá dòng OCP/OVP',
    iconName: 'Wrench',
    dfmeaPhase: 'DV (Thiết kế bo mạch)',
    dfmeaSupplier: 'Phòng R&D Phần Cứng & Nhà máy sản xuất PCB SMT',
    dfmeaAssemblyTest: 'Dung sai gắn linh kiện SMT chuẩn IPC-A-610 Class 2',
    dfmeaFunctionalTest: 'Hiệu suất nguồn > 90%, gợn sóng điện áp ngõ ra < 50mVp-p, test quá áp OVP',
    dfmeaPeriodicTest: 'Test sốc điện áp sét lan truyền Surge 4000V, kiểm tra EMC bức xạ dẫn',
    dfmeaItems: [
      {
        componentName: 'Biến áp xung cao tần Ferrite',
        riskIssue: 'Cách điện sơ cấp & Thứ cấp',
        failureMode: 'Đánh thủng lớp cách điện giữa cuộn sơ cấp 220V và thứ cấp 12V gây điện giật cho người dùng',
        cause: 'Băng dính cách điện Mylar dán không đủ 3 lớp hoặc khoảng cách đường rò Creepage < 6.0mm',
        currentControl: 'Kiểm tra cách điện cao áp Hipot 3750V AC ngâm 60 giây',
        S: 10,
        O: 1,
        D: 2,
        action: 'Sử dụng dây dẫn 3 lớp cách điện Triple Insulated Wire (TIW) và tạo rãnh phay cách ly 2mm trên mạch in PCB',
        pic: 'Lê Minh Tuấn (Chuyên gia Phần Cứng)',
        result: 'Đạt kiểm định an toàn UL 62368-1 và TCVN'
      }
    ],
    pfmeaPhase: 'PV (Sản xuất SMT)',
    pfmeaSupplier: 'Dây chuyền dán bề mặt SMT & Hàn sóng DIP',
    pfmeaAssemblyTest: 'Soi kính hiển vi kiểm tra mối hàn IC, test tự động máy AOI',
    pfmeaFunctionalTest: 'Test nạp tải giả lập điện tử 100% bo mạch trên chuyền FCT tự động',
    pfmeaPeriodicTest: 'Cắt kiểm tra kim tương mối hàn chân linh kiện BGA/QFN',
    pfmeaItems: [
      {
        componentName: 'Công đoạn In kem hàn chì (Solder Paste Printing)',
        riskIssue: 'Chất lượng kem hàn',
        failureMode: 'Kem hàn bị thiếu hoặc lem sang chân bên cạnh gây chập mạch vi mô chân IC',
        cause: 'Lưới in Stencil bị bám cặn kem hàn khô hoặc dao gạt áp lực chưa đều',
        currentControl: 'Máy kiểm tra 3D SPI (Solder Paste Inspection) tự động 100% bo mạch',
        S: 7,
        O: 2,
        D: 1,
        action: 'Cài đặt chu kỳ tự động lau lưới in Stencil 3 mạch/lần kết hợp dung dịch cồn tẩy rửa chân không',
        pic: 'Nguyễn Văn Cường (Quản đốc SMT)',
        result: 'Lỗi dính chân chì giảm về 0 PPM'
      }
    ]
  }
];

export function getPresetsByCategory(category: ProductCategory): ProductPreset[] {
  return PRODUCT_PRESETS.filter(p => p.category === category);
}

export function getPresetById(id: string): ProductPreset | undefined {
  return PRODUCT_PRESETS.find(p => p.id === id);
}

export function convertPresetItemsToFMEAItems(
  itemsDef: ProductPresetItemDef[],
  fmeaType: FMEAType
): FMEAItem[] {
  return itemsDef.map((def, idx) => {
    const rpn = calculateRPN(def.S, def.O, def.D);
    const conclusion = (def.S >= 8 || rpn >= 40) ? 'Cần cải tiến' : 'Không cải tiến';
    return {
      id: `item-preset-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      itemNo: idx + 1,
      componentName: def.componentName,
      riskIssue: def.riskIssue,
      failureMode: def.failureMode,
      cause: def.cause,
      currentControl: def.currentControl,
      S: def.S,
      O: def.O,
      D: def.D,
      rpn,
      conclusion,
      action: def.action,
      pic: def.pic || 'Chưa phân công',
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: (def.result ? 'completed' : 'in_progress'),
      result: def.result || '',
      sAfter: Math.max(1, def.S - (def.S >= 8 ? 2 : 1)),
      oAfter: Math.max(1, def.O - 1),
      dAfter: Math.max(1, def.D - 1),
      rpnAfter: calculateRPN(
        Math.max(1, def.S - (def.S >= 8 ? 2 : 1)),
        Math.max(1, def.O - 1),
        Math.max(1, def.D - 1)
      ),
    };
  });
}
