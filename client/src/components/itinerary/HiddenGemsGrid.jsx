import { Sparkles } from 'lucide-react';

const HiddenGemsGrid = ({ gems }) => {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-accent" aria-hidden="true" />
        </div>
        <h2 className="text-3xl font-bold text-text-primary">Hidden Gems</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gems.map((gem, index) => (
          <div
            key={index}
            className="bg-surface rounded-xl border-2 border-neutral-light p-6 hover:shadow-lg hover:border-primary/30 transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">💎</span>
              <div>
                <h3 className="text-lg font-bold text-primary mb-2">{gem.name}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {gem.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HiddenGemsGrid;
