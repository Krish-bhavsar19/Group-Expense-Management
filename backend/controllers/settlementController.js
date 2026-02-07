const Settlement = require('../models/Settlement');

// Get group settlement balances
const getGroupSettlement = async (req, res) => {
    try {
        const { groupId } = req.params;

        const settlement = await Settlement.calculateGroupBalances(groupId);

        res.json({
            success: true,
            data: settlement
        });
    } catch (error) {
        console.error('Get settlement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate settlement',
            error: error.message
        });
    }
};

module.exports = {
    getGroupSettlement
};
