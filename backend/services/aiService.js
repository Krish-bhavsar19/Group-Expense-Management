// const { GoogleGenerativeAI } = require('@google/generative-ai');

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// class AIService {
//     static async parseVoiceExpense(transcript) {
//         try {
//             // Use gemini-1.5-flash as it is the current standard
//             const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

//             const today = new Date().toISOString().split('T')[0];
//             const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

//             const prompt = `Extract expense information from this sentence: "${transcript}"

// Return ONLY a JSON object (no markdown, no explanations) with these fields:
// - amount: number (extract the monetary value, remove currency symbols)
// - description: string (what was purchased/paid for)
// - category: string (choose from: food, transport, entertainment, shopping, bills, other)
// - date: string (YYYY-MM-DD format, use ${today} for today, ${yesterday} for yesterday)

// Examples:
// Input: "Paid 250 for taxi yesterday"
// Output: {"amount": 250, "description": "taxi", "category": "transport", "date": "${yesterday}"}

// Input: "Spent 500 on dinner with friends"
// Output: {"amount": 500, "description": "dinner with friends", "category": "food", "date": "${today}"}

// Input: "I spent 1200 rupees on groceries"
// Output: {"amount": 1200, "description": "groceries", "category": "shopping", "date": "${today}"}

// Now extract from: "${transcript}"`;

//             const result = await model.generateContent(prompt);
//             const response = result.response.text();

//             console.log('AI Response:', response); // Debug log

//             // cleaned response
//             const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();

//             let parsed;
//             try {
//                 parsed = JSON.parse(cleanedResponse);
//             } catch (e) {
//                 // Try regex fallback if direct parsing fails
//                 const jsonMatch = response.match(/\{[\s\S]*\}/);
//                 if (!jsonMatch) {
//                     throw new Error('Could not extract JSON from response');
//                 }
//                 parsed = JSON.parse(jsonMatch[0]);
//             }

//             // Validate parsed data
//             if (!parsed.amount && !parsed.description) {
//                 throw new Error('Invalid expense data - missing amount and description');
//             }

//             return {
//                 amount: parseFloat(parsed.amount) || 0,
//                 description: parsed.description?.trim() || 'Expense',
//                 category: parsed.category || 'other',
//                 date: parsed.date || today
//             };
//         } catch (error) {
//             console.error('AI parsing error details:', error);
//             if (error.message.includes('API key')) {
//                 throw new Error('Invalid or missing GEMINI_API_KEY');
//             }
//             throw new Error('Failed to parse voice input. Please try again or enter manually.');
//         }
//     }
// }

// module.exports = AIService;



const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
    static async parseVoiceExpense(transcript) {
        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash"
            });

            const today = new Date().toISOString().split("T")[0];
            const yesterday = new Date(Date.now() - 86400000)
                .toISOString()
                .split("T")[0];

            const prompt = `
Extract expense information from this sentence:
"${transcript}"

Return ONLY valid JSON. No markdown. No explanation.

Format:
{
  "amount": number,
  "description": string,
  "category": "food | transport | entertainment | shopping | bills | other",
  "date": "YYYY-MM-DD"
}

Rules:
- Remove currency symbols
- If today mentioned → use ${today}
- If yesterday mentioned → use ${yesterday}
- If date missing → use ${today}

Examples:

Input: Paid 250 for taxi yesterday
Output: {"amount":250,"description":"taxi","category":"transport","date":"${yesterday}"}

Input: Spent 500 on dinner with friends
Output: {"amount":500,"description":"dinner with friends","category":"food","date":"${today}"}

Now extract from:
"${transcript}"
`;

            const result = await model.generateContent({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }]
                    }
                ]
            });

            const responseText = result.response.text();

            console.log("AI Raw Response:", responseText);

            // ---------- Clean Response ----------
            let cleaned = responseText
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();

            // ---------- Extract JSON ----------
            let parsed;

            try {
                parsed = JSON.parse(cleaned);
            } catch {
                const match = cleaned.match(/\{[\s\S]*\}/);
                if (!match) throw new Error("JSON not found in AI response");
                parsed = JSON.parse(match[0]);
            }

            // ---------- Validation ----------
            if (!parsed.amount && !parsed.description) {
                throw new Error("Invalid parsed data");
            }

            return {
                amount: parseFloat(parsed.amount) || 0,
                description: parsed.description?.trim() || "Expense",
                category: parsed.category || "other",
                date: parsed.date || today
            };

        } catch (error) {
            console.error("AI parsing error details:", error);

            if (error.message?.includes("API key")) {
                throw new Error("Invalid or missing GEMINI_API_KEY");
            }

            throw new Error(
                "Failed to parse voice input. Please try again or enter manually."
            );
        }
    }
}

module.exports = AIService;
