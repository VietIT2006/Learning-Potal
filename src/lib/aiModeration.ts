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

export const checkToxicity = async (text: string): Promise<boolean> => {
  if (!text.trim()) return false;
  
  if (!model) {
    await loadAIModel();
  }
  
  if (!model) return false; // Fallback if AI fails to load

  try {
    const predictions = await model.classify([text]);
    
    // predictions is an array of objects for each label
    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i];
      if (pred.results[0].match === true) {
        // match === true means toxicity is detected with probability >= threshold
        return true; 
      }
    }
    
    return false;
  } catch (error) {
    console.error("Lỗi khi AI phân tích văn bản", error);
    return false;
  }
};
