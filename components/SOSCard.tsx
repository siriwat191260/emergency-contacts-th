'use client'
import { Contact, CATEGORIES } from '@/types'

interface Props {
  contact: Contact
}

export default function SOSCard({ contact }: Props) {
  const cat = CATEGORIES[contact.category]

  function makeCall() {
    window.location.href = `tel:${contact.phone}`
  }

  return (
    <button
      onClick={makeCall}
      className="flex-1 rounded-2xl p-4 flex flex-col gap-2 text-left active:opacity-80 active:scale-95 transition-all"
      style={{ background: contact.phone === '191' ? '#6B50D8' : '#5040AA' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{cat.emoji}</span>
        <span className="text-4xl font-black text-white tracking-tighter leading-none">
          {contact.phone}
        </span>
      </div>
      <div>
        <p className="text-xs font-semibold text-purple-200">{contact.description}</p>
        <p className="text-sm font-bold text-white mt-0.5">{contact.name}</p>
      </div>
    </button>
  )
}
