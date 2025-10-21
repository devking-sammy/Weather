import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiSnow,
  WiThunderstorm,
} from "react-icons/wi";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [error, setError] = useState("");
  const [particleColor, setParticleColor] = useState("#38bdf8");
  const [backgroundVideo, setBackgroundVideo] = useState("/assets/Default.mp4");
  const [coords, setCoords] = useState({ lat: 0, lon: 0 });

  const apiKey = "785816c56f9a268cf789969fa3a8d3e5"; // ✅ Your OpenWeather key

  // Fetch weather data
  const getWeather = async () => {
    if (!city) return;
    try {
      // Current weather
      const currentRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      setWeather(currentRes.data);
      setCoords(currentRes.data.coord);
      setError("");

      const { lat, lon } = currentRes.data.coord;

      // Forecast (3-hourly, next 5 days)
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );

      const hourly = forecastRes.data.list.slice(0, 8).map((h) => ({
        time: new Date(h.dt * 1000).getHours() + ":00",
        temp: Math.round(h.main.temp),
      }));
      setHourlyData(hourly);

      const daily = forecastRes.data.list
        .filter((_, index) => index % 8 === 0)
        .slice(0, 8)
        .map((d) => ({
          date: new Date(d.dt * 1000).toLocaleDateString("en-US", {
            weekday: "short",
          }),
          temp_max: Math.round(d.main.temp_max),
          temp_min: Math.round(d.main.temp_min),
          description: d.weather[0].description,
          icon: d.weather[0].icon,
        }));
      setDailyForecast(daily);
    } catch (err) {
      console.error(err);
      setError("City not found or API request failed 😢");
      setWeather(null);
      setHourlyData([]);
      setDailyForecast([]);
    }
  };

  // Dynamic visuals
  useEffect(() => {
    if (!weather) return;
    const main = weather.weather[0].main;
    switch (main) {
      case "Clear":
        setParticleColor("#fde68a");
        setBackgroundVideo("/assets/Clearsky.mp4");
        break;
      case "Clouds":
        setParticleColor("#d4d4d4");
        setBackgroundVideo("/assets/Cloudy.mp4");
        break;
      case "Rain":
        setParticleColor("#38bdf8");
        setBackgroundVideo("/assets/Rainy.mp4");
        break;
      case "Snow":
        setParticleColor("#93c5fd");
        setBackgroundVideo("/assets/Snowy.mp4");
        break;
      case "Thunderstorm":
        setParticleColor("#a78bfa");
        setBackgroundVideo("/assets/ThunderStorm.mp4");
        break;
      default:
        setParticleColor("#38bdf8");
        setBackgroundVideo("/assets/Default.mp4");
    }
  }, [weather]);

  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  const particleOptions = {
    background: { color: { value: "transparent" } },
    particles: {
      number: { value: 50 },
      color: { value: particleColor },
      opacity: { value: 0.4 },
      size: { value: 2 },
      move: { enable: true, speed: 0.5 },
      links: { enable: true, color: particleColor, opacity: 0.1 },
    },
    detectRetina: true,
  };

  const getWeatherIcon = (main) => {
    switch (main) {
      case "Clear":
        return <WiDaySunny size={100} className="text-yellow-400" />;
      case "Clouds":
        return <WiCloud size={100} className="text-gray-200" />;
      case "Rain":
        return <WiRain size={100} className="text-blue-400" />;
      case "Snow":
        return <WiSnow size={100} className="text-white" />;
      case "Thunderstorm":
        return <WiThunderstorm size={100} className="text-purple-400" />;
      default:
        return <WiDaySunny size={100} className="text-yellow-400" />;
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-white overflow-hidden">
      {/* Background video */}
      {backgroundVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-20"
          src={backgroundVideo}
        />
      )}

      {/* Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particleOptions}
        className="absolute inset-0 -z-10"
      />

      {/* Weather Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 bg-black/30 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-6xl border border-white/20"
      >
        <h1 className="text-4xl font-extrabold text-center text-cyan-300 mb-8">
          🌦️ Weather App
        </h1>

        {/* 📍 Location Search Bar */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 w-full">
          <div className="flex items-center bg-white/20 backdrop-blur-xl border border-cyan-400/40 rounded-2xl px-5 py-3 w-full sm:w-2/3 shadow-lg focus-within:ring-2 focus-within:ring-cyan-300 transition-all duration-300">
            {/* 📍 Location Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="cyan"
              className="w-6 h-6 mr-3 text-cyan-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 11.25a1.875 1.875 0 100-3.75 1.875 1.875 0 000 3.75z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21c4.97-4.125 8.25-8.25 8.25-12A8.25 8.25 0 0012 0.75 8.25 8.25 0 003.75 9c0 3.75 3.28 7.875 8.25 12z"
              />
            </svg>

            {/* Input Field */}
            <input
              type="text"
              placeholder="Enter location..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-transparent flex-1 text-white placeholder-gray-300 outline-none text-lg"
            />

            {/* 🔍 Search Icon Button */}
            <button
              onClick={getWeather}
              className="p-2 ml-2 bg-cyan-400/20 hover:bg-cyan-400/30 rounded-full transition-all duration-300 hover:scale-110 shadow-md border border-cyan-400/40"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="cyan"
                className="w-6 h-6 text-cyan-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1011.25 3a7.5 7.5 0 005.4 13.65z"
                />
              </svg>
            </button>
          </div>
        </div>

        {weather && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* City Info */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-bold">
                  {weather.name}, {weather.sys.country}
                </h2>
                <p className="capitalize text-gray-200 text-lg">
                  {weather.weather[0].description}
                </p>
              </div>
              <div className="flex flex-col items-center">
                {getWeatherIcon(weather.weather[0].main)}
                <h3 className="text-6xl font-bold mt-2">
                  {Math.round(weather.main.temp)}°C
                </h3>
                <p className="text-gray-300">
                  Feels like {Math.round(weather.main.feels_like)}°C
                </p>
              </div>
            </div>

            {/* 🌍 Map Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3 text-cyan-300 text-center">
                Map Location
              </h3>
              <div className="rounded-3xl overflow-hidden shadow-lg">
                <MapContainer
                  center={[coords.lat, coords.lon]}
                  zoom={10}
                  scrollWheelZoom={false}
                  className="h-64 w-full z-0"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap contributors"
                  />
                  <Marker position={[coords.lat, coords.lon]}>
                    <Popup>
                      {weather.name}, {weather.sys.country}
                      <br />
                      {weather.weather[0].description}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            {/* Hourly + Daily Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {hourlyData.length > 0 && (
                <motion.div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl">
                  <h3 className="text-xl font-semibold mb-3 text-cyan-300 text-center">
                    Hourly Forecast
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={hourlyData}>
                      <defs>
                        <linearGradient
                          id="colorTemp"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#22d3ee"
                            stopOpacity={0.7}
                          />
                          <stop
                            offset="95%"
                            stopColor="#22d3ee"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <XAxis dataKey="time" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.6)",
                          border: "none",
                          borderRadius: "10px",
                          color: "#fff",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="temp"
                        stroke="#22d3ee"
                        fillOpacity={1}
                        fill="url(#colorTemp)"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "#22d3ee" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {dailyForecast.length > 0 && (
                <motion.div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl">
                  <h3 className="text-xl font-semibold mb-3 text-cyan-300 text-center">
                    8-Day Forecast
                  </h3>
                  <ul className="space-y-3">
                    {dailyForecast.map((day, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center border-b border-white/10 pb-2"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                            alt={day.description}
                            className="w-10 h-10"
                          />
                          <span className="text-lg">{day.date}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg">
                            {day.temp_max}° / {day.temp_min}°C
                          </p>
                          <p className="capitalize text-sm text-gray-300">
                            {day.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
