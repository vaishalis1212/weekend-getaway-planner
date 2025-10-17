import React, { useState } from 'react';
import WeatherWidget from './WeatherWidget2';

const WeatherCheck = () => {
  const [selectedCity, setSelectedCity] = useState('');

  // Major Indian metro cities
  const popularDestinations = [
    'Mumbai',
    'Bengaluru',
    'Pune',
    'Hyderabad',
    'Chennai',
    'Delhi'
  ];

  return (
    <section className="py-16 px-4 bg-background" id="weather-check">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-text-primary">
            Check Destination Weather
          </h2>
          <p className="text-lg text-text-secondary">
            Plan better with real-time weather updates for your weekend getaway
          </p>
        </div>

        {/* City Selection */}
        <div className="mb-8">
          <label className="block text-center text-sm font-medium mb-4 text-text-primary">
            Select a city to check weather:
          </label>
          <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
            {popularDestinations.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  selectedCity === city
                    ? 'bg-nature-gradient text-white shadow-lg scale-105'
                    : 'bg-white text-text-secondary hover:shadow-md hover:scale-105 border-2 border-neutral-light'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Weather Widget */}
        {selectedCity && (
          <div className="mt-8">
            <WeatherWidget 
              city={selectedCity} 
              onWeatherLoad={(data) => console.log('Weather loaded:', data)}
            />
          </div>
        )}

        {!selectedCity && (
          <div className="text-center py-12">
            <div className="inline-block bg-white rounded-2xl px-8 py-6 shadow-md border-2 border-neutral-light">
              <p className="text-lg font-medium mb-2 text-text-primary">
                👆 Select a city above
              </p>
              <p className="text-sm text-neutral">
                Get current weather information for your starting point
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default WeatherCheck;