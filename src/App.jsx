import { useState, useEffect } from 'react'
import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  RefreshCw,
  AlertTriangle,
  MapPin,
  Activity
} from 'lucide-react'
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData
} from './api/weather'
import './App.css'

const ICON_MAP = {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning
}

function WeatherIcon({ name, size = 52, color }) {
  const IconComponent = ICON_MAP[name] || Cloud
  return <IconComponent size={size} color={color} />
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airQualityData, setAirQualityData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  useEffect(() => {
    let ignore = false

    Promise.all([
      fetchWeatherData(selectedCity.lat, selectedCity.lon),
      fetchAirQualityData(selectedCity.lat, selectedCity.lon)
    ])
      .then(([weather, airQuality]) => {
        if (!ignore) {
          setWeatherData(weather)
          setAirQualityData(airQuality)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || '데이터를 불러오는 중 문제가 발생했습니다.')
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [selectedCity, reloadTrigger])

  const handleCitySelect = (city) => {
    setError(null)
    setIsLoading(true)
    setSelectedCity(city)
  }

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    setReloadTrigger((prev) => prev + 1)
  }

  const currentWeather = weatherData?.current
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null

  const currentAir = airQualityData?.current
  const airStatus = currentAir ? getAirQualityStatus(currentAir.pm10, currentAir.pm2_5) : null

  return (
    <div className="weather-app">
      <header className="app-header">
        <div className="header-badge">
          <Activity size={16} /> 실시간 기상 관측소
        </div>
        <h1 className="app-title">스마트 날씨 & 미세먼지 대시보드</h1>
        <p className="app-subtitle">
          Open-Meteo 전 세계 기상 위성 API 실시간 연동
        </p>

        {/* 주요 도시 퀵 선택 바 */}
        <nav className="city-nav" aria-label="주요 도시 선택">
          {DEFAULT_CITIES.map((city) => (
            <button
              key={city.name}
              type="button"
              className={`city-pill ${selectedCity.name === city.name ? 'active' : ''}`}
              onClick={() => handleCitySelect(city)}
            >
              <MapPin size={14} />
              {city.name}
            </button>
          ))}
        </nav>
      </header>

      <main className="dashboard-content">
        {isLoading && (
          <div className="state-box loading">
            <RefreshCw className="spin-icon" size={36} />
            <p><strong>{selectedCity.name}</strong>의 최신 기상 데이터를 수신하고 있습니다...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="state-box error">
            <AlertTriangle size={36} color="#ef4444" />
            <p className="error-title">기상 정보를 가져오지 못했습니다.</p>
            <p className="error-desc">{error}</p>
            <button
              type="button"
              className="retry-btn"
              onClick={handleRetry}
            >
              <RefreshCw size={14} /> 다시 시도
            </button>
          </div>
        )}

        {!isLoading && !error && currentWeather && currentAir && (
          <div className="cards-grid">
            {/* 현재 날씨 카드 */}
            <article className="weather-card">
              <div className="card-top">
                <div>
                  <span className="card-badge">현재 날씨</span>
                  <h2 className="city-display">{selectedCity.name}</h2>
                </div>
                <div
                  className="weather-icon-wrapper"
                  style={{ backgroundColor: `${weatherInfo.color}18` }}
                >
                  <WeatherIcon name={weatherInfo.icon} color={weatherInfo.color} size={48} />
                </div>
              </div>

              <div className="temp-section">
                <div className="main-temp">
                  <span className="temp-number">
                    {Math.round(currentWeather.temperature_2m)}
                  </span>
                  <span className="temp-unit">°C</span>
                </div>
                <div
                  className="weather-label-pill"
                  style={{ backgroundColor: `${weatherInfo.color}22`, color: weatherInfo.color }}
                >
                  {weatherInfo.label}
                </div>
              </div>

              <div className="weather-metrics">
                <div className="metric-item">
                  <div className="metric-icon"><Thermometer size={18} /></div>
                  <div className="metric-info">
                    <span className="metric-name">체감 온도</span>
                    <span className="metric-value">
                      {Math.round(currentWeather.apparent_temperature)}°C
                    </span>
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-icon"><Droplets size={18} /></div>
                  <div className="metric-info">
                    <span className="metric-name">습도</span>
                    <span className="metric-value">
                      {currentWeather.relative_humidity_2m}%
                    </span>
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-icon"><Wind size={18} /></div>
                  <div className="metric-info">
                    <span className="metric-name">풍속</span>
                    <span className="metric-value">
                      {currentWeather.wind_speed_10m} <small>km/h</small>
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* 미세먼지 카드 */}
            <article className="air-card">
              <div className="card-top">
                <div>
                  <span className="card-badge">대기질 지수</span>
                  <h2 className="city-display">미세먼지 정보</h2>
                </div>
                <span
                  className="air-status-badge"
                  style={{ backgroundColor: airStatus.badgeColor }}
                >
                  {airStatus.status}
                </span>
              </div>

              <p className="air-notice">
                환경부 4단계 대기환경 기준 적용
              </p>

              <div className="air-metrics">
                <div className="air-metric-box">
                  <div className="air-metric-header">
                    <span className="pollutant-name">미세먼지 (PM10)</span>
                    <span className="pollutant-unit">µg/m³</span>
                  </div>
                  <div className="pollutant-val">
                    {Math.round(currentAir.pm10)}
                  </div>
                  <div className="pollutant-bar">
                    <div
                      className="pollutant-progress"
                      style={{
                        width: `${Math.min(100, (currentAir.pm10 / 150) * 100)}%`,
                        backgroundColor: airStatus.badgeColor
                      }}
                    />
                  </div>
                  <span className="air-threshold-desc">
                    {currentAir.pm10 <= 30 ? '좋음 (0~30)' : currentAir.pm10 <= 80 ? '보통 (31~80)' : currentAir.pm10 <= 150 ? '나쁨 (81~150)' : '매우 나쁨 (151~)'}
                  </span>
                </div>

                <div className="air-metric-box">
                  <div className="air-metric-header">
                    <span className="pollutant-name">초미세먼지 (PM2.5)</span>
                    <span className="pollutant-unit">µg/m³</span>
                  </div>
                  <div className="pollutant-val">
                    {Math.round(currentAir.pm2_5)}
                  </div>
                  <div className="pollutant-bar">
                    <div
                      className="pollutant-progress"
                      style={{
                        width: `${Math.min(100, (currentAir.pm2_5 / 75) * 100)}%`,
                        backgroundColor: airStatus.badgeColor
                      }}
                    />
                  </div>
                  <span className="air-threshold-desc">
                    {currentAir.pm2_5 <= 15 ? '좋음 (0~15)' : currentAir.pm2_5 <= 35 ? '보통 (16~35)' : currentAir.pm2_5 <= 75 ? '나쁨 (36~75)' : '매우 나쁨 (76~)'}
                  </span>
                </div>
              </div>
            </article>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>기상청 및 Open-Meteo 공개 API 활용 · 26-w10-weather</p>
      </footer>
    </div>
  )
}
