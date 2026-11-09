import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, MapPin, X } from 'lucide-react'
import { searchCities } from '../api/weather'

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  // 400ms 디바운스(Debounce) 검색 연동
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      return
    }

    const handler = setTimeout(async () => {
      setIsSearching(true)
      try {
        const searchRes = await searchCities(trimmed)
        setResults(searchRes || [])
        setIsOpen(true)
      } catch (err) {
        console.error('검색 오류:', err)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => {
      clearTimeout(handler)
    }
  }, [query])

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (item) => {
    const parts = [item.name]
    if (item.admin1 && item.admin1 !== item.name) {
      parts.push(item.admin1)
    }
    const displayName = parts.join(', ') + (item.country ? ` (${item.country})` : '')

    onSelectCity({
      name: displayName,
      lat: item.latitude,
      lon: item.longitude
    })

    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault()
      handleSelect(results[0])
    }
  }

  return (
    <div className="city-search-wrapper" ref={wrapperRef}>
      <div className="search-input-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="전 세계 도시 검색 (예: Seoul, Tokyo, Paris, New York...)"
          value={query}
          onChange={(e) => {
            const val = e.target.value
            setQuery(val)
            if (val.trim().length < 2) {
              setResults([])
              setIsOpen(false)
            } else {
              setIsOpen(true)
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
        />
        {isSearching && <Loader2 size={16} className="search-loader spin-icon" />}
        {query && !isSearching && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="검색어 지우기"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* 드롭다운 결과 */}
      {isOpen && query.trim().length >= 2 && (
        <ul className="search-dropdown" role="listbox">
          {results.length === 0 && !isSearching && (
            <li className="search-no-result">일치하는 도시를 찾지 못했습니다.</li>
          )}
          {results.map((item, idx) => (
            <li
              key={`${item.id || idx}-${item.latitude}`}
              className="search-item"
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(item)}
            >
              <MapPin size={15} className="dropdown-pin" />
              <div className="search-item-info">
                <span className="search-item-name">{item.name}</span>
                <span className="search-item-meta">
                  {[item.admin1, item.country].filter(Boolean).join(', ')}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
