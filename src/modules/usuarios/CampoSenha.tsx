'use client'

import { useState } from 'react'

interface Props {
  name: string
  placeholder?: string
  label?: string
  required?: boolean
  minLength?: number
  defaultValue?: string
}

export default function CampoSenha({ name, placeholder = '••••••••', label = 'Senha', required = true, minLength, defaultValue }: Props) {
  const [visivel, setVisivel] = useState(false)

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-zinc-400">{label}</label>
      <div className="relative">
        <input
          name={name}
          type={visivel ? 'text' : 'password'}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          defaultValue={defaultValue}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 pr-10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
        />
        <button
          type="button"
          onClick={() => setVisivel(!visivel)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          tabIndex={-1}
        >
          {visivel ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
