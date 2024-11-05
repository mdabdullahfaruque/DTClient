import { render, screen, waitFor } from '@testing-library/react';
import WeatherList from './WeatherList';

jest.mock('axios', () => ({
  get: jest.fn()
}));

import axios from 'axios';

interface MockWeather {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

const mockAxiosResponse = (success: boolean, data?: any, errorMessage?: string) => {
  if (success) {
    (axios.get as jest.Mock).mockResolvedValue({ data });
  } else {
    (axios.get as jest.Mock).mockRejectedValue(new Error(errorMessage || 'Unknown error'));
  }
};

describe('WeatherList Component', () => {
  const mockWeatherData: MockWeather[] = [
    { date: '2024-10-12', temperatureC: 32, summary: 'Hot', temperatureF: 89 },
    { date: '2024-10-13', temperatureC: 35, summary: 'Sweltering', temperatureF: 94 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', async () => {
    (axios.get as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<WeatherList />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('makes correct API call', async () => {
    mockAxiosResponse(true, mockWeatherData);
    render(<WeatherList />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('https://localhost:7250/weatherforecast');
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
  });

  test('renders weather data on successful fetch', async () => {
    mockAxiosResponse(true, mockWeatherData);
    render(<WeatherList />);

    await waitFor(() => expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument());

    expect(screen.getByText(/Weather Forecast/i)).toBeInTheDocument();

    mockWeatherData.forEach((weather) => {
      expect(screen.getByText(new RegExp(weather.date, 'i'))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`${weather.temperatureC}°C / ${weather.temperatureF}°F`, 'i'))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(weather.summary, 'i'))).toBeInTheDocument();
    });
  });

  test('renders empty list message when no data is returned', async () => {
    mockAxiosResponse(true, []);
    render(<WeatherList />);

    await waitFor(() => expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument());
    
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  test('displays error message when fetch fails', async () => {
    const errorMessage = 'Failed to fetch data';
    mockAxiosResponse(false, null, errorMessage);

    render(<WeatherList />);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(`Error: ${errorMessage}`, 'i'))).toBeInTheDocument();
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });
  });

  test('handles unknown error message', async () => {
    mockAxiosResponse(false);
    render(<WeatherList />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Unknown error/i)).toBeInTheDocument();
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });
  });
});