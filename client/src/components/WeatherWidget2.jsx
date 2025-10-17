import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, Eye } from 'lucide-react';

const WeatherWidget = ({ city, onWeatherLoad }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get API key from environment variable
const API_KEY = '748abd49b1b339b756416d9fcaa61e62';

  useEffect(() => {
    if (city && API_KEY) {
      fetchWeather(city);
    } else if (city && !API_KEY) {
      setError('API key not found. Please check your .env file.');
    }
  }, [city, API_KEY]);

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName},IN&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('City not found');
      }
      
      const data = await response.json();
      
      const weatherInfo = {
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        tempMin: Math.round(data.main.temp_min),
        tempMax: Math.round(data.main.temp_max),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        visibility: (data.visibility / 1000).toFixed(1),
        icon: data.weather[0].main,
        cityName: data.name,
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      
      setWeatherData(weatherInfo);
      if (onWeatherLoad) {
        onWeatherLoad(weatherInfo);
      }
    } catch (err) {
      setError(err.message);
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    switch(condition?.toLowerCase()) {
      case 'clear':
        return <Sun className="w-12 h-12 text-accent" />;
      case 'clouds':
        return <Cloud className="w-12 h-12 text-neutral" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-12 h-12 text-blue-500" />;
      default:
        return <Wind className="w-12 h-12 text-primary-light" />;
    }
  };

  const getWeatherAdvice = (temp) => {
    if (temp > 30) {
      return "🌞 It's hot! Pack light, breathable clothes and sunscreen.";
    } else if (temp > 20) {
      return "🌤️ Pleasant weather! Perfect for outdoor activities.";
    } else if (temp > 15) {
      return "🍂 Mild weather. Bring a light jacket for evenings.";
    } else {
      return "🧥 Cool weather ahead. Pack warm clothes!";
    }
  };

  if (loading) {
    return (
      <div className="bg-violet-gradient rounded-2xl p-8 shadow-lg border-2 border-secondary-light/30">
        <div className="flex items-center justify-center space-x-3">
          <Wind className="w-6 h-6 animate-spin text-text-primary" />
          <p className="text-lg font-medium text-text-primary">
            Fetching weather data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-8 shadow-lg border-2 border-red-200">
        <p className="text-red-600 text-center font-medium">
          ⚠️ {error}
        </p>
        <p className="text-red-500 text-sm text-center mt-2">
          {error.includes('API key') ? 'Check your .env file has REACT_APP_WEATHER_API_KEY' : `Unable to fetch weather for ${city}`}
        </p>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <div className="bg-violet-gradient rounded-2xl p-6 md:p-8 shadow-xl border-2 border-secondary-light/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-text-primary">
            {weatherData.cityName}
          </h3>
          <p className="text-sm capitalize text-text-secondary">
            {weatherData.description}
          </p>
        </div>
        {getWeatherIcon(weatherData.icon)}
      </div>

      {/* Main Temperature */}
      <div className="text-center mb-6">
        <div className="text-6xl font-bold text-text-primary">
          {weatherData.temp}°C
        </div>
        <p className="text-sm mt-2 text-text-secondary">
          Feels like {weatherData.feelsLike}°C
        </p>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
          <Thermometer className="w-6 h-6 mx-auto mb-2 text-accent" />
          <p className="text-xs font-medium mb-1 text-neutral">High/Low</p>
          <p className="text-lg font-bold text-text-primary">
            {weatherData.tempMax}°/{weatherData.tempMin}°
          </p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
          <Droplets className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <p className="text-xs font-medium mb-1 text-neutral">Humidity</p>
          <p className="text-lg font-bold text-text-primary">
            {weatherData.humidity}%
          </p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
          <Wind className="w-6 h-6 mx-auto mb-2 text-primary-light" />
          <p className="text-xs font-medium mb-1 text-neutral">Wind</p>
          <p className="text-lg font-bold text-text-primary">
            {weatherData.windSpeed} m/s
          </p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
          <Eye className="w-6 h-6 mx-auto mb-2 text-secondary" />
          <p className="text-xs font-medium mb-1 text-neutral">Visibility</p>
          <p className="text-lg font-bold text-text-primary">
            {weatherData.visibility} km
          </p>
        </div>
      </div>

      {/* Sun Times */}
      <div className="flex justify-around bg-white/40 backdrop-blur-sm rounded-xl p-4 mb-4">
        <div className="text-center">
          <p className="text-xs font-medium mb-1 text-neutral">🌅 Sunrise</p>
          <p className="text-sm font-bold text-text-primary">{weatherData.sunrise}</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-medium mb-1 text-neutral">🌇 Sunset</p>
          <p className="text-sm font-bold text-text-primary">{weatherData.sunset}</p>
        </div>
      </div>

      {/* Weather Advice */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
        <p className="text-sm font-medium text-text-primary">
          {getWeatherAdvice(weatherData.temp)}
        </p>
      </div>

      {/* Footer */}
      <p className="text-xs text-center mt-4 text-neutral">
        Updated: {new Date().toLocaleTimeString('en-IN')} | Pack accordingly! ✨
      </p>
    </div>
  );
};

export default WeatherWidget;