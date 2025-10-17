export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Tell Us Your Preferences',
      description: 'Share your vibe, budget, dates, and departure city in under 2 minutes'
    },
    {
      number: '2',
      title: 'Get Personalized Recommendations',
      description: 'AI finds your perfect match from curated romantic destinations'
    },
    {
      number: '3',
      title: 'Receive Complete Itinerary',
      description: 'Day-by-day plans, budgets, hidden gems, and booking tips - ready to go!'
    }
  ];

  return (
    <div id="how-it-works" className="py-20 bg-gradient-to-b from-background to-surface">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-heading font-bold text-center mb-4 text-text-primary">
          How It Works
        </h2>
        <p className="text-center text-text-secondary mb-16 text-lg">
          From stressed to blessed in 3 simple steps
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="text-center relative">
              {/* Connector Line (hidden on last item and mobile) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-warm-gradient z-0" />
              )}
              
              <div className="relative z-10">
                <div className="bg-warm-gradient w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-4xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-text-primary">{step.title}</h3>
                <p className="text-text-secondary leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}