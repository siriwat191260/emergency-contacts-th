'use client'
import { useState } from 'react'
import { Category, CATEGORIES } from '@/types'
import ContactList from '@/components/ContactList'
import NearbyScreen from '@/components/NearbyScreen'

type Tab = 'contacts' | 'nearby' | 'recent' | 'settings'
type FilterCat = Category | 'all'

const CATS: { key: FilterCat; label: string }[] = [
  { key: 'all',      label: '🆘 ทั้งหมด' },
  { key: 'medical',  label: '🏥 การแพทย์' },
  { key: 'police',   label: '👮 ตำรวจ' },
  { key: 'fire',     label: '🔥 ดับเพลิง' },
  { key: 'road',     label: '🛣️ การเดินทาง' },
  { key: 'disaster', label: '⛈️ ภัยพิบัติ' },
  { key: 'other',    label: '📞 อื่นๆ' },
]

const TAB_TITLES: Record<Tab, string> = {
  contacts: 'เบอร์ฉุกเฉิน',
  nearby:   'ใกล้ฉัน',
  recent:   'ประวัติโทร',
  settings: 'ตั้งค่า',
}

export default function Home() {
  const [tab, setTab]         = useState<Tab>('contacts')
  const [cat, setCat]         = useState<FilterCat>('all')
  const [search, setSearch]   = useState('')

  return (
    <div
      className="flex flex-col max-w-[430px] mx-auto"
      style={{ height: '100dvh', background: '#F4F2FC' }}
    >
      {/* Top bar */}
      <div style={{ background: '#EDE9FB', paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
        className="px-5 flex-shrink-0">
        <h1 className="text-3xl font-bold text-[#220D5C] tracking-tight pb-1">
          {TAB_TITLES[tab]}
        </h1>

        {/* Search (contacts only) */}
        {tab === 'contacts' && (
          <div className="flex items-center gap-2.5 bg-white rounded-2xl px-4 py-2.5 mb-3.5 border border-purple-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C2BAE8" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search"
              placeholder="ค้นหาชื่อหรือเบอร์…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-base text-[#220D5C] outline-none placeholder:text-purple-200"
            />
          </div>
        )}
      </div>

      {/* Cat pills (contacts only) */}
      {tab === 'contacts' && (
        <div
          className="flex gap-2 overflow-x-auto px-5 pb-3.5 flex-shrink-0 scrollbar-none"
          style={{ background: '#EDE9FB' }}
        >
          {CATS.map(c => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold border-[1.5px] transition-all ${
                cat === c.key
                  ? 'bg-purple-100 border-purple-600 text-purple-900'
                  : 'bg-white border-purple-100 text-purple-400'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* Screens */}
      <div className="flex-1 overflow-hidden relative">

        {/* Contacts */}
        <div className={`absolute inset-0 overflow-y-auto ${tab === 'contacts' ? '' : 'hidden'}`}>
          <ContactList activeCat={cat} searchQuery={search} />
        </div>

        {/* Nearby */}
        <div className={`absolute inset-0 overflow-y-auto ${tab === 'nearby' ? '' : 'hidden'}`}>
          <NearbyScreen />
        </div>

        {/* Recent */}
        <div className={`absolute inset-0 overflow-y-auto p-5 ${tab === 'recent' ? '' : 'hidden'}`}>
          <p className="text-sm text-purple-400 text-center pt-20">ยังไม่มีประวัติการโทร</p>
        </div>

        {/* Settings */}
        <div className={`absolute inset-0 overflow-y-auto p-5 ${tab === 'settings' ? '' : 'hidden'}`}>
          <div className="space-y-2.5">
            {[
              { icon: '🎨', title: 'ธีม', sub: 'Soft Purple' },
              { icon: '🌍', title: 'ภาษา', sub: 'ภาษาไทย' },
              { icon: '☁️', title: 'แหล่งข้อมูล', sub: 'Supabase Realtime' },
              { icon: 'ℹ️', title: 'เวอร์ชัน', sub: 'v2.0.0 · Next.js PWA' },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl p-3.5 flex items-center gap-3 border border-purple-50">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 flex items-center justify-center text-xl flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#220D5C]">{item.title}</p>
                  <p className="text-xs text-[#8070B0] mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex bg-white border-t border-purple-100 flex-shrink-0"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)', paddingTop: '8px' }}
      >
        {([
          ['contacts', 'Contacts', <path key="c" d="M5 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm4 5h6M9 12h6M9 17h4" strokeLinecap="round"/>],
          ['nearby',   'Nearby',   <><path key="n1" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle key="n2" cx="12" cy="9" r="2.5"/></>],
          ['recent',   'Recent',   <><circle key="r1" cx="12" cy="12" r="10"/><polyline key="r2" points="12 6 12 12 16 14"/></>],
          ['settings', 'Settings', <><circle key="s1" cx="12" cy="8" r="4"/><path key="s2" d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>],
        ] as [Tab, string, React.ReactNode][]).map(([t, label, icon]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors ${
              tab === t ? 'text-purple-600' : 'text-purple-200'
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              {icon}
            </svg>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
