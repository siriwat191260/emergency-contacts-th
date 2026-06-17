// ════════════════════════════════════════
// supabase/config.js
// แก้ไข SUPABASE_URL และ SUPABASE_ANON_KEY
// ให้ตรงกับโปรเจกต์ของคุณใน supabase.com
// ════════════════════════════════════════

const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON = 'YOUR_ANON_PUBLIC_KEY';

// Categories
const CATEGORIES = {
  medical:  { label: 'การแพทย์',    emoji: '🏥' },
  police:   { label: 'ตำรวจ',       emoji: '👮' },
  fire:     { label: 'ดับเพลิง',    emoji: '🔥' },
  road:     { label: 'การเดินทาง',  emoji: '🛣️' },
  disaster: { label: 'ภัยพิบัติ',   emoji: '⛈️' },
  other:    { label: 'อื่นๆ',       emoji: '📞' },
};

const REGIONS = {
  national: 'ทั่วประเทศ',
  bangkok:  'กรุงเทพฯ',
  rayong:   'ระยอง',
  chiangmai:'เชียงใหม่',
  phuket:   'ภูเก็ต',
};
