import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Activity,
  RefreshCw,
  AlertTriangle,
  MapPin,
  History,
  Trash2
} from 'lucide-react'
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData
} from './api/weather'
import CurrentWeather from './components/CurrentWeather'
import AirQualityCard from './components/AirQualityCard'
import HourlyChart from './components/HourlyChart'
import WeeklyForecast from './components/WeeklyForecast'
import CitySearch from './components/CitySearch'
import './App.css'

const RECENT_CITIES_KEY = 'w10_recent_cities'

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airQualityData, setAirQualityData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  // 옵션 D: 섭씨/화씨 토글 단위 상태 ('C' | 'F')
  const [tempUnit, setTempUnit] = useState('C')

  // 옵션 B: 최근 본 도시 localStorage 관리
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_CITIES_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // 기온 변환 헬퍼 (섭씨 ↔ 화씨)
  const convertTemp = useCallback(
    (celsius) => {
      if (celsius === undefined || celsius === null || isNaN(celsius)) return '-'
      if (tempUnit === 'F') {
        return Math.round(celsius * 1.8 + 32)
      }
      return Math.round(celsius)
    },
    [tempUnit]
  )

  // 도시 선택 시 최근 목록 저장
  const handleSelectCity = useCallback((city) => {
    setError(null)
    setIsLoading(true)
    setSelectedCity(city)

    setRecentCities((prev) => {
      const filtered = prev.filter(
        (c) => !(Math.abs(c.lat - city.lat) < 0.01 && Math.abs(c.lon - city.lon) < 0.01)
      )
      const updated = [city, ...filtered].slice(0, 5)
      try {
        localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(updated))
      } catch (e) {
        console.error('localStorage 저장 실패:', e)
      }
      return updated
    })
  }, [])

  const handleClearRecent = () => {
    setRecentCities([])
    try {
      localStorage.removeItem(RECENT_CITIES_KEY)
    } catch (e) {
      console.error(e)
    }
  }

  // 기상 및 공기질 API 데이터 페칭
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

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    setReloadTrigger((prev) => prev + 1)
  }

  const currentWeather = weatherData?.current
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null
  const currentAir = airQualityData?.current
  const airStatus = currentAir ? getAirQualityStatus(currentAir.pm10, currentAir.pm2_5) : null

  // 옵션 A: 날씨 상태 및 낮/밤 기반 동적 비주얼 테마 클래스 산출
  const themeClass = useMemo(() => {
    if (!currentWeather) return 'theme-default'
    if (currentWeather.is_day === 0) return 'theme-night'

    const code = currentWeather.weather_code
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(code)) return 'theme-rain'
    if ([71, 73, 75, 77].includes(code)) return 'theme-snow'
    if ([2, 3, 45, 48].includes(code)) return 'theme-cloudy'
    return 'theme-sunny'
  }, [currentWeather])

  return (
    <div className={`weather-app ${themeClass}`}>
      <header className="app-header">
        <div className="header-top-row">
          <div className="header-badge">
            <Activity size={15} /> 실시간 기상 관측 대시보드
          </div>

          {/* 옵션 D: 섭씨/화씨 단위 변환 토글 스위치 */}
          <div className="temp-unit-toggle">
            <button
              type="button"
              className={`unit-btn ${tempUnit === 'C' ? 'active' : ''}`}
              onClick={() => setTempUnit('C')}
              aria-label="섭씨 온도 (°C)"
            >
              °C
            </button>
            <button
              type="button"
              className={`unit-btn ${tempUnit === 'F' ? 'active' : ''}`}
              onClick={() => setTempUnit('F')}
              aria-label="화씨 온도 (°F)"
            >
              °F
            </button>
          </div>
        </div>

        <h1 className="app-title">스마트 날씨 & 미세먼지</h1>
        <p className="app-subtitle">
          Open-Meteo 전 세계 고해상도 기상 위성 API 실시간 연동
        </p>

        {/* 4단계: 도시 검색창 컴포넌트 (400ms 디바운스 적용) */}
        <CitySearch onSelectCity={handleSelectCity} />

        {/* 주요 도시 퀵 선택 바 */}
        <nav className="city-nav" aria-label="주요 도시 선택">
          {DEFAULT_CITIES.map((city) => {
            const isSelected =
              Math.abs(selectedCity.lat - city.lat) < 0.01 &&
              Math.abs(selectedCity.lon - city.lon) < 0.01
            return (
              <button
                key={city.name}
                type="button"
                className={`city-pill ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectCity(city)}
              >
                <MapPin size={13} />
                {city.name}
              </button>
            )
          })}
        </nav>

        {/* 옵션 B: 최근 본 도시 뱃지 */}
        {recentCities.length > 0 && (
          <div className="recent-cities-bar">
            <span className="recent-title">
              <History size={13} /> 최근 본 도시:
            </span>
            <div className="recent-chips">
              {recentCities.map((c) => (
                <button
                  key={`${c.name}-${c.lat}`}
                  type="button"
                  className="recent-chip"
                  onClick={() => handleSelectCity(c)}
                >
                  {c.name}
                </button>
              ))}
              <button
                type="button"
                className="clear-recent-btn"
                onClick={handleClearRecent}
                title="최근 기록 지우기"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="dashboard-content">
        {isLoading && (
          <div className="state-box loading">
            <RefreshCw className="spin-icon" size={38} />
            <p>
              <strong>{selectedCity.name}</strong>의 최신 기상 데이터를 수신하고 있습니다...
            </p>
          </div>
        )}

        {error && !isLoading && (
          <div className="state-box error">
            <AlertTriangle size={38} color="#ef4444" />
            <p className="error-title">기상 정보를 가져오지 못했습니다.</p>
            <p className="error-desc">{error}</p>
            <button type="button" className="retry-btn" onClick={handleRetry}>
              <RefreshCw size={14} /> 다시 시도
            </button>
          </div>
        )}

        {!isLoading && !error && currentWeather && currentAir && (
          <div className="dashboard-grid">
            {/* 현재 날씨 & 미세먼지 상단 그리드 */}
            <div className="cards-grid">
              <CurrentWeather
                city={selectedCity}
                currentWeather={currentWeather}
                weatherInfo={weatherInfo}
                tempUnit={tempUnit}
                convertTemp={convertTemp}
                todayPrecipProb={weatherData?.daily?.precipitation_probability_max?.[0]}
              />
              <AirQualityCard
                airQuality={airQualityData}
                airStatus={airStatus}
              />
            </div>

            {/* 24시간 시간별 기온 차트 */}
            {weatherData?.hourly && (
              <HourlyChart
                hourly={weatherData.hourly}
                tempUnit={tempUnit}
                convertTemp={convertTemp}
              />
            )}

            {/* 7일간 주간 예보 */}
            {weatherData?.daily && (
              <WeeklyForecast
                daily={weatherData.daily}
                convertTemp={convertTemp}
              />
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>기상청 및 Open-Meteo 공개 API 활용 · 26-w10-weather</p>
      </footer>
    </div>
  )
}
