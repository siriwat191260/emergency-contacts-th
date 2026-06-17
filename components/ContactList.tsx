'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Contact, Category, CATEGORIES } from '@/types'
import SOSCard from './SOSCard'
import ContactCard from './ContactCard'

const CAT_ORDER: Category[] = ['medical', 'police', 'fire', 'road', 'disaster', 'other']
const FALLBACK: Contact[] = [
  { id:'1', name:'แจ้งเหตุด่วน / เหตุร้าย', name_en:'Emergency Police',  phone:'191',  category:'police',   region:'national', description:'ตำรวจ ทั่วประเทศ 24 ชม.',       is_pinned:true,  is_active:true, sort_order:1,  created_at:'', updated_at:'' },
  { id:'2', name:'เจ็บป่วยฉุกเฉิน ERMT',    name_en:'Emergency Medical', phone:'1669', category:'medical',  region:'national', description:'หน่วยแพทย์ฉุกเฉิน ทั่วประเทศ', is_pinned:true,  is_active:true, sort_order:2,  created_at:'', updated_at:'' },
  { id:'3', name:'ไฟไหม้ ดับเพลิง',         name_en:'Fire Department',   phone:'199',  category:'fire',     region:'national', description:'กองบัญชาการตำรวจดับเพลิง',     is_pinned:false, is_active:true, sort_order:3,  created_at:'', updated_at:'' },
  { id:'4', name:'ตำรวจท่องเที่ยว',         name_en:'Tourist Police',    phone:'1155', category:'police',   region:'national', description:'Tourist Police ทั่วประเทศ',    is_pinned:true,  is_active:true, sort_order:4,  created_at:'', updated_at:'' },
  { id:'5', name:'หน่วยแพทย์ฉุกเฉิน กทม.',  name_en:'BMA Emergency',     phone:'1646', category:'medical',  region:'bangkok',  description:'กรุงเทพมหานคร',                is_pinned:false, is_active:true, sort_order:5,  created_at:'', updated_at:'' },
  { id:'6', name:'หน่วยกู้ชีพ',             name_en:'Rescue Unit',       phone:'1554', category:'medical',  region:'national', description:'ทั่วประเทศ',                   is_pinned:false, is_active:true, sort_order:6,  created_at:'', updated_at:'' },
  { id:'7', name:'แจ้งรถหาย',               name_en:'Report Stolen',     phone:'1192', category:'police',   region:'national', description:'สำนักงานตำรวจแห่งชาติ',        is_pinned:false, is_active:true, sort_order:7,  created_at:'', updated_at:'' },
  { id:'8', name:'ตำรวจทางหลวง',            name_en:'Highway Police',    phone:'1193', category:'road',     region:'national', description:'กรมทางหลวง ทั่วประเทศ',        is_pinned:false, is_active:true, sort_order:8,  created_at:'', updated_at:'' },
  { id:'9', name:'กรมทางหลวงชนบท',          name_en:'Rural Roads',       phone:'1146', category:'road',     region:'national', description:'ถนนชนบท ทั่วประเทศ',           is_pinned:false, is_active:true, sort_order:9,  created_at:'', updated_at:'' },
  { id:'10',name:'สายตรงทางด่วน',           name_en:'Expressway',        phone:'1543', category:'road',     region:'bangkok',  description:'EXAT ทางพิเศษ กทม.',           is_pinned:false, is_active:true, sort_order:10, created_at:'', updated_at:'' },
  { id:'11',name:'ข้อมูลการจราจร',          name_en:'Traffic Info',      phone:'1197', category:'road',     region:'national', description:'กรมทางหลวง',                   is_pinned:false, is_active:true, sort_order:11, created_at:'', updated_at:'' },
  { id:'12',name:'การรถไฟแห่งประเทศไทย',    name_en:'State Railway',     phone:'1690', category:'road',     region:'national', description:'สอบถามตาราง',                  is_pinned:false, is_active:true, sort_order:12, created_at:'', updated_at:'' },
  { id:'13',name:'ศูนย์เตือนภัยพิบัติ',     name_en:'Disaster Warning',  phone:'192',  category:'disaster', region:'national', description:'NDWC น้ำท่วม แผ่นดินไหว',     is_pinned:false, is_active:true, sort_order:13, created_at:'', updated_at:'' },
  { id:'14',name:'ศูนย์ปลอดภัยคมนาคม',      name_en:'Transport Safety',  phone:'1356', category:'disaster', region:'national', description:'กระทรวงคมนาคม',               is_pinned:false, is_active:true, sort_order:14, created_at:'', updated_at:'' },
  { id:'15',name:'อุบัติเหตุทางน้ำ',        name_en:'Marine Accident',   phone:'1196', category:'fire',     region:'national', description:'ศูนย์ช่วยเหลือทางทะเล',        is_pinned:false, is_active:true, sort_order:15, created_at:'', updated_at:'' },
  { id:'16',name:'ร่วมด้วยช่วยกัน',         name_en:'Road Assistance',   phone:'1677', category:'other',    region:'national', description:'ช่วยเหลือผู้ประสบภัยบนถนน',   is_pinned:false, is_active:true, sort_order:16, created_at:'', updated_at:'' },
]

interface Props {
  activeCat: Category | 'all'
  searchQuery: string
}

export default function ContactList({ activeCat, searchQuery }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'live' | 'cache' | 'fallback'>('fallback')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const sb = createClient()
      const { data, error } = await sb
        .from('contacts')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      if (error) throw error
      setContacts(data)
      localStorage.setItem('contacts_cache', JSON.stringify(data))
      setStatus('live')
    } catch {
      const cached = localStorage.getItem('contacts_cache')
      if (cached) { setContacts(JSON.parse(cached)); setStatus('cache') }
      else { setContacts(FALLBACK); setStatus('fallback') }
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => { load() }, [load])

  // Realtime subscription
  useEffect(() => {
    const sb = createClient()
    const channel = sb.channel('contacts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => load())
      .subscribe()
    return () => { sb.removeChannel(channel) }
  }, [load])

  // Filter
  const filtered = contacts.filter(c => {
    const catMatch = activeCat === 'all' || c.category === activeCat
    const q = searchQuery.toLowerCase()
    const searchMatch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.description?.toLowerCase().includes(q) ?? false)
    return catMatch && searchMatch
  })

  const sos191  = contacts.find(c => c.phone === '191')
  const sos1669 = contacts.find(c => c.phone === '1669')

  const grouped = CAT_ORDER.reduce<Record<string, Contact[]>>((acc, cat) => {
    acc[cat] = filtered.filter(c => c.category === cat)
    return acc
  }, {} as Record<string, Contact[]>)

  if (loading) {
    return (
      <div className="p-5 space-y-3">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 h-28 rounded-2xl bg-purple-100 animate-pulse" />
          <div className="flex-1 h-28 rounded-2xl bg-purple-100 animate-pulse" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-purple-100 animate-pulse" style={{ width: i % 2 ? '85%' : '100%' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="p-5">
      {/* Status */}
      {status !== 'live' && (
        <div className="mb-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          {status === 'cache' ? '⚠️ ใช้ข้อมูลแคช (ไม่มีการเชื่อมต่อ)' : '⚠️ ใช้ข้อมูลสำรองในตัวแอป'}
        </div>
      )}

      {/* SOS row */}
      {(activeCat === 'all' || activeCat === 'police' || activeCat === 'medical') && !searchQuery && (
        <div className="flex gap-2.5 mb-4">
          {sos191  && <SOSCard contact={sos191} />}
          {sos1669 && <SOSCard contact={sos1669} />}
        </div>
      )}

      {/* Grouped sections */}
      {CAT_ORDER.map(cat => {
        const items = grouped[cat]
        if (!items?.length) return null
        const info = CATEGORIES[cat]
        return (
          <div key={cat}>
            <div className="flex items-center gap-2 my-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400">
                {info.emoji} {info.label}
              </span>
              <div className="flex-1 h-px bg-purple-100" />
            </div>
            {items.map(c => <ContactCard key={c.id} contact={c} />)}
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">🔍</span>
          <p className="text-base font-semibold text-purple-400">ไม่พบรายการ</p>
          <p className="text-sm text-purple-300 mt-1">ลองค้นหาด้วยคำอื่น</p>
        </div>
      )}
    </div>
  )
}
