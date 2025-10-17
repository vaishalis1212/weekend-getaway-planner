import { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Loader2, Calendar } from 'lucide-react';
import { fetchWeather, fetchWeatherForecast, getWeatherEmoji } from '../utils/weatherApi';

const WeatherWidget = ({ cityName, compact = false, startDate = null, endDate = null }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadWeather() {
      if (!cityName) return;

      setLoading(true);
      setError(null);

      try {
        // If dates provided, fetch forecast; otherwise just current weather
        if (startDate && endDate) {
          const data = await fetchWeatherForecast(cityName, startDate, endDate);

          if (data.error) {
            setError(data.error);
          } else {
            setWeather(data.current);
            setForecast(data.forecast || []);
          }
        } else {
          const data = await fetchWeather(cityName);

          if (data.error) {
            setError(data.error);
          } else {
            setWeather(data);
            setForecast(null);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, [cityName, startDate, endDate]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-text-secondary text-sm">
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        <span>Loading weather...</span>
      </div>
    );
  }

  if (error || !weather || weather.temp === null) {
    return null; // Gracefully hide if weather unavailable
  }

  // Compact version for comparison cards (current weather only)
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
        <span className="text-2xl" role="img" aria-label={weather.condition}>
          {getWeatherEmoji(weather.condition)}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">
            {weather.temp}{weather.tempUnit}
          </p>
          <p className="text-xs text-text-secondary">{weather.condition}</p>
        </div>
      </div>
    );
  }

  // Full version for detailed itinerary - show only forecast if dates provided
  // Only show forecast when we have start/end dates
  if (!startDate || !endDate || !forecast || forecast.length === 0) {
    return null; // Don't show widget if no forecast available
  }

  return (
    <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-sky-900/30 dark:via-blue-900/30 dark:to-indigo-900/30 p-6 rounded-xl shadow-md border-2 border-sky-200 dark:border-sky-800">
      {/* Forecast Section - Only show trip dates */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-text-primary mb-1 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sky-600" aria-hidden="true" />
          Weather Forecast for Your Trip
        </h3>
        <p className="text-sm text-text-secondary">Expected conditions in {weather.city}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {forecast.map((day, index) => (
          <div
            key={index}
            className="bg-white/60 dark:bg-black/20 p-3 rounded-lg text-center hover:bg-white/80 dark:hover:bg-black/30 transition-colors"
          >
            <p className="text-xs font-semibold text-text-primary mb-1">
              {formatDate(day.date)}
            </p>
            <span className="text-3xl block mb-1" role="img" aria-label={day.condition}>
              {getWeatherEmoji(day.condition)}
            </span>
            <p className="text-sm font-bold text-primary">
              {day.temp}°C
            </p>
            <p className="text-xs text-text-secondary">
              {day.tempMin}° - {day.tempMax}°
            </p>
            <p className="text-xs text-text-secondary capitalize mt-1">
              {day.condition}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
        <p className="text-xs text-text-secondary">
          <span className="font-semibold text-primary">Planning Tip:</span>{' '}
          {getForecastTip(forecast)}
        </p>
      </div>
    </div>
  );
};

// Helper function to format date (e.g., "Oct 29")
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Helper function to provide weather-based tips
function getWeatherTip(weather) {
  const temp = weather.temp;
  const condition = weather.condition.toLowerCase();

  if (condition.includes('rain') || condition.includes('drizzle')) {
    return 'Pack an umbrella and waterproof jacket!';
  }
  if (condition.includes('thunder')) {
    return 'Thunderstorms expected. Plan indoor activities.';
  }
  if (condition.includes('clear') && temp > 30) {
    return 'Hot and sunny! Stay hydrated and use sunscreen.';
  }
  if (condition.includes('clear') && temp < 15) {
    return 'Cool and pleasant. Perfect for sightseeing!';
  }
  if (condition.includes('cloud')) {
    return 'Cloudy skies. Great weather for exploring!';
  }
  if (temp > 35) {
    return 'Very hot! Seek shade during midday.';
  }
  if (temp < 10) {
    return 'Chilly weather. Pack warm clothes!';
  }

  return 'Perfect weather for your getaway!';
}

// Helper function to provide forecast-based tips
function getForecastTip(forecast) {
  if (forecast.length === 0) return 'Enjoy your trip!';

  const rainyDays = forecast.filter(day =>
    day.condition.toLowerCase().includes('rain') ||
    day.condition.toLowerCase().includes('drizzle')
  ).length;

  const hotDays = forecast.filter(day => day.tempMax > 30).length;
  const coldDays = forecast.filter(day => day.tempMax < 15).length;

  if (rainyDays > forecast.length / 2) {
    return 'Rain expected on multiple days. Pack rain gear and plan indoor alternatives.';
  }
  if (rainyDays > 0) {
    return `Rain expected on ${rainyDays} day(s). Bring an umbrella and waterproof jacket.`;
  }
  if (hotDays > forecast.length / 2) {
    return 'Hot weather ahead! Pack light clothes, sunscreen, and stay hydrated.';
  }
  if (coldDays > 0) {
    return 'Cooler temperatures expected. Pack layers and warm clothing.';
  }

  return 'Pleasant weather throughout your trip. Perfect for outdoor activities!';
}

export default WeatherWidget;
