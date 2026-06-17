'use client'
import { Contact, CATEGORIES } from '@/types'

interface Props {
  contact: Contact
}

export default function ContactCard({ contact }: Props) {
  const cat = CATEGORIES[contact.category]

  function makeCall(e: React.MouseEvent) {
    e.stopPropagation()
    window.location.href = `tel:${contact.phone}`
  }

  return (
    <div
      onClick={makeCall}
      className="relative bg-white rounded-2xl p-3.5 mb-2.5 flex items-center gap-3 border cursor-pointer active:scale-[0.98] transition-transform"
      style={{
        borderColor: contact.is_pinned ? 'rgba(107,80,216,0.22)' : 'rgba(107,80,216,0.08)'
      }}
    >
      {contact.is_pinned && (
        <span className="absolute -top-2 right-3 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg">
          Pinned
        </span>
      )}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: cat.bg }}
      >
        {cat.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#220D5C]">{contact.name}</p>
        <p className="text-xs text-[#8070B0] mt-0.5 truncate">{contact.description}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xl font-black text-[#6B50D8] tracking-tight">{contact.phone}</p>
        <button
          onClick={makeCall}
          className="mt-1 bg-purple-100 text-purple-900 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
        >
          📞 โทร
        </button>
      </div>
    </div>
  )
}
