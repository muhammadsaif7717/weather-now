"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { getWeather, searchLocation } from "@/services/getWeather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Wind, Droplets, Moon, Sun, Star, Sunrise, Sunset, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import GlobalLoading from "@/app/loading";

// --- Types ---
interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp_c: number;
    feelslike_c: number;
    is_day: number;
    condition: { text: string; icon: string; };
    wind_kph: number;
    humidity: number;
    vis_km: number;
    pressure_mb: number;
    uv: number;
    air_quality?: {
      "us-epa-index": number;
      pm2_5: number;
    };
  };
  forecast: {
    forecastday: Array<{
      date: string;
      astro: { sunrise: string; sunset: string; };
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: { text: string; icon: string; };
      };
      hour: Array<{
        time: string;
        temp_c: number;
        condition: { text: string; icon: string; };
      }>;
    }>;
  };
}

interface LocationSuggestion {
  id?: string;
  name: string;
  country: string;
}

// --- Translations ---
const translations = {
  en: {
    title: "Weather Now",
    searchPlaceholder: "Search city...",
    feelsLike: "Feels like",
    wind: "Wind",
    humidity: "Humidity",
    uvIndex: "UV Index",
    aqi: "Air Quality",
    sunrise: "Sunrise",
    sunset: "Sunset",
    hourly: "Hourly Forecast",
    daily: "7-Day Forecast",
    favorites: "Favorites"
  },
  bn: {
    title: "বর্তমান আবহাওয়া",
    searchPlaceholder: "শহর খুঁজুন...",
    feelsLike: "অনুভূত হচ্ছে",
    wind: "বাতাস",
    humidity: "আর্দ্রতা",
    uvIndex: "ইউভি ইনডেক্স",
    aqi: "বাতাসের মান",
    sunrise: "সূর্যোদয়",
    sunset: "সূর্যাস্ত",
    hourly: "ঘণ্টা অনুযায়ী পূর্বাভাস",
    daily: "৭ দিনের পূর্বাভাস",
    favorites: "প্রিয় অবস্থান"
  }
};

const getAbsoluteIconUrl = (iconUrl: string) => {
  return iconUrl.startsWith("//") ? `https:${iconUrl}` : iconUrl;
};

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [mounted, setMounted] = useState<boolean>(false);
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [favorites, setFavorites] = useState<string[]>([]);
  const { theme, setTheme } = useTheme();

  const t = translations[lang];

  useEffect(() => {
    setMounted(true);
    const savedFavs = localStorage.getItem("weather_favorites");
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }
  }, []);

  const fetchWeather = async (loc: string, currentLang: string = lang) => {
    setLoading(true);
    try {
      const data = await getWeather({ location: loc, lang: currentLang });
      setWeather(data);
      setError("");
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError(`Failed to fetch weather data for ${loc}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator && !weather) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(`${latitude},${longitude}`, lang);
        },
        (err) => {
          console.warn("Geolocation denied, using default:", err);
          fetchWeather("Dhaka, Bangladesh", lang);
        }
      );
    } else if (!weather) {
      fetchWeather("Dhaka, Bangladesh", lang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      const fetchSuggestions = async () => {
        try {
          const results = await searchLocation(query);
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

  const handleSearch = async (loc: string) => {
    setSuggestions([]);
    setQuery("");
    await fetchWeather(loc, lang);
  };

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "bn" : "en";
    setLang(newLang);
    if (weather) {
      fetchWeather(weather.location.name, newLang);
    }
  };

  const toggleFavorite = () => {
    if (!weather) return;
    const locName = weather.location.name;
    let newFavs = [...favorites];
    if (newFavs.includes(locName)) {
      newFavs = newFavs.filter(f => f !== locName);
    } else {
      newFavs.push(locName);
    }
    setFavorites(newFavs);
    localStorage.setItem("weather_favorites", JSON.stringify(newFavs));
  };

  const getBackgroundClass = () => {
    if (!weather) return "from-blue-100 via-blue-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950";
    const text = weather.current.condition.text.toLowerCase();
    const isDay = weather.current.is_day;
    
    if (!isDay) return "from-indigo-950 via-slate-900 to-black";
    if (text.includes("rain") || text.includes("drizzle") || text.includes("বৃষ্টি")) return "from-slate-400 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900";
    if (text.includes("cloud") || text.includes("overcast") || text.includes("মেঘলা")) return "from-blue-200 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900";
    if (text.includes("sun") || text.includes("clear") || text.includes("পরিষ্কার")) return "from-sky-300 via-blue-200 to-blue-100 dark:from-blue-900 dark:via-slate-800 dark:to-slate-900";
    
    return "from-blue-100 via-blue-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950";
  };

  if (!mounted) return null;

  const isFavorite = weather ? favorites.includes(weather.location.name) : false;

  return (
    <div className={cn(
      "min-h-screen w-full bg-gradient-to-br transition-all duration-1000 ease-in-out px-4 py-6 md:p-8 sm:px-6 pb-24",
      getBackgroundClass()
    )}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full animate-in fade-in zoom-in-95 duration-500">
        
        {/* Left Column (Desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Header Section */}
          <header className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                {t.title}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="rounded-full font-bold bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/10 hover:bg-white/40 dark:hover:bg-black/40 transition-all shadow-sm text-slate-800 dark:text-slate-200"
              >
                {lang === "en" ? "BN" : "EN"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/10 hover:bg-white/40 dark:hover:bg-black/40 transition-all shadow-sm"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-slate-800 dark:text-slate-200" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-800 dark:text-slate-200" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </header>

          {/* Search & Favorites */}
          <div className="relative w-full z-20 space-y-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-12 h-14 rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur-md border border-white/40 dark:border-white/10 text-base sm:text-lg shadow-lg dark:shadow-none focus-visible:ring-2 focus-visible:ring-blue-400/50 transition-all"
              />
            </div>
            
            {suggestions.length > 0 && (
              <Card className="absolute z-30 w-full mt-2 overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl animate-in slide-in-from-top-2">
                <ul className="max-h-64 overflow-y-auto p-1">
                  {suggestions.map((s) => (
                    <li
                      key={s.id || s.name}
                      onClick={() => handleSearch(s.name)}
                      className="px-4 py-3 cursor-pointer rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-3"
                    >
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                        <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{s.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{s.country}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Favorites List */}
            {favorites.length > 0 && !query && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {favorites.map(fav => (
                  <Badge
                    key={fav}
                    variant="outline"
                    className="cursor-pointer whitespace-nowrap bg-white/30 dark:bg-black/30 backdrop-blur-md border-white/40 py-1.5 px-3 hover:bg-white/50 transition-colors"
                    onClick={() => handleSearch(fav)}
                  >
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {fav}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Loading State Overlay */}
          {loading && <GlobalLoading />}

          {/* Error State */}
          {!loading && error && (
            <Alert variant="destructive" className="rounded-2xl bg-red-100/80 dark:bg-red-900/40 backdrop-blur-md border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Weather Main Card */}
          {!loading && weather && (
            <>
              <Card className="w-full overflow-hidden rounded-[2rem] bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl relative">
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/20 to-transparent dark:from-white/5 pointer-events-none" />
                <CardContent className="p-6 sm:p-8 flex flex-col items-center relative z-10">
                  <div className="flex items-center gap-2 sm:gap-3 mb-6 w-full justify-center relative">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-slate-700 dark:text-slate-300 shrink-0" />
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 text-center pr-8 sm:pr-0 truncate max-w-[80%]">
                      {weather.location.name}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-yellow-500 hover:bg-white/20 dark:hover:bg-black/20 rounded-full h-8 w-8 sm:h-10 sm:w-10"
                      onClick={toggleFavorite}
                    >
                      <Star className={cn("h-5 w-5 sm:h-6 sm:w-6 transition-all", isFavorite ? "fill-yellow-400" : "")} />
                    </Button>
                  </div>
                  
                  <div className="relative group flex flex-col items-center justify-center h-32 w-32 sm:h-40 sm:w-40">
                    <div className="absolute inset-0 bg-blue-400/20 dark:bg-blue-500/20 blur-3xl rounded-full scale-150 group-hover:scale-125 transition-transform duration-700" />
                    <Image
                      src={getAbsoluteIconUrl(weather.current.condition.icon).replace('64x64', '128x128')}
                      alt={weather.current.condition.text}
                      fill
                      className="object-contain drop-shadow-2xl relative z-10 animate-in zoom-in duration-700"
                    />
                  </div>
                  <div className="mt-2 text-6xl sm:text-7xl font-black text-slate-800 dark:text-white tracking-tighter drop-shadow-md">
                    {Math.round(weather.current.temp_c)}°
                  </div>

                  <div className="mt-4 flex flex-col items-center gap-2 text-center">
                    <Badge variant="secondary" className="text-base sm:text-lg px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white/60 dark:bg-black/40 text-slate-800 dark:text-slate-100 font-semibold backdrop-blur-md shadow-sm border border-white/30 dark:border-white/10 text-balance text-center h-auto min-h-[36px]">
                      {weather.current.condition.text}
                    </Badge>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                      {t.feelsLike} {Math.round(weather.current.feelslike_c)}°
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Astro (Sunrise / Sunset) */}
              {weather.forecast?.forecastday[0]?.astro && (
                <Card className="w-full rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-lg overflow-hidden">
                  <CardContent className="p-0 flex flex-col sm:flex-row sm:divide-x divide-y sm:divide-y-0 divide-white/20 dark:divide-white/10">
                    <div className="flex-1 p-4 sm:p-5 flex items-center justify-center gap-3 sm:gap-4 hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                      <Sunrise className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.sunrise}</p>
                        <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">{weather.forecast.forecastday[0].astro.sunrise}</p>
                      </div>
                    </div>
                    <div className="flex-1 p-4 sm:p-5 flex items-center justify-center gap-3 sm:gap-4 hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                      <Sunset className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 shrink-0" />
                      <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.sunset}</p>
                        <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">{weather.forecast.forecastday[0].astro.sunset}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Right Column (Desktop) */}
        {!loading && weather && (
          <div className="lg:col-span-7 flex flex-col gap-6 animate-in slide-in-from-bottom-6 duration-700 fill-mode-both">
            
            {/* Hourly Forecast */}
            {weather.forecast?.forecastday[0]?.hour && (
              <div className="w-full">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 px-1 uppercase tracking-wide">
                  {t.hourly}
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
                  {weather.forecast.forecastday[0].hour.filter((_, i) => i % 2 === 0).map((hour, index) => {
                    const time = new Date(hour.time).toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour: 'numeric' });
                    return (
                      <Card key={index} className="shrink-0 w-20 sm:w-24 rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-md">
                        <CardContent className="p-3 flex flex-col items-center gap-1 sm:gap-2">
                          <span className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400">{time}</span>
                          <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                            <Image src={getAbsoluteIconUrl(hour.condition.icon)} alt={hour.condition.text} fill className="object-contain" />
                          </div>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{Math.round(hour.temp_c)}°</span>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Standard Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <Card className="rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-lg hover:bg-white/50 dark:hover:bg-black/50 transition-colors">
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                  <div className="p-2 sm:p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                    <Wind className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.wind}</p>
                    <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">{weather.current.wind_kph} <span className="text-[10px] sm:text-xs font-medium text-slate-500">km/h</span></p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-lg hover:bg-white/50 dark:hover:bg-black/50 transition-colors">
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                  <div className="p-2 sm:p-3 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-xl text-cyan-600 dark:text-cyan-400 shrink-0">
                    <Droplets className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.humidity}</p>
                    <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">{weather.current.humidity}<span className="text-[10px] sm:text-sm text-slate-500">%</span></p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-lg hover:bg-white/50 dark:hover:bg-black/50 transition-colors">
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                  <div className="p-2 sm:p-3 bg-orange-500/10 dark:bg-orange-500/20 rounded-xl text-orange-600 dark:text-orange-400 shrink-0">
                    <Sun className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.uvIndex}</p>
                    <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">{weather.current.uv}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-lg hover:bg-white/50 dark:hover:bg-black/50 transition-colors">
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                  <div className="p-2 sm:p-3 bg-green-500/10 dark:bg-green-500/20 rounded-xl text-green-600 dark:text-green-400 shrink-0">
                    <Leaf className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.aqi}</p>
                    <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
                      {weather.current.air_quality ? weather.current.air_quality["us-epa-index"] : "N/A"} 
                      <span className="text-[10px] sm:text-xs font-medium text-slate-500"> EPA</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 7-Day Forecast */}
            {weather.forecast?.forecastday && (
              <Card className="w-full rounded-3xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-xl overflow-hidden flex-1">
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <CardTitle className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    {t.daily}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-col divide-y divide-white/20 dark:divide-white/10">
                    {weather.forecast.forecastday.map((day, index) => {
                      const date = new Date(day.date);
                      const dayName = date.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long' });
                      return (
                        <div key={index} className="flex items-center justify-between p-4 sm:p-5 hover:bg-white/20 dark:hover:bg-white/5 transition-colors gap-2">
                          <span className="w-20 sm:w-28 font-semibold text-sm sm:text-base text-slate-700 dark:text-slate-300 truncate">{index === 0 ? (lang === 'bn' ? 'আজ' : 'Today') : dayName}</span>
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center">
                            <div className="relative w-6 h-6 sm:w-8 sm:h-8 shrink-0">
                              <Image src={getAbsoluteIconUrl(day.day.condition.icon)} alt="condition" fill className="object-contain" />
                            </div>
                            <span className="text-[11px] sm:text-sm font-medium text-slate-600 dark:text-slate-400 hidden sm:block truncate max-w-[120px]">
                              {day.day.condition.text}
                            </span>
                          </div>
                          <div className="w-20 sm:w-24 text-right font-bold text-slate-800 dark:text-slate-200 flex justify-end gap-2 sm:gap-3 text-base sm:text-lg">
                            <span>{Math.round(day.day.maxtemp_c)}°</span>
                            <span className="text-slate-400 font-medium">{Math.round(day.day.mintemp_c)}°</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        )}
      </div>
    </div>
  );
}