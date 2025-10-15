/**
 * Fetch weather data for a city from the backend API
 * @param {string} cityName - Name of the city
 * @returns {Promise<Object>} Weather data
 */
export async function fetchWeather(cityName) {
  try {
    const response = await fetch(`/api/weather/${encodeURIComponent(cityName)}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch weather: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching weather for ${cityName}:`, error);
    return {
      city: cityName,
      temp: null,
      condition: 'Unavailable',
      error: error.message
    };
  }
}

/**
 * Fetch weather forecast for a city with date range
 * @param {string} cityName - Name of the city
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Forecast data with current + forecast
 */
export async function fetchWeatherForecast(cityName, startDate, endDate) {
  try {
    const url = `/api/weather/${encodeURIComponent(cityName)}/forecast?startDate=${startDate}&endDate=${endDate}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch forecast: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching forecast for ${cityName}:`, error);
    // Fallback to current weather only
    const current = await fetchWeather(cityName);
    return {
      current,
      forecast: [],
      error: error.message
    };
  }
}

/**
 * Get weather emoji based on condition
 * @param {string} condition - Weather condition (e.g., 'Clear', 'Clouds', 'Rain')
 * @returns {string} Weather emoji
 */
export function getWeatherEmoji(condition) {
  const conditionMap = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️',
    'Smoke': '🌫️'
  };

  return conditionMap[condition] || '🌡️';
}
