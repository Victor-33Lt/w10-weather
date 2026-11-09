import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { getWeatherInfo } from '../api/weather'
import WeatherIcon from './WeatherIcon'

export default function HourlyChart({
  hourly,
  tempUnit = 'C',
  convertTemp
}) {
  const chartData = useMemo(() => {
    if (!hourly?.time || !hourly?.temperature_2m) return []

    // 24시간 슬라이스
    const items = []
    const count = Math.min(24, hourly.time.length)

    for (let i = 0; i < count; i++) {
      const timeStr = hourly.time[i]
      const hourPart = timeStr.split('T')[1] || '00:00'
      const hour = parseInt(hourPart.split(':')[0], 10)
      const rawTemp = hourly.temperature_2m[i]
      const displayTemp = convertTemp(rawTemp)
      const weatherCode = hourly.weather_code ? hourly.weather_code[i] : 0
      const weather = getWeatherInfo(weatherCode)

      items.push({
        timeLabel: i === 0 ? '지금' : `${hour}시`,
        rawTemp,
        displayTemp,
        weather
      })
    }
    return items
  }, [hourly, convertTemp])

  if (chartData.length === 0) return null

  // SVG 차트 계산 (가로 760, 세로 130)
  const svgWidth = 760
  const svgHeight = 120
  const padX = 24
  const padTop = 26
  const padBottom = 26

  const temps = chartData.map((d) => d.displayTemp)
  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const tempRange = maxTemp - minTemp || 1

  const points = chartData.map((d, index) => {
    const x = padX + (index / (chartData.length - 1)) * (svgWidth - padX * 2)
    const y =
      svgHeight -
      padBottom -
      ((d.displayTemp - minTemp) / tempRange) * (svgHeight - padTop - padBottom)
    return { x, y, ...d }
  })

  // SVG 패스 생성
  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
  }, '')

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`

  return (
    <article className="hourly-chart-card">
      <div className="card-top">
        <div>
          <span className="card-badge">시간별 기온 추이</span>
          <h2 className="city-display">
            <Clock size={20} className="inline-icon" /> 24시간 시간대별 예보
          </h2>
        </div>
        <div className="chart-temp-range">
          최저 <strong className="min-t">{minTemp}°{tempUnit}</strong> / 최고 <strong className="max-t">{maxTemp}°{tempUnit}</strong>
        </div>
      </div>

      <div className="chart-scroll-wrapper">
        <div className="svg-container">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="hourly-svg" preserveAspectRatio="none">
            <defs>
              <linearGradient id="hourlyTempGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* 영역 그라데이션 */}
            <path d={areaPath} fill="url(#hourlyTempGrad)" />

            {/* 꺾은선 */}
            <path
              d={linePath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 데이터 포인트 원 & 기온 수치 */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="3.5" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
                {/* 2시간 간격으로 텍스트 표시해 겹침 방지 */}
                {i % 2 === 0 && (
                  <text
                    x={p.x}
                    y={p.y - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="#1e293b"
                    className="chart-point-text"
                  >
                    {p.displayTemp}°
                  </text>
                )}
              </g>
            ))}
          </svg>

          {/* 하단 시간 및 날씨 아이콘 행 */}
          <div className="hourly-items-row">
            {chartData.map((item, i) => (
              <div key={i} className="hourly-col-item">
                <span className="hourly-time">{item.timeLabel}</span>
                <div className="hourly-icon">
                  <WeatherIcon name={item.weather.icon} color={item.weather.color} size={18} />
                </div>
                <span className="hourly-deg">{item.displayTemp}°</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
