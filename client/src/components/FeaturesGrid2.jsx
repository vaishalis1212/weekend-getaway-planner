import { Clock, Heart, Wallet, Map, Star, Sparkles } from 'lucide-react';

export default function FeaturesGrid() {
  const features = [
    { 
      icon: <Clock className="w-8 h-8" />, 
      title: '5-Minute Planning', 
      desc: 'No more hours of research. Get your perfect trip in minutes.' 
    },
    { 
      icon: <Heart className="w-8 h-8" />, 
      title: 'Couple-Focused', 
      desc: 'Romantic experiences and hidden gems perfect for two.' 
    },
    { 
      icon: <Wallet className="w-8 h-8" />, 
      title: 'Budget Transparent', 
      desc: 'Know exactly what you will spend - no surprises!' 
    },
    { 
      icon: <Map className="w-8 h-8" />, 
      title: 'Complete Itineraries', 
      desc: 'Day-by-day plans with timing, restaurants, and activities.' 
    },
    { 
      icon: <Star className="w-8 h-8" />, 
      title: 'Personalized', 
      desc: 'Matches your unique preferences and travel style.' 
    },
    { 
      icon: <Sparkles className="w-8 h-8" />, 
      title: 'Local Secrets', 
      desc: 'Discover hidden gems, not just TripAdvisor top 10.' 
    }
  ];

  return (
    <div className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-heading font-bold text-center mb-4 text-text-primary">
          Why Choose Manzil?
        </h2>
        <p className="text-center text-text-secondary mb-16 text-lg">
          Planning made simple, trips made memorable
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-surface p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-primary mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-text-primary">{feature.title}</h3>
              <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}