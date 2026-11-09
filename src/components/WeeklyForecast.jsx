import { Calendar, Droplets } from 'lucide-react'
import { getWeatherInfo } from '../api/weather'
import WeatherIcon from './WeatherIcon'

export default function WeeklyForecast({
  daily,
  convertTemp
}) {
  if (!daily?.time || !daily?.weather_code) return null

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토']

  // 전체 7일 중 최저 및 최고 기온 (비주얼 바 비율 계산용)
  const allMins = daily.temperature_2m_min.map((t) => convertTemp(t))
  const allMaxs = daily.temperature_2m_max.map((t) => convertTemp(t))
  const globalMin = Math.min(...allMins)
  const globalMax = Math.max(...allMaxs)
  const globalRange = globalMax - globalMin || 1

  return (
    <article className="weekly-card">
      <div className="card-top">
        <div>
          <span className="card-badge">중기 기상 전망</span>
          <h2 className="city-display">
            <Calendar size={20} className="inline-icon" /> 향후 7일간 주간 예보
          </h2>
        </div>
      </div>

      <div className="weekly-list">
        {daily.time.slice(0, 7).map((dateStr, idx) => {
          const date = new Date(dateStr)
          const dayName =
            idx === 0
              ? '오늘'
              : idx === 1
              ? '내일'
              : `${daysOfWeek[date.getDay()]}요일`
          const monthDay = `${date.getMonth() + 1}.${date.getDate()}`

          const code = daily.weather_code[idx]
          const weather = getWeatherInfo(code)
          const minT = convertTemp(daily.temperature_2m_min[idx])
          const maxT = convertTemp(daily.temperature_2m_max[idx])
          const precipProb = daily.precipitation_probability_max
            ? daily.precipitation_probability_max[idx]
            : 0

          // 바 위치 계산 (0% ~ 100%)
          const barLeft = ((minT - globalMin) / globalRange) * 100
          const barWidth = Math.max(8, ((maxT - minT) / globalRange) * 100)

          return (
            <div key={dateStr} className={`weekly-row ${idx === 0 ? 'today' : ''}`}>
              <div className="weekly-day-info">
                <span className="weekly-day-name">{dayName}</span>
                <span className="weekly-date-sub">{monthDay}</span>
              </div>

              <div className="weekly-weather-cell">
                <WeatherIcon name={weather.icon} color={weather.color} size={22} />
                <span className="weekly-weather-label">{weather.label}</span>
                {precipProb > 0 && (
                  <span className="weekly-rain-prob">
                    <Droplets size={12} /> {precipProb}%
                  </span>
                )}
              </div>

              <div className="weekly-temp-bar-container">
                <span className="temp-low">{minT}°</span>
                <div className="temp-range-track">
                  <div
                    className="temp-range-fill"
                    style={{
                      left: `${barLeft}%`,
                      width: `${barWidth}%`
                    }}
                  />
                </div>
                <span className="temp-high">{maxT}°</span>
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}
