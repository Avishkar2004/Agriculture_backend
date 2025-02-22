import { genAI } from "../config/geminiConfig.js";

const generateAIReview = async (productId) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Write a short, engaging customer review for a product with Product Id: ${productId}. 
    The review should include a rating from 1 to 5 and a comment and just write review no extra Talk and dont show me a rating in review.`;

    const result = await model.generateContent(prompt);
    const text = result.response.candidates[0].content.parts[0].text.trim();
    const rating = Math.floor(Math.random() * 4.5) + 1; // Generate a random rating (1-5)

    return { rating, comment: text };
  } catch (error) {
    console.error("Gemini AI Review Generation Error:", error);
    throw new Error("Failed to generate AI review.");
  }
};

export default generateAIReview;
