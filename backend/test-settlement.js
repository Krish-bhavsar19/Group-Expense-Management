// Test settlement calculation
const Settlement = require('./models/Settlement');

async function testSettlement() {
    try {
        const result = await Settlement.calculateGroupBalances(1); // Your group ID

        console.log('\n=== SETTLEMENT CALCULATION ===\n');
        console.log('Total Expenses:', result.totalExpenses);
        console.log('Per Person Share:', result.perPersonShare);
        console.log('\n=== BALANCES ===');
        result.balances.forEach(b => {
            console.log(`${b.name}:`);
            console.log(`  Paid: ₹${b.paid}`);
            console.log(`  Share: ₹${b.share}`);
            console.log(`  Balance: ₹${b.balance}`);
        });

        console.log('\n=== SETTLEMENTS ===');
        result.settlements.forEach(s => {
            console.log(`${s.fromName} → ${s.toName}: ₹${s.amount}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testSettlement();
