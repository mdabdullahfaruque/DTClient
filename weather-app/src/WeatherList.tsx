import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface WeatherData {
  date: string;
  temperatureC: number;
  summary: string;
  temperatureF: number;
}

const WeatherList: React.FC = () => {
  const [data, setData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = () => {
      axios.get('https://localhost:7250/weatherforecast')
        .then(response => {
          setData(response.data);
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Unknown error');
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchWeatherData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
    <h1>Weather Forecast</h1>
    {data.map((weather, index) => (
      <div>
        <p>Date: {weather.date}</p>
        <p>Temperature: {weather.temperatureC}°C / {weather.temperatureF}°F</p>
        <p>Summary: {weather.summary}</p>
        {index < data.length - 1 && <span> • </span>}
      </div>
    ))}
  </div>
  );
};

export default WeatherList;
