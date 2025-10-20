import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiSnow,
} from "react-icons/wi";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const apiKey = "785816c56f9a268cf789969fa3a8d3e5";

  const getWeather = async () => {
    if (!city) return;
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      setWeather(response.data);
      setError("");
    } catch (err) {
      setError("City not found 😢");
      setWeather(null);
    }
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
      default:
        return <WiDaySunny size={100} className="text-yellow-400" />;
    }
  };

  const temperatureData = [
    { day: "Mon", temp: weather ? weather.main.temp - 2 : 0 },
    { day: "Tue", temp: weather ? weather.main.temp - 1 : 0 },
    { day: "Wed", temp: weather ? weather.main.temp : 0 },
    { day: "Thu", temp: weather ? weather.main.temp + 1 : 0 },
    { day: "Fri", temp: weather ? weather.main.temp + 2 : 0 },
  ];

  const [particleColor, setParticleColor] = useState("#38bdf8");
  const [backgroundVideo, setBackgroundVideo] = useState("/assets/Default.mp4");

  useEffect(() => {
    if (!weather) return;
    const main = weather.weather[0].main;

    switch (main) {
      case "Clear":
        setParticleColor("#fde68a");
        setBackgroundVideo("/assets/Sunny.mp4");
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

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-white overflow-hidden">
      {/* 🎥 Full background video */}
      {backgroundVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-20"
          src={backgroundVideo}
          onError={(e) => console.error("Video load error:", e.target.src)}
        >
          Your browser does not support the video tag.
        </video>
      )}

      {/* ✨ Floating particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particleOptions}
        className="absolute inset-0 -z-10"
      />

      {/* 🧊 Weather Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 bg-black/30 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-3xl border border-white/20"
      >
        <h1 className="text-4xl font-extrabold text-center text-cyan-300 mb-8 tracking-wide drop-shadow-glow">
          🌦️ TechWeather Dashboard
        </h1>

        {/* 🔍 Search Bar */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Enter a city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="p-3 rounded-xl text-gray-900 w-full sm:w-2/3 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
          />
          <button
            onClick={getWeather}
            className="bg-cyan-400 hover:bg-cyan-500 text-black font-semibold px-6 py-3 rounded-xl shadow-md transition-transform transform hover:scale-105"
          >
            Search
          </button>
        </div>

        {error && <p className="text-center text-red-400 mb-3">{error}</p>}

        {/* 🌍 Weather Info */}
        {weather && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <h2 className="text-3xl font-bold drop-shadow">
                  {weather.name}, {weather.sys.country}
                </h2>
                <p className="capitalize text-gray-200 text-lg">
                  {weather.weather[0].description}
                </p>
                <p className="text-sm text-gray-300">
                  📍 {weather.coord.lat}, {weather.coord.lon}
                </p>
              </div>

              <motion.div className="flex flex-col items-center">
                {getWeatherIcon(weather.weather[0].main)}
                <h3 className="text-6xl font-bold mt-2 drop-shadow">
                  {Math.round(weather.main.temp)}°C
                </h3>
                <p className="text-gray-300">
                  Feels like {Math.round(weather.main.feels_like)}°C
                </p>
              </motion.div>
            </div>

            {/* 📊 Chart */}
            <motion.div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl mb-8">
              <h3 className="text-xl font-semibold mb-3 text-cyan-300 text-center">
                5-Day Temperature Trend
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="day" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.7)",
                      border: "none",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#22d3ee" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* 🗺️ Map */}
            <div className="rounded-3xl overflow-hidden shadow-lg border border-white/10">
              <iframe
                title="map"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  weather.coord.lon - 0.05
                }%2C${weather.coord.lat - 0.05}%2C${
                  weather.coord.lon + 0.05
                }%2C${weather.coord.lat + 0.05}&layer=mapnik&marker=${
                  weather.coord.lat
                }%2C${weather.coord.lon}`}
              ></iframe>
            </div>

            <p className="text-center text-gray-300 text-sm mt-6">
              Powered by{" "}
              <a
                href="https://openweathermap.org/"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-300 underline hover:text-cyan-200"
              >
                OpenWeatherMap
              </a>{" "}
              &{" "}
              <a
                href="https://www.openstreetmap.org/"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-300 underline hover:text-cyan-200"
              >
                OpenStreetMap
              </a>
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
