import { Clock, IndianRupee } from 'lucide-react';

const ActivityCard = ({ activity }) => {
  const { icon, time, name, details, cost } = activity;

  return (
    <div className="bg-surface rounded-lg border-2 border-neutral-light p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
          {icon || '📍'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Time and Title */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-md">
              <Clock className="w-3 h-3" aria-hidden="true" />
              <span className="text-sm font-medium">{time}</span>
            </div>
            <h4 className="text-lg font-semibold text-text-primary">{name}</h4>
          </div>

          {/* Details */}
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            {details}
          </p>

          {/* Cost */}
          {cost && cost !== '₹0' && (
            <div className="flex items-center gap-1 text-accent-dark font-semibold">
              <IndianRupee className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">{cost.replace('₹', '')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
