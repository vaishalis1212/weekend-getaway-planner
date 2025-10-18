import { useState } from 'react';
import Hero2 from './components/Hero2';
import HowItWorks2 from './components/HowItWorks2';
import FeaturesGrid2 from './components/FeaturesGrid2';
import Testimonials2 from './components/Testimonials2';
import Footer2 from './components/Footer2';
import WeatherCheck2 from './components/WeatherCheck2';
import PreferenceWizard from './components/PreferenceWizard';

function Hero2Demo() {
  const [showWizard, setShowWizard] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartPlanning = () => {
    setShowWizard(true);
  };

  const handleWizardComplete = (query, preferences) => {
    // Store wizard data in sessionStorage so the main app can use it
    sessionStorage.setItem('wizardData', JSON.stringify({ query, preferences }));
    // Redirect to the main app
    window.location.href = '/';
  };

  const handleWizardClose = () => {
    setShowWizard(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-neutral-light sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.reload()}>
              <span className="text-2xl">🌅</span>
              <span className="text-xl font-bold text-text-primary">Manzil</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('destinations')} className="text-text-secondary hover:text-primary transition-colors duration-300">
                Why Choose Us?
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-text-secondary hover:text-primary transition-colors duration-300">
                How It Works
              </button>
              <button onClick={() => scrollToSection('weather-check')} className="text-text-secondary hover:text-primary transition-colors duration-300">
                Weather
              </button>
              <button onClick={() => scrollToSection('reviews')} className="text-text-secondary hover:text-primary transition-colors duration-300">
                Reviews
              </button>
            </div>
            <button onClick={handleStartPlanning} className="bg-nature-gradient text-white py-2 px-6 rounded-lg font-semibold hover:shadow-xl hover:brightness-110 transition-all duration-300 focus:outline-none focus:ring-focus focus:ring-primary focus:ring-offset-focus">
              Start Planning
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <Hero2 scrollToPlanner={handleStartPlanning} />

      {/* How It Works Section */}
      <div id="how-it-works">
        <HowItWorks2 />
      </div>

      {/* Destinations/Features Section */}
      <div id="destinations">
        <FeaturesGrid2 />
      </div>

      {/* Weather Check Section */}
      <div id="weather-check">
        <WeatherCheck2 />
      </div>

      {/* Reviews/Testimonials Section */}
      <div id="reviews">
        <Testimonials2 />
      </div>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-warm-gradient">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready for Your Perfect Weekend?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join 1000+ couples who've discovered their dream getaways
          </p>
          <button
            onClick={handleStartPlanning}
            className="bg-accent-gradient text-text-primary py-4 px-10 rounded-lg font-bold text-lg hover:shadow-2xl hover:brightness-110 transition-all duration-300 focus:outline-none focus:ring-focus focus:ring-accent focus:ring-offset-focus"
          >
            Start Planning Now - It's Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer2 />

      {/* Wizard Overlay */}
      {showWizard && (
        <PreferenceWizard
          onComplete={handleWizardComplete}
          onClose={handleWizardClose}
        />
      )}
    </div>
  );
}

export default Hero2Demo;
