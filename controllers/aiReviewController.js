import generateAIReview from "../services/aiReviewService.js";

export const generateReview = async (req, res) => {
  try {
    const { productId } = req.body;
    const aiReview = await generateAIReview(productId);
    res.json(aiReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
