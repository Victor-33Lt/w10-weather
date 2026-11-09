import { Thermometer, Droplets, Wind, CloudRain, Sun, Moon } from 'lucide-react'
import WeatherIcon from './WeatherIcon'

export default function CurrentWeather({
  city,
  currentWeather,
  weatherInfo,
  tempUnit = 'C',
  convertTemp
}) {
  if (!currentWeather || !weatherInfo) return null

  const isDay = currentWeather.is_day === 1

  return (
    <article className="weather-card">
      <div className="card-top">
        <div>
          <div className="card-header-meta">
            <span className="card-badge">현재 날씨</span>
            <span className={`day-night-pill ${isDay ? 'day' : 'night'}`}>
              {isDay ? <Sun size={12} /> : <Moon size={12} />}
              {isDay ? '주간' : '야간'}
            </span>
          </div>
          <h2 className="city-display">{city.name}</h2>
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
            {convertTemp(currentWeather.temperature_2m)}
          </span>
          <span className="temp-unit">°{tempUnit}</span>
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
              {convertTemp(currentWeather.apparent_temperature)}°{tempUnit}
            </span>
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-icon"><Droplets size={18} /></div>
          <div className="metric-info">
            <span className="metric-name">상대 습도</span>
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

        <div className="metric-item">
          <div className="metric-icon"><CloudRain size={18} /></div>
          <div className="metric-info">
            <span className="metric-name">강수량</span>
            <span className="metric-value">
              {currentWeather.precipitation || 0} <small>mm</small>
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
