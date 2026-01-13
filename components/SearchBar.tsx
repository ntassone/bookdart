'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@base-ui/react/input'
import { getRecentSearches, clearRecentSearches } from '@/lib/utils/recentSearches'

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search for books...' }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectRecent = (search: string) => {
    onChange(search)
    setIsFocused(false)
  }

  const handleClearRecent = () => {
    clearRecentSearches()
    setRecentSearches([])
  }

  const showRecentSearches = isFocused && !value && recentSearches.length > 0

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <svg
          className="h-5 w-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <Input
        value={value}
        onValueChange={onChange}
        onFocus={() => setIsFocused(true)}
        placeholder={placeholder}
        className={({ focused }) => `
          w-full pl-12 pr-4 py-3 text-gray-700 bg-white border transition-all
          ${focused ? 'border-gray-400 ring-2 ring-gray-300 outline-none' : 'border-gray-300'}
          ${showRecentSearches ? 'rounded-t-lg' : 'rounded-lg'}
        `}
      />

      {/* Recent Searches Dropdown */}
      {showRecentSearches && (
        <div className="absolute top-full left-0 right-0 bg-white border border-t-0 border-gray-300 rounded-b-lg shadow-lg z-20">
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Recent Searches
            </span>
            <button
              onClick={handleClearRecent}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>
          <ul>
            {recentSearches.map((search, index) => (
              <li key={index}>
                <button
                  onClick={() => handleSelectRecent(search)}
                  className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{search}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
