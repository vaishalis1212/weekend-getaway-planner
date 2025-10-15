import { Check, MapPin, Clock, Wallet, Sparkles } from 'lucide-react';
import WeatherWidget from './WeatherWidget';

const DestinationComparisonCard = ({ destination, onSelect, isTopPick }) => {
  // Determine match score color
  const getScoreColor = (score) => {
    if (score >= 90) return 'from-success to-primary-light';
    if (score >= 80) return 'from-accent to-accent-light';
    return 'from-secondary to-secondary-light';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-success/10 text-success';
    if (score >= 80) return 'bg-accent/10 text-accent-dark';
    return 'bg-secondary/10 text-secondary';
  };

  return (
    <div className="relative bg-surface rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-4 border-2 border-neutral-light hover:border-primary">
      {/* Top Pick Badge */}
      {isTopPick && (
        <div className="absolute -top-3 -right-3 bg-accent text-text-primary px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10 flex items-center gap-1">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          <span>Top Pick</span>
        </div>
      )}

      {/* Destination Name & Tagline */}
      <div className="mb-3">
        <h3 className="text-xl font-bold text-text-primary mb-1">{destination.name}</h3>
        <p className="text-text-secondary text-sm">{destination.tagline}</p>
      </div>

      {/* Match Score */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-text-primary">Perfect Match</span>
          <span className={`text-lg font-bold px-3 py-1 rounded-full ${getScoreBgColor(destination.matchScore)}`}>
            {destination.matchScore}%
          </span>
        </div>
        <div className="w-full bg-neutral-light rounded-full h-2.5">
          <div
            className={`bg-gradient-to-r ${getScoreColor(destination.matchScore)} rounded-full h-2.5 transition-all duration-500`}
            style={{ width: `${destination.matchScore}%` }}
            role="progressbar"
            aria-valuenow={destination.matchScore}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`Match score: ${destination.matchScore}%`}
          />
        </div>
      </div>

      {/* Why Perfect Section */}
      <div className="mb-3 p-3 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
        <h4 className="text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">
          Why it's perfect for you
        </h4>
        <p className="text-sm text-text-secondary leading-relaxed">{destination.whyPerfect}</p>
      </div>

      {/* Pros List - Top 2 Only */}
      <div className="mb-3">
        <ul className="space-y-1.5" role="list">
          {destination.pros.slice(0, 2).map((pro, index) => (
            <li key={index} className="flex items-start gap-2 text-xs text-text-secondary">
              <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span className="leading-snug">{pro}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Info Grid - Horizontal 2 Columns */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Budget */}
        <div className="flex flex-col items-center gap-1 p-2 bg-background rounded-lg">
          <Wallet className="w-4 h-4 text-neutral flex-shrink-0" aria-hidden="true" />
          <p className="text-xs text-text-secondary font-medium text-center">Budget</p>
          <p className="text-xs font-semibold text-text-primary text-center">{destination.budget}</p>
        </div>

        {/* Travel Time */}
        <div className="flex flex-col items-center gap-1 p-2 bg-background rounded-lg">
          <Clock className="w-4 h-4 text-neutral flex-shrink-0" aria-hidden="true" />
          <p className="text-xs text-text-secondary font-medium text-center">Travel Time</p>
          <p className="text-xs font-semibold text-text-primary text-center">{destination.travelTime}</p>
        </div>
      </div>

      {/* Best Time to Visit */}
      <div className="mb-3">
        <p className="text-xs text-text-secondary">
          <span className="font-medium">Best Time:</span> {destination.bestTimeToVisit}
        </p>
      </div>

      {/* Current Weather */}
      <div className="mb-3">
        <WeatherWidget cityName={destination.name} compact={true} />
      </div>

      {/* Choose Button */}
      <button
        onClick={() => onSelect(destination.name)}
        className="w-full bg-nature-gradient text-white py-2.5 px-6 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 hover:brightness-110 flex items-center justify-center gap-2 focus:outline-none focus:ring-focus focus:ring-primary focus:ring-offset-focus"
        aria-label={`Choose ${destination.name} for your trip`}
      >
        Choose {destination.name}
        <span className="text-xl" aria-hidden="true">→</span>
      </button>
    </div>
  );
};

export default DestinationComparisonCard;
