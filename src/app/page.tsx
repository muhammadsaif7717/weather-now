"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { getWeather, searchLocation } from "@/services/getWeather";

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp_c: number;
    feelslike_c: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_kph: number;
    humidity: number;
    vis_km: number;
    pressure_mb: number;
  };
}

interface LocationSuggestion {
  id?: string;
  name: string;
  country: string;
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Wind, Droplets, Eye, Gauge, Moon, Sun } from "lucide-react";

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [mounted, setMounted] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect current location on load
 useEffect(() => {
  const fetchWeather = async (loc: string) => {
    setLoading(true);
    try {
      const data = await getWeather({ location: loc });
      setWeather(data);
      setError("");
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError(`Failed to fetch weather data for ${loc}`);
    } finally {
      setLoading(false);
    }
  };

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(`${latitude},${longitude}`);
      },
      (err) => {
        console.warn("Geolocation denied, showing Dhaka by default:", err);
        fetchWeather("Dhaka, Bangladesh"); // fallback
      }
    );
  } else {
    console.warn("Geolocation not supported, showing Dhaka by default");
    fetchWeather("Dhaka, Bangladesh"); // fallback
  }
}, []);


  // Search location suggestions
  useEffect(() => {
    if (query.length > 2) {
      const fetchSuggestions = async () => {
        try {
          const results = await searchLocation(query);
          console.log("Search results:", results);
          setSuggestions(results || []);
        } catch (err) {
          console.error("Search error:", err);
          setSuggestions([]);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Fetch weather for selected location
  const handleSearch = async (loc: string): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const data = await getWeather({ location: loc });
      console.log("Search weather data:", data);
      setWeather(data);
    } catch (err) {
      console.error("Search weather error:", err);
      setError(`Failed to fetch weather data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setSuggestions([]);
      setQuery("");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
              Weather Forecast
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time weather information for any location
            </p>
          </div>
          
          {/* Theme Toggle Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="shrink-0"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Search Box */}
        <div className="relative w-full max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a city or location..."
              className="pl-10 h-12 text-base shadow-lg"
            />
          </div>
          
          {suggestions.length > 0 && (
            <Card className="absolute z-10 w-full mt-2 shadow-xl">
              <CardContent className="p-0">
                <ul className="max-h-60 overflow-y-auto">
                  {suggestions.map((s, index) => (
                    <li
                      key={s.id || s.name}
                      onClick={() => handleSearch(s.name)}
                      className={`px-4 py-3 cursor-pointer hover:bg-accent transition-colors flex items-center gap-2 ${
                        index !== suggestions.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>
                        <strong>{s.name}</strong>, {s.country}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-32 w-32 rounded-full mx-auto" />
              <Skeleton className="h-6 w-1/3 mx-auto" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {!loading && error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto shadow-lg">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Weather Info */}
        {!loading && weather && (
          <div className="space-y-6">
            {/* Main Weather Card */}
            <Card className="max-w-2xl mx-auto shadow-xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-3xl flex items-center justify-center gap-2">
                  <MapPin className="h-6 w-6" />
                  {weather.location.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {weather.location.region && `${weather.location.region}, `}
                  {weather.location.country}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <img
                    src={weather.current.condition.icon}
                    alt={weather.current.condition.text}
                    className="w-32 h-32"
                  />
                  <div className="text-6xl font-bold mb-2">
                    {Math.round(weather.current.temp_c)}°C
                  </div>
                  <Badge variant="secondary" className="text-base px-4 py-1">
                    {weather.current.condition.text}
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Feels like {Math.round(weather.current.feelslike_c)}°C
                  </p>
                </div>

                {/* Weather Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center gap-2">
                      <Wind className="h-6 w-6 text-blue-500" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Wind</p>
                      <p className="font-semibold">{weather.current.wind_kph} km/h</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 flex flex-col items-center gap-2">
                      <Droplets className="h-6 w-6 text-blue-500" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Humidity</p>
                      <p className="font-semibold">{weather.current.humidity}%</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 flex flex-col items-center gap-2">
                      <Eye className="h-6 w-6 text-blue-500" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Visibility</p>
                      <p className="font-semibold">{weather.current.vis_km} km</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 flex flex-col items-center gap-2">
                      <Gauge className="h-6 w-6 text-blue-500" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Pressure</p>
                      <p className="font-semibold">{weather.current.pressure_mb} mb</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}