import { Wallet, IndianRupee } from 'lucide-react';

const BudgetCard = ({ budgetItems }) => {
  // Calculate total
  const total = budgetItems.reduce((sum, item) => {
    const amount = parseInt(item.amount.replace(/[^\d]/g, '')) || 0;
    return sum + amount;
  }, 0);

  return (
    <div className="bg-surface rounded-xl border-2 border-neutral-light p-6 mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
          <Wallet className="w-5 h-5 text-accent" aria-hidden="true" />
        </div>
        <h2 className="text-3xl font-bold text-text-primary">Budget Breakdown</h2>
      </div>

      <div className="space-y-4">
        {budgetItems.map((item, index) => (
          <div
            key={index}
            className="flex items-start justify-between p-4 bg-background rounded-lg hover:shadow-sm transition-shadow"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary mb-1">{item.category}</h3>
              <p className="text-sm text-text-secondary">{item.details}</p>
            </div>
            <div className="flex items-center gap-1 text-accent-dark font-bold ml-4">
              <IndianRupee className="w-4 h-4" aria-hidden="true" />
              <span>{item.amount.replace('₹', '')}</span>
            </div>
          </div>
        ))}

        {/* Total */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/20 mt-4">
          <h3 className="text-lg font-bold text-text-primary">Total Budget</h3>
          <div className="flex items-center gap-1 text-primary font-bold text-xl">
            <IndianRupee className="w-5 h-5" aria-hidden="true" />
            <span>{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
