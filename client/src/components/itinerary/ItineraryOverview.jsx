import { Hotel, Heart } from 'lucide-react';

const ItineraryOverview = ({ whyVisit, whereToStay }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {/* Why Visit Card */}
      <div className="bg-surface rounded-xl border-2 border-neutral-light p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-accent" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Why Visit</h2>
        </div>
        <p className="text-text-secondary leading-relaxed">
          {whyVisit}
        </p>
      </div>

      {/* Where to Stay Card */}
      <div className="bg-surface rounded-xl border-2 border-neutral-light p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Hotel className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Where to Stay</h2>
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">{whereToStay.name}</h3>
        <p className="text-accent-dark font-bold mb-3">{whereToStay.price}</p>
        <p className="text-text-secondary leading-relaxed">
          {whereToStay.description}
        </p>
      </div>
    </div>
  );
};

export default ItineraryOverview;
