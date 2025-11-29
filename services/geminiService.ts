import { GoogleGenAI, Type } from "@google/genai";
import { WeatherAnalysis, LayerType } from "../types";

// Initialize Gemini Client
// Note: process.env.API_KEY is guaranteed to be available by the runtime environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_MODEL = "gemini-2.5-flash";

export const analyzeLocationConditions = async (
  lat: number,
  lng: number,
  activeLayer: LayerType
): Promise<WeatherAnalysis> => {
  try {
    const prompt = `
      Bạn là một chuyên gia khí tượng thủy văn và địa lý AI.
      Vị trí: Vĩ độ ${lat}, Kinh độ ${lng} (tại Việt Nam).
      
      Hãy đóng vai một hướng dẫn viên thực tế ảo (VR). 
      Nhiệm vụ:
      1. Xác định tên địa danh gần nhất (Huyện/Tỉnh/Thành phố). Hãy tự suy luận dựa trên tọa độ.
      2. Dựa trên kiến thức địa lý và khí hậu học của bạn về khu vực này tại Việt Nam, hãy ước tính điều kiện thời tiết điển hình vào thời điểm hiện tại trong năm.
      3. Tập trung đặc biệt vào yếu tố: ${activeLayer} (Nhưng vẫn cung cấp đầy đủ các thông số khác).
      4. Viết một đoạn văn mô tả "Trải nghiệm thực tế ảo" (immersiveDescription): Mô tả cảm giác như đang đứng tại đó ngay lúc này (âm thanh, cảm giác da thịt, tầm nhìn) thật sinh động và giàu cảm xúc.

      Trả về kết quả dưới dạng JSON thuần túy theo schema sau.
    `;

    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: prompt,
      config: {
        // tools: [{ googleMaps: {} }], // Removed to allow responseSchema usage per SDK guidelines
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            locationName: { type: Type.STRING },
            summary: { type: Type.STRING },
            immersiveDescription: { type: Type.STRING },
            temperature: { type: Type.STRING, description: "Ví dụ: 28°C" },
            windSpeed: { type: Type.STRING, description: "Ví dụ: 15 km/h Hướng Đông Bắc" },
            rainfall: { type: Type.STRING, description: "Ví dụ: 5mm (Mưa rào nhẹ)" },
            terrainType: { type: Type.STRING, description: "Ví dụ: Đồi núi dốc, đồng bằng, hoặc ven biển" },
            recommendation: { type: Type.STRING, description: "Lời khuyên cho du khách hoặc người dân" },
          },
          required: ["locationName", "summary", "immersiveDescription", "temperature", "windSpeed", "rainfall", "terrainType", "recommendation"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as WeatherAnalysis;
    }
    throw new Error("Không nhận được phản hồi từ Gemini.");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback Mock Data in case of strict tool failures or quota limits
    return {
      locationName: "Khu vực không xác định",
      summary: "Không thể phân tích dữ liệu lúc này.",
      immersiveDescription: "Hệ thống đang gặp sự cố kết nối vệ tinh AI.",
      temperature: "--",
      windSpeed: "--",
      rainfall: "--",
      terrainType: "--",
      recommendation: "Vui lòng thử lại sau.",
    };
  }
};

export const generateLocationImage = async (
  locationName: string,
  description: string,
  layer: LayerType
): Promise<string | null> => {
  try {
    const layerPromptMap = {
      [LayerType.TERRAIN]: "focus on the landscape, mountains, valleys, or rivers, photorealistic, 4k, cinematic lighting",
      [LayerType.WIND]: "trees bending in the wind, dynamic movement, windy atmosphere, leaves blowing, photorealistic",
      [LayerType.RAIN]: "heavy rain, wet surfaces, reflections on the ground, moody atmosphere, rain droplets, photorealistic",
      [LayerType.TEMPERATURE]: "heat haze or sunny vibrant colors (if hot) or misty cold (if cold), atmospheric visualization of temperature",
    };

    const prompt = `
      Vietnam Landscape Photography.
      Location: ${locationName}.
      Context: ${description}.
      Visual Focus: ${layerPromptMap[layer]}.
      Style: Photorealistic, National Geographic style, high resolution, wide angle.
      No text, no overlays.
    `;

    // Using generateContent with image model for generation
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
            aspectRatio: "16:9",
            imageSize: "1K"
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
       if (part.inlineData) {
         return `data:image/png;base64,${part.inlineData.data}`;
       }
    }
    
    return null;

  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};