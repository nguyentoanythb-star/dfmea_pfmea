import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization for Gemini AI client
let defaultAiClient: GoogleGenAI | null = null;
function getAIClient(customApiKey?: string): GoogleGenAI | null {
  const activeKey = (customApiKey && customApiKey.trim()) || process.env.GEMINI_API_KEY;
  if (!activeKey) {
    return null;
  }

  // If using a custom key, create a fresh instance
  if (customApiKey && customApiKey.trim()) {
    return new GoogleGenAI({
      apiKey: customApiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Otherwise reuse cached default instance
  if (!defaultAiClient) {
    defaultAiClient = new GoogleGenAI({
      apiKey: activeKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return defaultAiClient;
}

// Resilient multi-model executor with automatic fallback for high-demand spikes (503 / 429)
async function generateWithModelFallback(
  ai: GoogleGenAI,
  prompt: string,
  schema: any,
  systemInstruction?: string
): Promise<{ text: string; model: string }> {
  // Ordered fallback models supported by modern Gemini API
  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      if (response && response.text) {
        return { text: response.text, model };
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code || err?.error?.code;
      console.warn(`[AI Service] Model ${model} returned code ${status || 'ERR'} (${err?.message?.slice(0, 80) || ''}). Trying fallback model...`);
      // Brief pause if model is busy before switching
      if (status === 503 || status === 429 || err?.message?.includes('demand')) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  }

  throw lastError;
}

// Health check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: Verify user-provided Gemini API Key
app.post('/api/fmea/verify-key', async (req, res) => {
  const headerKey = req.headers['x-gemini-api-key'];
  const customKey = (typeof headerKey === 'string' && headerKey.trim()) 
    ? headerKey.trim() 
    : (req.body?.apiKey && typeof req.body.apiKey === 'string' && req.body.apiKey.trim()) 
    ? req.body.apiKey.trim() 
    : process.env.GEMINI_API_KEY;

  if (!customKey) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập API Key để kiểm tra kết nối.',
    });
  }

  try {
    const testAi = new GoogleGenAI({
      apiKey: customKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await testAi.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Kiểm tra kết nối FMEA. Vui lòng trả về từ "READY".',
    });

    return res.json({
      success: true,
      message: 'Kết nối thành công! API Key của bạn hoạt động hoàn hảo với Google Gemini AI.',
      model: 'gemini-3.8-flash',
      reply: response.text?.slice(0, 30),
    });
  } catch (err: any) {
    console.error('Verify API key error:', err);
    return res.status(400).json({
      success: false,
      message: err?.message || 'API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại.',
    });
  }
});

// Endpoint: Suggest Risks based on Product Category, Component Name, and Historical Context
app.post('/api/fmea/suggest-risks', async (req, res) => {
  const { category, fmeaType, productName, componentName, currentIssues } = req.body;
  const headerKey = req.headers['x-gemini-api-key'];
  const userApiKey = (typeof headerKey === 'string' && headerKey.trim()) 
    ? headerKey.trim() 
    : (req.body?.apiKey && typeof req.body.apiKey === 'string' && req.body.apiKey.trim())
    ? req.body.apiKey.trim()
    : undefined;

  const ai = getAIClient(userApiKey);
  if (!ai) {
    return res.json({
      success: true,
      source: 'fallback-library',
      suggestions: getFallbackSuggestions(category, fmeaType, componentName, productName),
    });
  }

  try {
    const prompt = `Bạn là Chuyên gia kỹ thuật trưởng và Quản lý chất lượng (Chief Quality Engineer - CQE) chuyên về đánh giá ${fmeaType || 'DFMEA'} (Design/Process Failure Mode and Effects Analysis) cho ngành sản xuất công nghiệp và hàng tiêu dùng.
Danh mục sản phẩm: ${category} (ví dụ: Điện gia dụng, Điện tử điện lạnh, Thiết bị nhà bếp, Bồn nước & thiết bị nhiệt).
Tên sản phẩm: "${productName || 'Sản phẩm mới'}".
Chi tiết / Bộ phận / Công đoạn cần phân tích rủi ro: "${componentName}".
${currentIssues ? `Các vấn đề hoặc yêu cầu bổ sung: ${currentIssues}` : ''}

Hãy phân tích và gợi ý từ 3 đến 5 sai lỗi tiềm ẩn phổ biến nhất theo tiêu chuẩn FMEA (AIAG-VDA), dựa trên lịch sử dữ liệu và bài học kinh nghiệm thiết kế/sản xuất trong ngành.
Quy tắc chấm điểm S, O, D theo thang điểm 1-10:
- S (Mức độ nghiêm trọng): 10 (Nguy hiểm chết người/cháy nổ ko cảnh báo), 9 (Nguy hiểm có cảnh báo), 8 (Mất chức năng chính), 7 (Suy giảm chức năng chính), 6 (Hỏng chức năng phụ), 5-4 (Tiện ích suy giảm), 3-1 (Hỏng hóc nhỏ nhẹ).
- O (Xác suất xuất hiện): 10-9 (Rất cao >33%), 8-7 (Cao, lặp lại 5-12%), 6-4 (Bình thường thỉnh thoảng), 3-2 (Thấp, ít phát sinh), 1 (Gần như không có).
- D (Khả năng phát hiện trong thiết kế/thử nghiệm): 10-9 (Hầu như không phát hiện được), 8-7 (Chỉ test cơ bản hoặc test phá hủy trễ), 6-4 (Có bài test độ tin cậy/mô phỏng), 3-2 (Mô phỏng CAE/FEA hoặc test định lượng chặt chẽ), 1 (Đã ngăn chặn hoàn toàn bằng thiết kế Poka-Yoke).

Trả về định dạng JSON đúng schema.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        suggestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              componentName: { type: Type.STRING, description: 'Tên chi tiết hoặc công đoạn' },
              riskIssue: { type: Type.STRING, description: 'Vấn đề rủi ro hoặc chức năng bị ảnh hưởng' },
              failureMode: { type: Type.STRING, description: 'Sai lỗi tiềm ẩn (Potential Failure Mode)' },
              cause: { type: Type.STRING, description: 'Nguyên nhân tiềm ẩn gốc rễ (Potential Causes)' },
              recommendedS: { type: Type.INTEGER, description: 'Điểm S khuyến nghị từ 1 đến 10' },
              recommendedO: { type: Type.INTEGER, description: 'Điểm O khuyến nghị từ 1 đến 10' },
              recommendedD: { type: Type.INTEGER, description: 'Điểm D khuyến nghị từ 1 đến 10' },
              action: { type: Type.STRING, description: 'Đối sách / Hành động khắc phục cải tiến thiết kế hoặc công nghệ' },
              controlMethod: { type: Type.STRING, description: 'Biện pháp kiểm tra / kiểm soát hiện tại' },
              reasoning: { type: Type.STRING, description: 'Giải thích ngắn gọn lý do và kinh nghiệm thiết kế' },
            },
            required: ['componentName', 'riskIssue', 'failureMode', 'cause', 'recommendedS', 'recommendedO', 'recommendedD', 'action'],
          },
        },
      },
      required: ['suggestions'],
    };

    const { text, model } = await generateWithModelFallback(ai, prompt, schema);
    const parsed = JSON.parse(text || '{}');

    return res.json({
      success: true,
      source: 'gemini-ai',
      modelUsed: model,
      suggestions: parsed.suggestions || [],
    });
  } catch (error: any) {
    console.warn('[AI Service] Notice: Temporary high demand or network timeout, using domain historical rules:', error?.message || error);
    return res.json({
      success: true,
      source: 'fallback-library',
      suggestions: getFallbackSuggestions(category, fmeaType, componentName, productName),
    });
  }
});

// Endpoint: Suggest Corrective Action (Đối sách) for specific failure
app.post('/api/fmea/suggest-action', async (req, res) => {
  const { category, componentName, failureMode, cause, S, O, D } = req.body;
  const headerKey = req.headers['x-gemini-api-key'];
  const userApiKey = (typeof headerKey === 'string' && headerKey.trim()) 
    ? headerKey.trim() 
    : (req.body?.apiKey && typeof req.body.apiKey === 'string' && req.body.apiKey.trim())
    ? req.body.apiKey.trim()
    : undefined;

  const currentRpn = (S || 5) * (O || 3) * (D || 3);

  const ai = getAIClient(userApiKey);
  if (!ai) {
    const fallback = getSpecializedFallbackAction(category, componentName, failureMode, cause, S, O, D);
    return res.json({
      success: true,
      source: 'historical-knowledge-base',
      ...fallback,
    });
  }

  try {
    const prompt = `Bạn là Chuyên gia thiết kế R&D và Cải tiến chất lượng (Six Sigma Black Belt).
Đang thực hiện FMEA cho danh mục: ${category || 'Sản phẩm công nghiệp'}.
Chi tiết: "${componentName}".
Sai lỗi tiềm ẩn: "${failureMode}".
Nguyên nhân gốc rễ: "${cause}".
Chỉ số hiện tại: S=${S}, O=${O}, D=${D}, RPN=${currentRpn}.

Hãy đề xuất ĐỐI SÁCH KHẮC PHỤC (Corrective Action / Countermeasure) cụ thể, mang tính kỹ thuật thực tế cao (áp dụng Poka-Yoke, tiêu chuẩn vật liệu, cải tiến khuôn/dung sai, quy trình kiểm soát thử nghiệm...) để giảm chỉ số O (xác suất) và D (khả năng phát hiện).
Đồng thời dự đoán chỉ số S', O', D' sau cải tiến (RPN' mới phải giảm rõ rệt).

Trả về JSON đúng schema.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, description: 'Đối sách kỹ thuật chi tiết, thực tế và khả thi' },
        recommendedSAfter: { type: Type.INTEGER, description: 'Mức độ nghiêm trọng S mới sau khi cải tiến' },
        recommendedOAfter: { type: Type.INTEGER, description: 'Mức độ xuất hiện O mới sau cải tiến' },
        recommendedDAfter: { type: Type.INTEGER, description: 'Khả năng phát hiện D mới sau cải tiến' },
        justification: { type: Type.STRING, description: 'Lập luận kỹ thuật' },
      },
      required: ['action', 'recommendedSAfter', 'recommendedOAfter', 'recommendedDAfter'],
    };

    const { text, model } = await generateWithModelFallback(ai, prompt, schema);
    const parsed = JSON.parse(text || '{}');

    return res.json({
      success: true,
      source: 'gemini-ai',
      modelUsed: model,
      action: parsed.action,
      recommendedSAfter: parsed.recommendedSAfter,
      recommendedOAfter: parsed.recommendedOAfter,
      recommendedDAfter: parsed.recommendedDAfter,
      justification: parsed.justification,
    });
  } catch (error: any) {
    console.warn('[AI Service] Temporary high load on model, applying domain engineering countermeasure:', error?.message || error);
    const fallback = getSpecializedFallbackAction(category, componentName, failureMode, cause, S, O, D);
    return res.json({
      success: true,
      source: 'historical-knowledge-base',
      ...fallback,
    });
  }
});

// Domain-tailored technical countermeasures based on category and failure characteristics
function getSpecializedFallbackAction(
  category: string,
  componentName: string,
  failureMode: string,
  cause: string,
  S: number = 7,
  O: number = 3,
  D: number = 3
) {
  const normCategory = (category || '').toLowerCase();
  const normComp = (componentName || '').toLowerCase();
  const normFail = (failureMode || '').toLowerCase();
  const normCause = (cause || '').toLowerCase();

  let action = '';
  let justification = '';

  // Bồn nước & thiết bị áp lực / thủy lực
  if (normCategory.includes('bồn') || normComp.includes('bồn') || normFail.includes('hàn') || normFail.includes('rò rỉ')) {
    action = `Áp dụng công nghệ hàn tự động TIG/Argon xung với khí bảo vệ Ar tinh khiết 99.99%; sử dụng vật liệu Inox SUS304 đạt chuẩn ASTM A240; bổ sung 100% kiểm tra thẩm thấu mối hàn (Dye Penetrant Test) và thử áp lực nước 0.6 MPa trong 30 phút trước khi xuất xưởng.`;
    justification = `Giải pháp giải quyết triệt để khuyết tật bọt khí mối hàn chân bồn và đường hàn thân, triệt tiêu nguy cơ rò rỉ rạn nứt khi chịu tải trọng nước thực tế.`;
  }
  // Động cơ, quạt, mô tơ
  else if (normComp.includes('động cơ') || normComp.includes('motor') || normFail.includes('nóng') || normFail.includes('quá nhiệt') || normFail.includes('không quay')) {
    action = `Nâng cấp cuộn dây đồng nguyên chất cấp cách điện Class H (chịu nhiệt 180°C); tích hợp cầu chì nhiệt tự ngắt 130°C tiếp xúc trực tiếp cuộn dây; bổ sung gân tản nhiệt nhôm đúc ADC12 và tra mỡ bôi trơn tổng hợp chịu nhiệt Klüber cho trục bạc thau.`;
    justification = `Bảo vệ kép chống cháy chập khi quạt bị kẹt cánh hoặc quá tải, giảm xác suất hỏng hóc thực tế xuống dưới 0.1%.`;
  }
  // Mạch điều khiển, bo mạch PCB, điện tử
  else if (normComp.includes('mạch') || normComp.includes('pcb') || normComp.includes('điều khiển') || normFail.includes('liệt') || normFail.includes('chập')) {
    action = `Phủ keo silicon chống ẩm Conformal Coating độ dày 50µm đạt tiêu chuẩn IP54; thay thế công tắc cơ sang Tact Switch chống ẩm mạ vàng tuổi thọ 100,000 lần nhấn; bổ sung biến trở chống sét lan truyền MOV 14D471K trên đường nguồn AC.`;
    justification = `Ngăn chặn hoàn toàn hiện tượng ăn mòn điện hóa do độ ẩm cao vùng nhiệt đới và bảo vệ vi điều khiển khỏi xung điện lưới.`;
  }
  // Thiết bị nhà bếp (Bếp từ, Nồi chiên, Lò nướng)
  else if (normCategory.includes('bếp') || normCategory.includes('nhà bếp') || normComp.includes('mâm nhiệt') || normComp.includes('igbt')) {
    action = `Thiết kế tối ưu luồng gió khí động học làm mát thanh tản nhiệt IGBT; nâng cấp transistor IGBT lên dòng định mức 30A/1200V; đặt cảm biến nhiệt điện trở NTC ngắt nhiệt độ an toàn tại 95°C và sử dụng kính Ceramic chịu sốc nhiệt 800°C.`;
    justification = `Hạ nhiệt độ làm việc của linh kiện công suất xuống dưới 75°C, loại bỏ nguy cơ nổ IGBT khi đun nấu công suất tối đa liên tục.`;
  }
  // Tủ lạnh, làm lạnh, máy nén gas
  else if (normCategory.includes('lạnh') || normComp.includes('gas') || normComp.includes('máy nén') || normFail.includes('lạnh')) {
    action = `Sử dụng ống đồng khử oxy hóa Photpho Cu-DHP cho đường ống môi chất R600a; áp dụng phương pháp hàn vảy bạc 45% Ag với máy hàn cao tần; kiểm tra rò rỉ môi chất bằng máy dò khí Helium độ nhạy 1x10^-6 mbar.l/s.`;
    justification = `Đảm bảo độ kín tuyệt đối cho hệ thống tuần hoàn môi chất lạnh trong suốt chu kỳ vòng đời 10 năm của thiết bị.`;
  }
  // Mặc định: cơ khí, kết cấu, lắp ráp
  else {
    action = `Tối ưu hóa dung sai lắp ghép theo tiêu chuẩn ISO 2768-m; thiết kế cơ cấu định vị Poka-Yoke chống lắp ngược; bổ sung gân tăng cứng tại các góc lượn chịu ứng suất R ≥ 1.5mm; sử dụng vít tự hãm Trilobular có bôi keo khóa ren anaerobic.`;
    justification = `Triệt tiêu sai sót do thao tác lắp ráp của công nhân và triệt tiêu hiện tượng lỏng ốc biến dạng do rung lắc khi vận hành.`;
  }

  return {
    action,
    recommendedSAfter: Math.max(1, S - 1),
    recommendedOAfter: Math.max(1, Math.floor(O / 2)),
    recommendedDAfter: Math.max(1, Math.floor(D / 2)),
    justification,
  };
}

// Rule-based fallback suggestions when Gemini API is under heavy demand
function getFallbackSuggestions(category: string, fmeaType: string, componentName: string, productName: string) {
  const normComp = (componentName || '').toLowerCase();
  const normCat = (category || '').toLowerCase();

  if (normCat.includes('bồn') || normComp.includes('bồn') || normComp.includes('hàn')) {
    return [
      {
        componentName: componentName || 'Mối hàn đáy và chân bồn',
        riskIssue: 'Kín nước & Chịu lực',
        failureMode: 'Rò rỉ nước tại đường hàn chân bồn khi chứa đầy nước',
        cause: 'Hiện tượng cháy chân mối hàn (Undercut) do dòng hàn quá lớn hoặc công nhân thao tác lệch tay',
        recommendedS: 8,
        recommendedO: 3,
        recommendedD: 2,
        action: 'Chuyển sang công nghệ hàn Argon tự động ray dẫn hướng và kiểm tra thẩm thấu 100% lô sản phẩm',
        controlMethod: 'Thử nghiệm thủy tĩnh ngâm nước 24h và kiểm tra bột huỳnh quang',
        reasoning: 'Rủi ro rò rỉ bồn nước gây khiếu nại nghiêm trọng và tốn chi phí bảo hành tại nhà khách hàng',
      },
      {
        componentName: componentName || 'Nắp và phao bồn',
        riskIssue: 'Vận hành',
        failureMode: 'Kẹt phao tự ngắt hoặc bung nắp khi áp lực gió bão',
        cause: 'Chốt gá phao bị rỉ sét hoặc cơ cấu cài nắp bồn có độ dày mỏng < 0.6mm',
        recommendedS: 6,
        recommendedO: 2,
        recommendedD: 2,
        action: 'Dập gân gia cường trên nắp và sử dụng bu lông chốt khóa Inox 304 chống gió lật',
        controlMethod: 'Thử nghiệm khí động học trong buồng gió cấp 11',
        reasoning: 'Đảm bảo an toàn khi lắp đặt bồn nước trên mái nhà cao tầng',
      },
    ];
  }

  if (normComp.includes('động cơ') || normComp.includes('motor')) {
    return [
      {
        componentName: componentName || 'Cụm Động cơ',
        riskIssue: 'Hoạt động & Nhiệt độ',
        failureMode: 'Động cơ bị quá nhiệt, tự ngắt hoặc cháy cuộn dây',
        cause: 'Cuộn dây đồng không đồng chất, quá tải lâu dài hoặc kẹt trục bạc thau',
        recommendedS: 8,
        recommendedO: 2,
        recommendedD: 2,
        action: 'Dùng dây đồng cấp H chịu nhiệt 180°C, bổ sung cầu chì nhiệt 130°C và cải tiến khe thoát nhiệt',
        controlMethod: 'Thử nghiệm tăng nhiệt độ Delta T theo tiêu chuẩn TCVN',
        reasoning: 'Lỗi nhiệt động cơ là rủi ro trọng yếu ảnh hưởng tuổi thọ sản phẩm gia dụng',
      },
      {
        componentName: componentName || 'Cụm Động cơ',
        riskIssue: 'Độ ồn & Rung lắc',
        failureMode: 'Động cơ phát ra tiếng kêu cọ sát cơ khí lớn khi quay',
        cause: 'Dung sai lắp ghép vòng bi/bạc thau bị rơ lỏng sau thời gian chạy rà',
        recommendedS: 6,
        recommendedO: 3,
        recommendedD: 2,
        action: 'Gia công chính xác đường kính trục với dung sai h6, sử dụng mỡ bôi trơn chịu nhiệt tổng hợp',
        controlMethod: 'Đo độ ồn âm học bằng máy phân tích dBA trong buồng câm',
        reasoning: 'Ảnh hưởng trực tiếp đến trải nghiệm và sự hài lòng của khách hàng',
      },
    ];
  }

  if (normComp.includes('mạch') || normComp.includes('điều khiển') || normComp.includes('pcb')) {
    return [
      {
        componentName: componentName || 'Mạch điều khiển (PCB)',
        riskIssue: 'Hoạt động & Chức năng',
        failureMode: 'Liệt phím bấm hoặc bo mạch không nhận tín hiệu điều khiển',
        cause: 'Hơi ẩm bám gây oxy hóa mối hàn hoặc công tắc tact switch kém chất lượng',
        recommendedS: 7,
        recommendedO: 3,
        recommendedD: 3,
        action: 'Phủ keo chống ẩm conformal coating chống oxy hóa và đổi sang nút bấm chống bụi IP42',
        controlMethod: 'Kiểm tra ICT và thử nghiệm phun muối/độ ẩm 95% RH',
        reasoning: 'Môi trường khí hậu nhiệt đới gió mùa tại Việt Nam dễ gây chập vi mạch',
      },
      {
        componentName: componentName || 'Mạch nguồn',
        riskIssue: 'An toàn điện & Tương thích EMC',
        failureMode: 'Nổ tụ nguồn hoặc IC nguồn khi có sét lan truyền trên lưới điện',
        cause: 'Không có linh kiện chống sét biến trở MOV và tụ chống xung nhiễu X2',
        recommendedS: 8,
        recommendedO: 2,
        recommendedD: 2,
        action: 'Bổ sung MOV 14D471K và cầu chì bảo vệ dòng ngắt nhanh 2A',
        controlMethod: 'Test xung sét Surge Immunity Test 2kV theo IEC 61000-4-5',
        reasoning: 'Bảo vệ thiết bị khi điện lưới chập chờn, chống cháy nổ gia dụng',
      },
    ];
  }

  return [
    {
      componentName: componentName || 'Cụm chi tiết chính',
      riskIssue: 'Độ bền kết cấu & Lắp ráp',
      failureMode: 'Nứt gãy, biến dạng hoặc rơ lỏng mối liên kết khi vận hành',
      cause: 'Độ dày thành chi tiết mỏng, thiếu gân tăng cứng hoặc lực siết vít vượt quá giới hạn ren nhựa',
      recommendedS: 7,
      recommendedO: 3,
      recommendedD: 2,
      action: 'Tối ưu độ dày thành, bổ sung gân tăng cứng và chuyển sang vít ren tam giác Trilobular chống tuột',
      controlMethod: 'Phân tích ứng suất kết cấu CAE/FEA và thử nghiệm rơi tự do 1.0m',
      reasoning: 'Rủi ro cơ khí phổ biến trong giai đoạn thiết kế khuôn mẫu ban đầu',
    },
    {
      componentName: componentName || 'Chi tiết ngoại quan',
      riskIssue: 'Thẩm mỹ & Ngoại quan',
      failureMode: 'Co ngót, cong vênh hoặc lão hóa biến màu sau thời gian sử dụng',
      cause: 'Sử dụng hạt nhựa tái sinh không có phụ gia chống tia cực tím UV và nhiệt',
      recommendedS: 5,
      recommendedO: 3,
      recommendedD: 3,
      action: 'Chuyển sang nhựa ABS/PP nguyên sinh có phụ gia chống UV 0.5%',
      controlMethod: 'Kiểm nghiệm lão hóa gia tốc trong tủ thử nghiệm Xenon',
      reasoning: 'Đảm bảo tính thẩm mỹ và độ bền màu sản phẩm ngoài trời hoặc nơi có ánh nắng',
    },
    {
      componentName: componentName || 'Cơ cấu an toàn',
      riskIssue: 'An toàn sử dụng',
      failureMode: 'Bộ phận chuyển động hoặc có điện tiếp xúc trực tiếp với người dùng',
      cause: 'Khe hở bảo vệ lớn hơn tiêu chuẩn que thử ngón tay an toàn (Test finger)',
      recommendedS: 9,
      recommendedO: 1,
      recommendedD: 1,
      action: 'Thu hẹp nan bảo vệ hoặc vách ngăn < 8mm, tuân thủ nghiêm ngặt IEC 60335-1',
      controlMethod: 'Kiểm tra bằng que thử tiêu chuẩn ngón tay trẻ em và que thép 1.0mm',
      reasoning: 'Yêu cầu quy chuẩn an toàn bắt buộc trước khi lưu hành trên thị trường',
    },
  ];
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FMEA Server running on port ${PORT}`);
  });
}

startServer();
