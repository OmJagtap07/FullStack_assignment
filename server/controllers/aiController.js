import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @desc    Generate a blog post title and content using Gemini LLM
 * @route   POST /api/ai/generate
 * @access  Private (or Public, but typically Private in real apps)
 */
export const generatePost = async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, message: 'Topic is required' });
        }

        // 1. LLM API Integration & 2. Prompt Engineering
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
            You are an expert, professional content writer and blogger.
            The user wants you to write a blog post about the following topic: "${topic}".
            
            Instructions:
            - Write a catchy, engaging title (max 100 characters).
            - Write a detailed, informative, and engaging blog post body (around 300-500 words).
            - The content should be well-structured with paragraphs.

            // 3. Structured Outputs
            You MUST return the output ONLY as a valid JSON object. Do not include markdown formatting like \`\`\`json.
            The JSON structure must be exactly:
            {
                "title": "Your generated catchy title here",
                "content": "Your generated detailed blog post content here"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Safely parse the structured JSON output
        let generatedData;
        try {
            // Strip out any potential markdown backticks that the LLM might hallucinate despite instructions
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            generatedData = JSON.parse(cleanText);
        } catch (parseError) {
            console.error("Failed to parse LLM JSON:", text);
            return res.status(500).json({ success: false, message: 'LLM returned malformed JSON.' });
        }

        res.status(200).json({
            success: true,
            data: generatedData,
        });
    } catch (error) {
        console.error("Gemini Generation Error:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate content via AI',
            error: error.message,
        }); 
    }
};
