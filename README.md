# 🌤️ Weather Now

A beautifully designed, mobile-first Progressive Web Application (PWA) that provides real-time weather updates, forecasts, and environmental metrics. Built with modern web technologies, it features a stunning glassmorphism UI and bilingual support (English & Bengali).

## ✨ Features

- **🌍 Real-time Weather:** Accurate current weather conditions, temperature, and "feels like" metrics.
- **📅 Extended Forecasts:** 7-day daily forecasts and detailed hourly predictions.
- **🍃 Advanced Metrics:** UV Index, Air Quality Index (AQI), Wind Speed, and Humidity.
- **🌗 Dark & Light Mode:** Seamless theme switching with a gorgeous glassmorphism UI that adapts to the current weather condition and time of day.
- **🌐 Bilingual Support:** Fully localized in English (EN) and Bengali (BN).
- **📍 Location Search & Geolocation:** Auto-detects your location or allows searching for cities worldwide with auto-complete suggestions.
- **⭐ Favorites:** Save your most visited locations for quick access.
- **📱 PWA Ready:** Installable on mobile and desktop devices with offline fallback support via service workers.
- **⚡ Fast & Responsive:** Mobile-first design that looks great on all screen sizes, powered by Next.js 16 and Turbopack.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4) with custom Glassmorphic styling
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) & [Lucide React](https://lucide.dev/)
- **State & Theme:** React Hooks, `next-themes`
- **PWA Integration:** `@serwist/next`
- **Weather Data API:** [WeatherAPI](https://www.weatherapi.com/)

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (v18 or later) installed on your system.

### 1. Clone the repository

```bash
git clone https://github.com/muhammadsaif7717/weather-now.git
cd weather-now
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory and add your WeatherAPI key:

```env
NEXT_PUBLIC_WEATHER_API_KEY=your_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app in action.

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
npm start
```

## 📱 Progressive Web App (PWA)

Weather Now is configured as a PWA using Serwist. In production, it registers a service worker that caches critical assets, providing a faster load time and a robust experience even on unstable networks. 
*Note: The service worker is intentionally disabled in development mode to support Turbopack hot-reloading.*

## 🎨 UI/UX Highlights

- **Dynamic Backgrounds:** The app background intelligently changes based on the time of day (day/night) and current weather conditions (sunny, rainy, cloudy).
- **Glassmorphism:** Cards and UI elements utilize `backdrop-blur` to create a premium, frosted-glass effect that lets the dynamic background shine through.
- **Micro-interactions:** Smooth transitions, hover effects, and global loading states ensure a polished and engaging user experience.

## 🤝 Contributing

Contributions are welcome! If you have suggestions or want to add features, feel free to open an issue or submit a pull request.
