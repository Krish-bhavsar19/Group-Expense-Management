const db = require('../config/database');

class Settlement {
    // Calculate balances for a group
    static async calculateGroupBalances(groupId) {
        try {
            // Get all group members
            const [members] = await db.execute(
                `SELECT gm.user_id, u.name, u.email
                 FROM group_members gm
                 JOIN users u ON gm.user_id = u.id
                 WHERE gm.group_id = ?`,
                [groupId]
            );

            // Get all expenses for the group
            const [expenses] = await db.execute(
                `SELECT id, paid_by, amount
                 FROM expenses
                 WHERE group_id = ?`,
                [groupId]
            );

            // Initialize balance map (positive = owed to them, negative = they owe)
            const balances = {};
            members.forEach(member => {
                balances[member.user_id] = {
                    userId: member.user_id,
                    name: member.name,
                    email: member.email,
                    paid: 0,      // Total amount they paid
                    share: 0,     // Total amount they should pay
                    balance: 0    // Net balance (paid - share)
                };
            });

            // Calculate total paid by each person
            console.log('🔍 DEBUG: Calculating paid amounts...');
            for (const expense of expenses) {
                console.log(`  Expense: paid_by=${expense.paid_by}, amount=${expense.amount}`);
                if (balances[expense.paid_by]) {
                    balances[expense.paid_by].paid += parseFloat(expense.amount);
                } else {
                    console.log(`  ⚠️ WARNING: User ${expense.paid_by} not found in balances!`);
                }
            }

            // Calculate each person's share (for now, equal split)
            const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
            const perPersonShare = totalExpenses / members.length;

            console.log(`🔍 DEBUG: Total=${totalExpenses}, PerPerson=${perPersonShare}`);

            members.forEach(member => {
                balances[member.user_id].share = perPersonShare;
                balances[member.user_id].balance =
                    balances[member.user_id].paid - perPersonShare;
                console.log(`  ${balances[member.user_id].name}: paid=${balances[member.user_id].paid}, share=${perPersonShare}, balance=${balances[member.user_id].balance}`);
            });

            // Create a deep copy of balances for settlement calculation
            // (to prevent the original balances from being modified)
            const balancesCopy = Object.values(balances).map(b => ({ ...b }));

            // Calculate simplified settlements (who owes whom)
            const settlements = this.calculateSettlements(balancesCopy);

            return {
                balances: Object.values(balances),
                settlements,
                totalExpenses,
                perPersonShare
            };
        } catch (error) {
            throw error;
        }
    }

    // Calculate minimal transactions to settle all debts
    static calculateSettlements(balances) {
        const creditors = balances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);
        const debtors = balances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);

        const settlements = [];
        let i = 0, j = 0;

        while (i < creditors.length && j < debtors.length) {
            const creditor = creditors[i];
            const debtor = debtors[j];
            const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

            if (amount > 0.01) {
                settlements.push({
                    from: debtor.userId,
                    fromName: debtor.name,
                    to: creditor.userId,
                    toName: creditor.name,
                    amount: Math.round(amount * 100) / 100
                });

                creditor.balance -= amount;
                debtor.balance += amount;
            }

            if (Math.abs(creditor.balance) < 0.01) i++;
            if (Math.abs(debtor.balance) < 0.01) j++;
        }

        return settlements;
    }
}

module.exports = Settlement;
