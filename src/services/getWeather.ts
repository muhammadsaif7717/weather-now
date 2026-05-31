import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

export async function getWeather({ location = 'Bangladesh', lang = 'en' }) {
  try {
    const res = await axios.get(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=7&aqi=yes&alerts=no&lang=${lang}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching weather:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || "Failed to fetch weather data");
    }
    throw new Error("Failed to fetch weather data");
  }
}

export async function searchLocation(query: string) {
  try {
    const res = await axios.get(
      `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}`
    );
    return res.data;
  } catch (error) {
    console.error("Error searching location:", error);
    if (axios.isAxiosError(error)) {
      console.error("API Error:", error.response?.data);
    }
    return [];
  }
}