import * as toxicity from '@tensorflow-models/toxicity';
import '@tensorflow/tfjs';

// The minimum prediction confidence.
const threshold = 0.8;

let model: toxicity.ToxicityClassifier | null = null;

export const loadAIModel = async () => {
  if (model) return model;
  try {
    model = await toxicity.load(threshold, []);
    return model;
  } catch (error) {
    console.error("Lỗi tải AI Toxicity model", error);
    return null;
  }
};

const vietnameseBadWords = [
  "địt", "đụ", "lồn", "cặc", "buồi", "đĩ", "điếm", "đéo", "vcl", "vl", "vãi lồn", "chó đẻ", "mẹ mày", "con cặc", "thằng chó", "súc vật", "óc chó", "phò", "bitch", "fuck", "asshole", "shit"
];

const containsVietnameseBadWords = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  for (const word of vietnameseBadWords) {
    // Regex to match whole word or variations
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerText) || lowerText.includes(word)) {
      return true;
    }
  }
  return false;
};

export const checkToxicity = async (text: string): Promise<boolean> => {
  if (!text.trim()) return false;
  
  // 1. Kiểm tra bằng danh sách từ khóa Tiếng Việt (Cực nhanh)
  if (containsVietnameseBadWords(text)) {
    return true;
  }

  // 2. Bỏ qua AI vì quá nặng gây lag theo phản hồi của người dùng
  return false;
};
