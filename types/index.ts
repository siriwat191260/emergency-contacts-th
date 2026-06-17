export type Category = 'medical' | 'police' | 'fire' | 'road' | 'disaster' | 'other'

export interface Contact {
  id: string
  name: string
  name_en: string | null
  phone: string
  category: Category
  region: string
  description: string | null
  is_pinned: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type ContactInsert = Omit<Contact, 'id' | 'created_at' | 'updated_at'>
export type ContactUpdate = Partial<ContactInsert>

export const CATEGORIES: Record<Category, { label: string; emoji: string; bg: string }> = {
  medical:  { label: 'การแพทย์',   emoji: '🏥', bg: '#FDE8E8' },
  police:   { label: 'ตำรวจ',      emoji: '👮', bg: '#EDE9FB' },
  fire:     { label: 'ดับเพลิง',   emoji: '🔥', bg: '#FFF0E0' },
  road:     { label: 'การเดินทาง', emoji: '🛣️', bg: '#E8F5FB' },
  disaster: { label: 'ภัยพิบัติ',  emoji: '⛈️', bg: '#FFF4E0' },
  other:    { label: 'อื่นๆ',      emoji: '📞', bg: '#EDE9FB' },
}

export const REGIONS: Record<string, string> = {
  national:  'ทั่วประเทศ',
  bangkok:   'กรุงเทพฯ',
  rayong:    'ระยอง',
  chiangmai: 'เชียงใหม่',
  phuket:    'ภูเก็ต',
}
