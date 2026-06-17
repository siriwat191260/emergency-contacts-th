'use client'
import { useState, useCallback, useEffect, useRef } from 'react'

interface Place {
  id: string
  name: string
  addr: string
  phone: string | null
  lat: number
  lng: number
  type: 'hospital' | 'police' | 'fire'
  icon: string
  label: string
  rating: number | null
  open: boolean
}

type FilterType = 'all' | 'hospital' | 'police' | 'fire'

function calcDist(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function fmtDist(m: number) {
  return m < 1000 ? `${Math.round(m)} ม.` : `${(m/1000).toFixed(1)} กม.`
}

const FILTER_LABELS: { key: FilterType; label: string }[] = [
  { key: 'all',      label: '🏥👮 ทั้งหมด' },
  { key: 'hospital', label: '🏥 โรงพยาบาล' },
  { key: 'police',   label: '👮 ตำรวจ' },
  { key: 'fire',     label: '🚒 ดับเพลิง' },
]

export default function NearbyScreen() {
  const [places, setPlaces]       = useState<Place[]>([])
  const [loading, setLoading]     = useState(false)
  const [located, setLocated]     = useState(false)
  const [userLat, setUserLat]     = useState<number | null>(null)
  const [userLng, setUserLng]     = useState<number | null>(null)
  const [locText, setLocText]     = useState('')
  const [locAcc, setLocAcc]       = useState('')
  const [error, setError]         = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [filter, setFilter]       = useState<FilterType>('all')
  const [view, setView]           = useState<'list' | 'map'>('list')
  const mapRef                    = useRef<HTMLDivElement>(null)
  const leafletMap                = useRef<any>(null)
  const markersRef                = useRef<any[]>([])

  // Load Leaflet dynamically (ไม่ SSR)
  useEffect(() => {
    if (view !== 'map' || !mapRef.current || leafletMap.current) return
    import('leaflet').then(L => {
      // Fix default icon
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, { zoomControl: true })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      leafletMap.current = map

      // Center on user or Bangkok
      if (userLat && userLng) {
        map.setView([userLat, userLng], 14)
        // User marker
        L.circleMarker([userLat, userLng], {
          radius: 10, fillColor: '#6B50D8', color: '#fff',
          weight: 3, fillOpacity: 1,
        }).addTo(map).bindPopup('📍 ตำแหน่งของคุณ')
      } else {
        map.setView([13.7563, 100.5018], 12)
      }

      // Add existing places
      addMarkers(L, map)
    })
  }, [view])

  function addMarkers(L: any, map: any) {
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const visible = filter === 'all' ? places : places.filter(p => p.type === filter)
    visible.forEach(p => {
      if (!p.lat || !p.lng) return
      const color = p.type === 'police' ? '#3B5998' : p.type === 'fire' ? '#E24B4A' : '#6B50D8'
      const icon = L.divIcon({
        html: `<div style="background:${color};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${p.icon}</div>`,
        iconSize: [36, 36], iconAnchor: [18, 18], className: '',
      })
      const dist = userLat && userLng ? fmtDist(calcDist(userLat, userLng, p.lat, p.lng)) : ''
      const popup = `
        <div style="font-family:-apple-system,sans-serif;min-width:180px">
          <p style="font-weight:700;font-size:14px;margin:0 0 4px">${p.name}</p>
          <p style="font-size:12px;color:#666;margin:0 0 4px">${p.addr}</p>
          ${dist ? `<p style="font-size:12px;color:#6B50D8;font-weight:600;margin:0 0 8px">📍 ${dist}</p>` : ''}
          ${p.phone ? `<a href="tel:${p.phone.replace(/\D/g,'')}" style="display:block;background:#6B50D8;color:white;text-align:center;padding:6px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px">📞 โทร ${p.phone}</a>` : ''}
        </div>`
      const marker = L.marker([p.lat, p.lng], { icon }).addTo(map).bindPopup(popup)
      markersRef.current.push(marker)
    })
  }

  const fetchNearby = useCallback(async (lat: number, lng: number, type: FilterType = 'all') => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/nearby?lat=${lat}&lng=${lng}&type=${type}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'API error')

      const withDist = data.places.map((p: Place) => ({
        ...p,
        dist: calcDist(lat, lng, p.lat, p.lng)
      })).sort((a: any, b: any) => a.dist - b.dist)

      setPlaces(withDist)
    } catch (err: any) {
      setError(err.message || 'โหลดไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [])

  function startLocate() {
    if (!navigator.geolocation) { setError('อุปกรณ์ไม่รองรับ GPS'); return }
    setError(null)
    setShowSettings(false)
    setLoading(true)
    setLocText('กำลังรับสัญญาณ GPS…')

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude, accuracy } = pos.coords
        setUserLat(latitude)
        setUserLng(longitude)
        setLocText(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
        setLocAcc(`±${Math.round(accuracy)}m`)
        setLocated(true)
        fetchNearby(latitude, longitude, filter)
      },
      err => {
        setLoading(false)
        if (err.code === 1) setShowSettings(true)
        else if (err.code === 2) setError('ไม่พบสัญญาณ GPS — ลองในที่โล่ง')
        else setError('หมดเวลา — กดลองใหม่')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  function handleFilterChange(f: FilterType) {
    setFilter(f)
    if (located && userLat && userLng) fetchNearby(userLat, userLng, f)
  }

  const visible = filter === 'all' ? places : places.filter(p => p.type === filter)

  return (
    <div className="flex flex-col h-full">

      {/* Locate button */}
      <button
        onClick={startLocate}
        disabled={loading}
        className="mx-5 mt-4 flex items-center justify-center gap-2.5 bg-purple-600 disabled:bg-purple-300 text-white rounded-2xl p-4 text-base font-bold transition-opacity active:opacity-80"
      >
        {loading
          ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : '📍'
        }
        {located ? 'อัปเดตตำแหน่ง' : 'ค้นหาจากตำแหน่งปัจจุบัน'}
      </button>

      {/* Location badge */}
      {locText && (
        <div className="mx-5 mt-3 flex items-center gap-2.5 bg-purple-50 rounded-2xl px-4 py-3">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-600 flex-shrink-0 animate-pulse" />
          <span className="text-sm text-purple-900 font-medium flex-1">{locText}</span>
          <span className="text-xs text-purple-400">{locAcc}</span>
        </div>
      )}

      {/* Error */}
      {error && !showSettings && (
        <div className="mx-5 mt-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
          <p className="text-sm text-red-600">❌ {error}</p>
          <button onClick={startLocate} className="mt-2 text-xs text-purple-600 font-semibold">ลองใหม่</button>
        </div>
      )}

      {/* GPS Settings hint */}
      {showSettings && (
        <div className="mx-5 mt-3 bg-purple-50 rounded-2xl p-4">
          <p className="text-base font-bold text-purple-900 mb-1">🔒 GPS ถูกปฏิเสธ</p>
          <p className="text-sm text-purple-600 mb-3">กรุณาเปิดสิทธิ์ตำแหน่งในเบราว์เซอร์</p>
          <div className="bg-white rounded-xl p-3 border border-purple-100 text-sm text-purple-800 leading-loose">
            <p className="font-semibold">📱 iPhone Safari</p>
            <p className="text-purple-500">Settings → Safari → Location → Allow</p>
            <p className="font-semibold mt-1">🤖 Android Chrome</p>
            <p className="text-purple-500">กดไอคอนล็อค URL → Permissions → Location</p>
          </div>
          <button onClick={startLocate} className="mt-3 w-full bg-purple-600 text-white rounded-xl py-2.5 text-sm font-bold">
            ลองใหม่
          </button>
        </div>
      )}

      {/* Filter + View toggle */}
      {located && (
        <div className="flex items-center gap-2 px-5 pt-3 pb-1">
          <div className="flex gap-2 overflow-x-auto scrollbar-none flex-1">
            {FILTER_LABELS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleFilterChange(key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  filter === key
                    ? 'bg-purple-100 border-purple-600 text-purple-900'
                    : 'bg-white border-purple-100 text-purple-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* List / Map toggle */}
          <div className="flex bg-purple-50 rounded-xl p-1 flex-shrink-0">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${view==='list' ? 'bg-white text-purple-700 shadow-sm' : 'text-purple-400'}`}
            >
              ☰ List
            </button>
            <button
              onClick={() => setView('map')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${view==='map' ? 'bg-white text-purple-700 shadow-sm' : 'text-purple-400'}`}
            >
              🗺️ Map
            </button>
          </div>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className="flex-1 overflow-y-auto px-5 pt-3 pb-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-3 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
              <p className="text-sm text-purple-500 font-medium">กำลังค้นหา Google Places…</p>
            </div>
          )}

          {!loading && !located && !showSettings && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl mb-4">📍</span>
              <p className="text-base font-semibold text-purple-400">ยังไม่ได้เปิด GPS</p>
              <p className="text-sm text-purple-300 mt-1">กดปุ่มด้านบนเพื่อค้นหาสถานที่ใกล้คุณ</p>
            </div>
          )}

          {!loading && located && visible.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl mb-4">🔍</span>
              <p className="text-base font-semibold text-purple-400">ไม่พบสถานที่</p>
              <p className="text-sm text-purple-300 mt-1">ไม่มีในรัศมี 5 กม.</p>
            </div>
          )}

          {!loading && visible.map(p => {
            const dist = userLat && userLng ? calcDist(userLat, userLng, p.lat, p.lng) : 0
            return (
              <div key={p.id} className="bg-white rounded-2xl p-3.5 mb-2.5 flex gap-3 border border-purple-50 active:scale-[0.98] transition-transform">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                  p.type === 'police' ? 'bg-blue-50' : p.type === 'fire' ? 'bg-red-50' : 'bg-purple-50'
                }`}>
                  {p.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#220D5C] leading-tight">{p.name}</p>
                  <p className="text-xs text-[#8070B0] mt-0.5 truncate">{p.addr}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs font-bold text-purple-600">📍 {fmtDist(dist)}</p>
                    {p.rating && <p className="text-xs text-amber-500">⭐ {p.rating.toFixed(1)}</p>}
                    <p className={`text-xs font-medium ${p.open ? 'text-green-500' : 'text-red-400'}`}>
                      {p.open ? '● เปิด' : '● ปิด'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 justify-center flex-shrink-0">
                  {p.phone && (
                    <button
                      onClick={() => { window.location.href = `tel:${p.phone!.replace(/\D/g,'')}` }}
                      className="bg-purple-100 text-purple-900 text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap"
                    >
                      📞 โทร
                    </button>
                  )}
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`, '_blank')}
                    className="bg-purple-50 text-purple-600 border border-purple-100 text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap"
                  >
                    🗺️ นำทาง
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── MAP VIEW (Leaflet + OSM) ── */}
      {view === 'map' && (
        <div className="flex-1 relative">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <div ref={mapRef} className="absolute inset-0 z-0" />
          {!located && (
            <div className="absolute inset-0 flex items-center justify-center bg-purple-50/80 z-10">
              <div className="text-center">
                <p className="text-5xl mb-3">🗺️</p>
                <p className="text-sm font-semibold text-purple-500">กดค้นหาตำแหน่งก่อนครับ</p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
