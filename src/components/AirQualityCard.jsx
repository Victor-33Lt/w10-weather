import { ShieldCheck, AlertCircle } from 'lucide-react'

export default function AirQualityCard({ airQuality, airStatus }) {
  if (!airQuality?.current || !airStatus) return null

  const { pm10, pm2_5 } = airQuality.current

  const getTip = (status) => {
    switch (status) {
      case '좋음':
        return '야외 활동과 환기를 마음껏 즐기기 좋은 맑은 공기입니다.'
      case '보통':
        return '일반적인 야외 활동에 무리가 없습니다.'
      case '나쁨':
        return '호흡기 질환자 및 노약자는 장시간 무리한 실외 활동을 자제하세요.'
      case '매우 나쁨':
        return '외출을 가급적 자제하시고 보건용 마스크를 반드시 착용하세요.'
      default:
        return '환경부 대기환경 기준 안내'
    }
  }

  return (
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

      <div className="air-tip-box" style={{ borderColor: `${airStatus.badgeColor}40` }}>
        {airStatus.status === '좋음' || airStatus.status === '보통' ? (
          <ShieldCheck size={18} color={airStatus.badgeColor} />
        ) : (
          <AlertCircle size={18} color={airStatus.badgeColor} />
        )}
        <p className="air-tip-text">{getTip(airStatus.status)}</p>
      </div>

      <div className="air-metrics">
        <div className="air-metric-box">
          <div className="air-metric-header">
            <span className="pollutant-name">미세먼지 (PM10)</span>
            <span className="pollutant-unit">µg/m³</span>
          </div>
          <div className="pollutant-val">
            {Math.round(pm10)}
          </div>
          <div className="pollutant-bar">
            <div
              className="pollutant-progress"
              style={{
                width: `${Math.min(100, (pm10 / 150) * 100)}%`,
                backgroundColor: airStatus.badgeColor
              }}
            />
          </div>
          <span className="air-threshold-desc">
            {pm10 <= 30 ? '좋음 (0~30)' : pm10 <= 80 ? '보통 (31~80)' : pm10 <= 150 ? '나쁨 (81~150)' : '매우 나쁨 (151~)'}
          </span>
        </div>

        <div className="air-metric-box">
          <div className="air-metric-header">
            <span className="pollutant-name">초미세먼지 (PM2.5)</span>
            <span className="pollutant-unit">µg/m³</span>
          </div>
          <div className="pollutant-val">
            {Math.round(pm2_5)}
          </div>
          <div className="pollutant-bar">
            <div
              className="pollutant-progress"
              style={{
                width: `${Math.min(100, (pm2_5 / 75) * 100)}%`,
                backgroundColor: airStatus.badgeColor
              }}
            />
          </div>
          <span className="air-threshold-desc">
            {pm2_5 <= 15 ? '좋음 (0~15)' : pm2_5 <= 35 ? '보통 (16~35)' : pm2_5 <= 75 ? '나쁨 (36~75)' : '매우 나쁨 (76~)'}
          </span>
        </div>
      </div>
    </article>
  )
}
