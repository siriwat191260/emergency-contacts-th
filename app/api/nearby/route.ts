import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const type = searchParams.get('type') || 'all'

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 })
  }

  const key = process.env.GOOGLE_PLACES_KEY
  if (!key) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  // Places API เก่า — Nearby Search
  // type map
  const typeMap: Record<string, string[]> = {
    all:      ['hospital', 'police', 'fire_station'],
    hospital: ['hospital'],
    police:   ['police'],
    fire:     ['fire_station'],
  }
  const types = typeMap[type] || typeMap['all']

  try {
    // เรียกทีละ type แล้ว merge กัน (Places API เก่าส่งได้ทีละ type)
    const results = await Promise.all(
      types.map(t =>
        fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
          new URLSearchParams({
            location: `${lat},${lng}`,
            radius: '10000',
            type: t,
            language: 'th',
            key,
          })
        ).then(r => r.json())
      )
    )

    // Debug log
    results.forEach((r, i) => {
      console.log(`[nearby] type=${types[i]} status=${r.status} count=${r.results?.length ?? 0}`)
      if (r.error_message) console.log(`[nearby] error_message=${r.error_message}`)
    })

    // Merge + deduplicate by place_id
    const seen = new Set<string>()
    const places = results
      .flatMap(r => r.results || [])
      .filter((p: any) => {
        if (seen.has(p.place_id)) return false
        seen.add(p.place_id)
        return true
      })
      .map((p: any) => {
        const types: string[] = p.types || []
        let placeType: 'hospital' | 'police' | 'fire' = 'hospital'
        let icon = '🏥'
        let label = 'โรงพยาบาล'

        if (types.includes('police')) {
          placeType = 'police'; icon = '👮'; label = 'สถานีตำรวจ'
        } else if (types.includes('fire_station')) {
          placeType = 'fire'; icon = '🚒'; label = 'สถานีดับเพลิง'
        }

        return {
          id:     p.place_id,
          name:   p.name || label,
          addr:   p.vicinity || '',
          phone:  null, // Places API เก่า ต้อง call Place Details แยก
          lat:    p.geometry?.location?.lat || 0,
          lng:    p.geometry?.location?.lng || 0,
          type:   placeType,
          icon,
          label,
          rating: p.rating || null,
          open:   p.opening_hours?.open_now ?? true,
        }
      })

    return NextResponse.json({ places }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate' }
    })

  } catch (err) {
    console.error('Nearby API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}