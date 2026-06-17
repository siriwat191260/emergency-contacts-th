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

  // Map type to Google Places includedTypes
  const typeMap: Record<string, string[]> = {
    all:      ['hospital', 'police', 'fire_station', 'pharmacy', 'clinic'],
    hospital: ['hospital', 'pharmacy', 'clinic'],
    police:   ['police'],
    fire:     ['fire_station'],
  }
  const includedTypes = typeMap[type] || typeMap['all']

  try {
    // Google Places API (New) — Nearby Search
    const res = await fetch(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': [
            'places.id',
            'places.displayName',
            'places.formattedAddress',
            'places.location',
            'places.nationalPhoneNumber',
            'places.types',
            'places.rating',
            'places.businessStatus',
          ].join(','),
        },
        body: JSON.stringify({
          includedTypes,
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
              radius: 5000.0,
            },
          },
          languageCode: 'th',
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('Places API error:', err)
      return NextResponse.json({ error: 'Places API error', detail: err }, { status: res.status })
    }

    const data = await res.json()
    const places = (data.places || []).map((p: any) => {
      const types: string[] = p.types || []
      let placeType: 'hospital' | 'police' | 'fire' = 'hospital'
      let icon = '🏥'
      let label = 'โรงพยาบาล'

      if (types.includes('police')) {
        placeType = 'police'; icon = '👮'; label = 'สถานีตำรวจ'
      } else if (types.includes('fire_station')) {
        placeType = 'fire'; icon = '🚒'; label = 'สถานีดับเพลิง'
      } else if (types.includes('pharmacy')) {
        label = 'ร้านขายยา'
      } else if (types.includes('clinic')) {
        label = 'คลินิก'
      }

      return {
        id:    p.id,
        name:  p.displayName?.text || label,
        addr:  p.formattedAddress || '',
        phone: p.nationalPhoneNumber || null,
        lat:   p.location?.latitude || 0,
        lng:   p.location?.longitude || 0,
        type:  placeType,
        icon,
        label,
        rating: p.rating || null,
        open:   p.businessStatus === 'OPERATIONAL',
      }
    })

    // Cache 5 minutes
    return NextResponse.json({ places }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate' }
    })

  } catch (err) {
    console.error('Nearby API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
