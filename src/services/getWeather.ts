import axios from "axios";

const API_KEY = "5149236ba6114eff9c9145201250110";


export  async function getWeather({location= 'Bangladesh'}) {
  try {
    const res = await axios.get(
      `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}&aqi=no`
    );
    return res.data; // API থেকে data return হবে
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null; // error হলে null ফেরত দেবে
  }
}

export  async function searchLocation(query: string) {
  try {
    const res = await axios.get(
      `http://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}`
    );
    return res.data; // Matching locations list
  } catch (error) {
    console.error("Error searching location:", error);
    return [];
  }
}