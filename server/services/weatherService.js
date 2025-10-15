import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple in-memory cache with 10-minute expiry
const weatherCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Load city coordinates
const coordinatesPath = path.join(__dirname, '../data/city-coordinates.json');
const cityCoordinates = JSON.parse(fs.readFileSync(coordinatesPath, 'utf-8'));

/**
 * Fetch weather data for a city from OpenWeatherMap API
 * @param {string} cityName - Name of the city
 * @returns {Promise<Object>} Weather data
 */
export async function getWeatherForCity(cityName) {
  try {
    // Check cache first
    const cacheKey = cityName.toLowerCase();
    const cached = weatherCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      console.log(`☁️ Weather cache HIT for ${cityName}`);
      return cached.data;
    }

    // Get coordinates for the city
    const cityData = cityCoordinates[cityName];
    if (!cityData) {
      throw new Error(`City "${cityName}" not found in coordinates database`);
    }

    const { lat, lon } = cityData;
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      throw new Error('WEATHER_API_KEY not found in environment variables');
    }

    // Fetch from OpenWeatherMap Current Weather API
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    console.log(`🌤️  Fetching weather for ${cityName} (${lat}, ${lon})...`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Format the weather data
    const weatherData = {
      city: cityName,
      temp: Math.round(data.main.temp),
      tempUnit: '°C',
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      feelsLike: Math.round(data.main.feels_like),
      pressure: data.main.pressure,
      visibility: data.visibility ? Math.round(data.visibility / 1000) : null // Convert to km
    };

    // Cache the result
    weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now()
    });

    console.log(`✅ Weather fetched for ${cityName}: ${weatherData.temp}°C, ${weatherData.condition}`);

    return weatherData;

  } catch (error) {
    console.error(`❌ Error fetching weather for ${cityName}:`, error.message);

    // Return a fallback response
    return {
      city: cityName,
      temp: null,
      tempUnit: '°C',
      condition: 'Unavailable',
      description: 'Weather data unavailable',
      icon: null,
      error: error.message
    };
  }
}

/**
 * Get weather icons emoji based on OpenWeatherMap icon code
 * @param {string} iconCode - OpenWeatherMap icon code (e.g., '01d', '10n')
 * @returns {string} Weather emoji
 */
export function getWeatherEmoji(iconCode) {
  if (!iconCode) return '🌡️';

  const iconMap = {
    '01d': '☀️',  // clear sky day
    '01n': '🌙',  // clear sky night
    '02d': '🌤️', // few clouds day
    '02n': '☁️',  // few clouds night
    '03d': '☁️',  // scattered clouds
    '03n': '☁️',
    '04d': '☁️',  // broken clouds
    '04n': '☁️',
    '09d': '🌧️', // shower rain
    '09n': '🌧️',
    '10d': '🌦️', // rain day
    '10n': '🌧️', // rain night
    '11d': '⛈️',  // thunderstorm
    '11n': '⛈️',
    '13d': '❄️',  // snow
    '13n': '❄️',
    '50d': '🌫️', // mist
    '50n': '🌫️'
  };

  return iconMap[iconCode] || '🌡️';
}

/**
 * Fetch 5-day weather forecast for a city
 * @param {string} cityName - Name of the city
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Forecast data with current + forecast
 */
export async function getWeatherForecast(cityName, startDate, endDate) {
  try {
    // Get current weather first
    const currentWeather = await getWeatherForCity(cityName);

    // Check cache for forecast
    const cacheKey = `forecast_${cityName.toLowerCase()}_${startDate}_${endDate}`;
    const cached = weatherCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      console.log(`📅 Forecast cache HIT for ${cityName}`);
      return {
        current: currentWeather,
        forecast: cached.data
      };
    }

    // Get coordinates for the city
    const cityData = cityCoordinates[cityName];
    if (!cityData) {
      throw new Error(`City "${cityName}" not found in coordinates database`);
    }

    const { lat, lon } = cityData;
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      throw new Error('WEATHER_API_KEY not found in environment variables');
    }

    // Fetch 5-day forecast from OpenWeatherMap (free tier)
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    console.log(`📅 Fetching forecast for ${cityName} (${startDate} to ${endDate})...`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Forecast API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Filter forecast data for the selected date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Group forecasts by day
    const dailyForecasts = [];
    const forecastsByDay = new Map();

    data.list.forEach(item => {
      const forecastDate = new Date(item.dt * 1000);

      // Only include forecasts within the selected date range
      if (forecastDate >= start && forecastDate <= end) {
        const dayKey = forecastDate.toISOString().split('T')[0];

        if (!forecastsByDay.has(dayKey)) {
          forecastsByDay.set(dayKey, []);
        }
        forecastsByDay.get(dayKey).push(item);
      }
    });

    // Calculate daily averages
    forecastsByDay.forEach((forecasts, date) => {
      const temps = forecasts.map(f => f.main.temp);
      const conditions = forecasts.map(f => f.weather[0].main);
      const icons = forecasts.map(f => f.weather[0].icon);

      // Get most common condition
      const conditionCounts = {};
      conditions.forEach(c => conditionCounts[c] = (conditionCounts[c] || 0) + 1);
      const mostCommonCondition = Object.keys(conditionCounts).reduce((a, b) =>
        conditionCounts[a] > conditionCounts[b] ? a : b
      );

      // Get average temp
      const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
      const maxTemp = Math.round(Math.max(...temps));
      const minTemp = Math.round(Math.min(...temps));

      // Find matching icon
      const matchingIcon = forecasts.find(f => f.weather[0].main === mostCommonCondition)?.weather[0].icon || icons[0];

      dailyForecasts.push({
        date,
        temp: avgTemp,
        tempMax: maxTemp,
        tempMin: minTemp,
        condition: mostCommonCondition,
        icon: matchingIcon,
        description: forecasts[0].weather[0].description
      });
    });

    // Sort by date
    dailyForecasts.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Cache the forecast
    weatherCache.set(cacheKey, {
      data: dailyForecasts,
      timestamp: Date.now()
    });

    console.log(`✅ Forecast fetched for ${cityName}: ${dailyForecasts.length} days`);

    return {
      current: currentWeather,
      forecast: dailyForecasts,
      city: cityName,
      startDate,
      endDate
    };

  } catch (error) {
    console.error(`❌ Error fetching forecast for ${cityName}:`, error.message);

    // Return fallback with current weather only
    const currentWeather = await getWeatherForCity(cityName);
    return {
      current: currentWeather,
      forecast: [],
      error: error.message
    };
  }
}

/**
 * Clear the weather cache (useful for testing)
 */
export function clearWeatherCache() {
  weatherCache.clear();
  console.log('🗑️  Weather cache cleared');
}
