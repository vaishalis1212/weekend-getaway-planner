import { Lightbulb, Calendar, Package, Navigation, Info } from 'lucide-react';

const TipsSection = ({ tips }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'best_time':
        return <Calendar className="w-5 h-5" aria-hidden="true" />;
      case 'packing':
        return <Package className="w-5 h-5" aria-hidden="true" />;
      case 'local_transport':
        return <Navigation className="w-5 h-5" aria-hidden="true" />;
      case 'booking':
        return <Info className="w-5 h-5" aria-hidden="true" />;
      default:
        return <Lightbulb className="w-5 h-5" aria-hidden="true" />;
    }
  };

  const getTitle = (type) => {
    switch (type) {
      case 'best_time':
        return 'Best Time to Visit';
      case 'packing':
        return 'Packing Essentials';
      case 'local_transport':
        return 'Local Transport';
      case 'booking':
        return 'Booking Tips';
      default:
        return 'Tip';
    }
  };

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-accent" aria-hidden="true" />
        </div>
        <h2 className="text-3xl font-bold text-text-primary">Practical Tips</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="bg-surface rounded-xl border-2 border-neutral-light p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                {getIcon(tip.type)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-text-primary mb-2">{getTitle(tip.type)}</h3>
                {tip.type === 'packing' && Array.isArray(tip.content) ? (
                  <ul className="space-y-1">
                    {tip.content.map((item, i) => (
                      <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-text-secondary leading-relaxed">{tip.content}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TipsSection;
