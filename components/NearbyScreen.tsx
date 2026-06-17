'use client'
import { useState, useCallback } from 'react'

interface Place {
  name: string
  type: 'hospital' | 'police' | 'fire'
  icon: string
  label: string
  phone: string | null
  addr: string
  dist: number
  lat: number
  lng: number
}

type FilterType = 'all' | 'hospital' | 'police' | 'fire'

function calcDist(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function fmtDist(m: number) {
  return m < 1000 ? `${Math.round(m)} ม.` : `${(m/1000).toFixed(1)} กม.`
}

export default function NearbyScreen() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [located, setLocated] = useState(false)
  const [locText, setLocText] = useState('')
  const [locAcc, setLocAcc] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')

  const fetchNearby = useCallback(async (lat: number, lng: number) => {
    setLoading(true)
    const q = `[out:json][timeout:20];(
      node["amenity"="hospital"](around:5000,${lat},${lng});
      way["amenity"="hospital"](around:5000,${lat},${lng});
      node["amenity"="clinic"](around:5000,${lat},${lng});
      node["amenity"="police"](around:5000,${lat},${lng});
      way["amenity"="police"](around:5000,${lat},${lng});
      node["amenity"="fire_station"](around:5000,${lat},${lng});
      way["amenity"="fire_station"](around:5000,${lat},${lng});
    );out center tags;`

    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: 'data=' + encodeURIComponent(q),
      })
      const data = await res.json()
      const mapped: Place[] = data.elements.map((el: any) => {
        const elLat = el.lat ?? el.center?.lat ?? 0
        const elLng = el.lon ?? el.center?.lon ?? 0
        const tags = el.tags ?? {}
        const amenity = tags.amenity ?? ''
        let type: Place['type'] = 'hospital', icon = '🏥', label = 'โรงพยาบาล'
        if (amenity === 'police') { type = 'police'; icon = '👮'; label = 'สถานีตำรวจ' }
        else if (amenity === 'fire_station') { type = 'fire'; icon = '🚒'; label = 'สถานีดับเพลิง' }
        else if (amenity === 'clinic') { label = 'คลินิก' }
        return {
          name: tags['name:th'] ?? tags.name ?? label,
          type, icon, label,
          phone: tags.phone ?? tags['contact:phone'] ?? null,
          addr: tags['addr:street'] ?? tags['addr:district'] ?? '',
          dist: calcDist(lat, lng, elLat, elLng),
          lat: elLat, lng: elLng,
        }
      }).sort((a: Place, b: Place) => a.dist - b.dist)
      setPlaces(mapped)
    } catch {
      setPlaces([]) // show empty state
    } finally {
      setLoading(false)
    }
  }, [])

  function startLocate() {
    if (!navigator.geolocation) { setError('อุปกรณ์ไม่รองรับ GPS'); return }
    setError(null)
    setLoading(true)
    setLocText('กำลังรับสัญญาณ GPS…')

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude, accuracy } = pos.coords
        setLocText(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
        setLocAcc(`±${Math.round(accuracy)}m`)
        setLocated(true)
        fetchNearby(latitude, longitude)
      },
      err => {
        setLoading(false)
        if (err.code === 1) { setError('denied'); setShowSettings(true) }
        else if (err.code === 2) setError('ไม่พบสัญญาณ GPS — ลองในที่โล่ง')
        else setError('หมดเวลา — กดลองใหม่')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
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
          : '📍'}
        {located ? 'อัปเดตตำแหน่ง' : 'ค้นหาจากตำแหน่งปัจจุบัน'}
      </button>

      {/* Location badge */}
      {locText && (
        <div className="mx-5 mt-3 flex items-center gap-2.5 bg-purple-50 rounded-2xl px-4 py-3">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-600 flex-shrink-0" />
          <span className="text-sm text-purple-900 font-medium flex-1">{locText}</span>
          <span className="text-xs text-purple-500">{locAcc}</span>
        </div>
      )}

      {/* Error */}
      {error && !showSettings && (
        <p className="mx-5 mt-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">❌ {error}</p>
      )}

      {/* Settings hint */}
      {showSettings && (
        <div className="mx-5 mt-3 bg-purple-50 rounded-2xl p-4">
          <p className="text-base font-bold text-purple-900 mb-1">🔒 GPS ถูกปฏิเสธ</p>
          <p className="text-sm text-purple-700 mb-3">กรุณาเปิดสิทธิ์ตำแหน่งในเบราว์เซอร์</p>
          <div className="text-sm text-purple-800 leading-relaxed bg-white rounded-xl p-3 border border-purple-100">
            <p className="font-semibold">📱 iPhone Safari</p>
            <p className="text-purple-600 mt-0.5">Settings → Safari → Location → Allow</p>
            <p className="font-semibold mt-2">🤖 Android Chrome</p>
            <p className="text-purple-600 mt-0.5">กดไอคอนล็อค URL → Permissions → Location</p>
          </div>
          <button onClick={startLocate} className="mt-3 w-full bg-purple-600 text-white rounded-xl py-2.5 text-sm font-bold">
            ลองใหม่
          </button>
        </div>
      )}

      {/* Filter chips */}
      {located && !loading && (
        <div className="flex gap-2 px-5 pt-3 pb-1 overflow-x-auto scrollbar-none">
          {([['all','🏥👮 ทั้งหมด'],['hospital','🏥 โรงพยาบาล'],['police','👮 ตำรวจ'],['fire','🚒 ดับเพลิง']] as [FilterType, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filter === t
                  ? 'bg-purple-100 border-purple-600 text-purple-900'
                  : 'bg-white border-purple-100 text-purple-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-3 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-sm text-purple-500 font-medium">กำลังค้นหาสถานที่ใกล้เคียง…</p>
          </div>
        )}

        {!loading && !located && !error && (
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

        {!loading && visible.map((p, i) => (
          <div key={i} className="bg-white rounded-2xl p-3.5 mb-2.5 flex gap-3 border border-purple-50">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl flex-shrink-0">
              {p.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#220D5C]">{p.name}</p>
              <p className="text-xs text-[#8070B0] mt-0.5 truncate">{p.addr || p.label}</p>
              <p className="text-xs font-bold text-purple-600 mt-1">📍 {fmtDist(p.dist)} · {p.label}</p>
            </div>
            <div className="flex flex-col gap-1.5 justify-center flex-shrink-0">
              {p.phone && (
                <button
                  onClick={() => { window.location.href = `tel:${p.phone!.replace(/\D/g,'')}` }}
                  className="bg-purple-100 text-purple-900 text-xs font-bold px-3 py-1.5 rounded-xl"
                >
                  📞 โทร
                </button>
              )}
              <button
                onClick={() => window.open(`https://maps.google.com/?q=${p.lat},${p.lng}`, '_blank')}
                className="bg-purple-50 text-purple-600 border border-purple-100 text-xs font-semibold px-3 py-1.5 rounded-xl"
              >
                🗺️ แผนที่
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
