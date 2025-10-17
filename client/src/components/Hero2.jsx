import React from 'react';

const Hero = ({ scrollToPlanner }) => {
  return (
    <section className="relative py-20 px-4 overflow-hidden min-h-[600px]">
      {/* Background Image with Traveling Caravan/Van */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=1920&q=80" 
          alt="Travel Caravan Background"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Animated Travel Icons */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl animate-pulse">✈️</div>
        <div className="absolute top-40 right-20 text-5xl animate-pulse delay-100">🏖️</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-pulse delay-200">🏔️</div>
        <div className="absolute top-60 left-1/3 text-4xl animate-pulse delay-300">🎒</div>
        <div className="absolute bottom-40 right-1/4 text-5xl animate-pulse">🗺️</div>
        <div className="absolute top-32 right-1/3 text-4xl animate-pulse delay-150">🌴</div>
      </div>

      {/* Decorative light overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-6">
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 text-white text-sm font-medium shadow-lg">
              💑 Personalized
            </span>
            <span className="bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 text-white text-sm font-medium shadow-lg">
              ⚡ 5 Minutes
            </span>
            <span className="bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 text-white text-sm font-medium shadow-lg">
              💎 Hidden Gems
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
            Plan Your Perfect<br />
            <span className="text-accent-light">Weekend Escape</span><br />
            <span className="text-white">in 5 Minutes</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-lg">
            Personalized itineraries for couples. No more endless browsing.
          </p>

          {/* CTA Button */}
          <div className="pt-12">
            <button
              onClick={scrollToPlanner}
              className="bg-accent-gradient text-text-primary py-4 px-8 rounded-lg font-bold text-lg hover:shadow-2xl hover:brightness-110 transition-all duration-300 focus:outline-none focus:ring-focus focus:ring-primary focus:ring-offset-focus inline-flex items-center space-x-2 shadow-xl"
            >
              <span>Start Planning Now</span>
              <span>→</span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="pt-6 flex items-center justify-center space-x-2 text-white/90 drop-shadow-lg">
            <span className="text-2xl">💑</span>
            <span className="text-sm font-medium">Trusted by 1000+ travelers</span>
          </div>
        </div>
      </div>

      {/* Add keyframes for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.1);
          }
        }
        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-150 {
          animation-delay: 0.15s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </section>
  );
};

export default Hero;