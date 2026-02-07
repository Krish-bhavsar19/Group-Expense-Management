const AIService = {
    async parseVoiceExpense(transcript) {
        try {
            console.log('Parsing voice input (Regex Mode):', transcript);

            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

            let amount = null;
            let category = 'other';
            let date = today;
            let description = transcript;

            // 1. Extract Amount (numbers, optionally with currency symbols)
            // Matches: 500, 500.50, 1000rs, $500, 500/-
            const amountMatch = transcript.match(/(\d+(\.\d{1,2})?)/);
            if (amountMatch) {
                amount = parseFloat(amountMatch[0]);
            }

            // 2. Extract Date Keywords
            const lowerTranscript = transcript.toLowerCase();
            if (lowerTranscript.includes('yesterday')) {
                date = yesterday;
            } else if (lowerTranscript.includes('tomorrow')) {
                date = tomorrow;
            }

            // 3. Extract Category (Keyword Matching)
            const categories = {
                food: ['food', 'dinner', 'lunch', 'breakfast', 'canteen', 'snack', 'coffee', 'tea', 'burger', 'pizza', 'restaurant', 'meal', 'drink'],
                transport: ['taxi', 'cab', 'uber', 'ola', 'auto', 'bus', 'train', 'flight', 'ticket', 'petrol', 'diesel', 'fuel', 'transport', 'fare', 'travel'],
                entertainment: ['movie', 'cinema', 'game', 'show', 'concert', 'netflix', 'subscription', 'fun', 'party', 'bowling'],
                shopping: ['grocery', 'groceries', 'cloth', 'shirt', 'pant', 'dress', 'shoe', 'shopping', 'buy', 'bought', 'market', 'mall', 'store'],
                bills: ['bill', 'electricity', 'water', 'gas', 'internet', 'wifi', 'recharge', 'mobile', 'rent', 'maintenance'],
                other: ['other', 'misc', 'miscellaneous']
            };

            for (const [cat, keywords] of Object.entries(categories)) {
                if (keywords.some(k => lowerTranscript.includes(k))) {
                    category = cat;
                    break;
                }
            }

            // 4. Clean up Description

            // Remove the amount from description
            if (amountMatch) {
                description = description.replace(amountMatch[0], '');
            }

            // Stop words to remove
            const stopWords = [
                'paid', 'spent', 'for', 'on', 'in', 'at', 'to', 'rupees', 'rs', 'dollar', 'dollars', 'yesterday', 'today', 'tomorrow', 'amount', 'of', 'is', 'was', 'the', 'a', 'an'
            ];

            let descWords = description.split(/\s+/);
            descWords = descWords.filter(word => {
                const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
                return !stopWords.includes(cleanWord) && cleanWord.length > 0;
            });

            const cleanedDescription = descWords.join(' ').trim();

            // If cleaned description is not empty, use it. Otherwise use the original transcript (minus amount) or fallback.
            if (cleanedDescription.length > 2) {
                description = cleanedDescription;
            } else if (description.trim().length > 0) {
                description = description.trim();
            } else {
                description = category.charAt(0).toUpperCase() + category.slice(1) + ' Expense';
            }

            // Validation
            if (!amount) {
                throw new Error('Could not detect an amount. Please mention the amount clearly (e.g., "500 for food").');
            }

            const result = {
                amount: amount,
                // Capitalize first letter of description
                description: description.charAt(0).toUpperCase() + description.slice(1),
                category: category,
                date: date
            };

            console.log('Regex Parsed Result:', result);
            return result;

        } catch (error) {
            console.error('Regex Parsing Error:', error);
            throw new Error(error.message || 'Failed to parse voice input');
        }
    }
};

module.exports = AIService;
