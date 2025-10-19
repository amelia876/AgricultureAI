// src/services/weatherService.js
const WEATHER_API_KEY = 'bdd8c7194357397182941fe3a9b5742f'; // You'll need to get this from OpenWeatherMap

export const getCurrentWeather = async (city) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${bdd8c7194357397182941fe3a9b5742f
      }&units=imperial`
    );
    
    if (!response.ok) {
      throw new Error('Weather data not available');
    }
    
    const data = await response.json();
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      rainfall: data.rain ? `${data.rain['1h'] || 0}in` : '0in',
      city: data.name
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null; l  
  }
};


export const getWeatherForecast = async (city) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${bdd8c7194357397182941fe3a9b5742f}&units=imperial`
    );
    
    if (!response.ok) {
      throw new Error('Forecast data not available');
    }
    
    const data = await response.json();
    return data.list.slice(0, 5); // Next 5 forecasts
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return null;
  }
};