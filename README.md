# 🆘 เบอร์ฉุกเฉินไทย — PWA

แอปรวมเบอร์ฉุกเฉินประเทศไทย พร้อม GPS ค้นหาโรงพยาบาลใกล้บ้าน

## ไฟล์ในโปรเจกต์

```
emergency-pwa/
├── index.html        ← แอปหลัก (UI + logic ทั้งหมด)
├── manifest.json     ← PWA manifest (ชื่อแอป, ไอคอน, theme)
├── sw.js             ← Service Worker (offline support)
├── vercel.json       ← Vercel config (headers + routing)
├── icons/
│   ├── icon-192.png  ← App icon (home screen)
│   └── icon-512.png  ← App icon (splash screen)
└── README.md
```

---

## Deploy บน Vercel (ฟรี, เร็วที่สุด)

### วิธีที่ 1 — Vercel CLI

```bash
npm i -g vercel
cd emergency-pwa
vercel
```
กด Enter ตลอด → ได้ URL เช่น `https://emergency-th.vercel.app`

### วิธีที่ 2 — Drag & Drop (ไม่ต้องติดตั้งอะไร)

1. ไปที่ [vercel.com](https://vercel.com) → Sign up ฟรี
2. กด **"Add New Project"**
3. เลือก **"Deploy from folder"** แล้วลาก folder `emergency-pwa` ทิ้งลงไป
4. กด Deploy → รอ 30 วินาที → ได้ URL ทันที

### วิธีที่ 3 — GitHub + Vercel (แนะนำถ้าจะ maintain ต่อ)

```bash
cd emergency-pwa
git init
git add .
git commit -m "feat: initial PWA release"
gh repo create emergency-th --public --push --source=.
```
แล้ว connect repo บน vercel.com → auto-deploy ทุกครั้งที่ push

---

## ติดตั้งบน iPhone (Add to Home Screen)

1. เปิด Safari → ไปที่ URL ของแอป
2. กดปุ่ม **Share** (กล่องมีลูกศรขึ้น)
3. เลือก **"Add to Home Screen"**
4. ตั้งชื่อ "ฉุกเฉิน" → กด Add
5. ไอคอนจะปรากฏบน Home Screen เหมือน app จริง

---

## Features

- 🆘 SOS shortcuts: 191 + 1669 กดได้ทันที
- 🏥 เบอร์ฉุกเฉินไทย 16 หมายเลข แบ่งหมวดหมู่
- 📍 GPS Nearby: ค้นหาโรงพยาบาล / สถานีตำรวจ / ดับเพลิงใกล้บ้าน
- 🔍 Search + filter ตามหมวดหมู่
- 📞 กด Call โทรออกได้จริงผ่าน tel:
- 🕐 ประวัติการโทร (Recent calls)
- 📶 Offline support ผ่าน Service Worker
- 🎨 Purple theme

---

## ขั้นตอนถัดไป (ถ้าจะพัฒนาต่อ)

- [ ] เพิ่มเบอร์โรงพยาบาลรายจังหวัด (database)
- [ ] Push notification แจ้งเตือนภัยพิบัติ
- [ ] ภาษาอังกฤษ (i18n)
- [ ] Port เป็น Native iOS (Swift/SwiftUI)
