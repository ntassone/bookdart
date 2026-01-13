'use client'

import { useState } from 'react'
import StarRating from './StarRating'
import type { UpdateBookInput } from '@/lib/types/userBook'

interface ReviewFormProps {
  initialRating?: number
  initialNotes?: string
  initialDateFinished?: string
  initialIsPublic?: boolean
  onSave: (data: UpdateBookInput) => Promise<void>
  onCancel: () => void
}

/**
 * Form for editing rating, review, and date finished
 * Includes toggle for making review public
 */
export default function ReviewForm({
  initialRating,
  initialNotes,
  initialDateFinished,
  initialIsPublic = false,
  onSave,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating)
  const [notes, setNotes] = useState(initialNotes || '')
  const [dateFinished, setDateFinished] = useState(
    initialDateFinished ? initialDateFinished.split('T')[0] : ''
  )
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await onSave({
        rating,
        notes: notes.trim() || undefined,
        date_finished: dateFinished || undefined,
        is_review_public: isPublic,
      })
    } catch (error) {
      console.error('Failed to save review:', error)
      alert('Failed to save review. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating {!rating && <span className="text-red-500">*</span>}
        </label>
        <StarRating
          rating={rating || 0}
          interactive
          size="lg"
          onChange={setRating}
        />
      </div>

      {/* Date Finished */}
      <div>
        <label htmlFor="dateFinished" className="block text-sm font-medium text-gray-700 mb-2">
          Date Finished (Optional)
        </label>
        <input
          type="date"
          id="dateFinished"
          value={dateFinished}
          onChange={(e) => setDateFinished(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
        />
      </div>

      {/* Review Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Review (Optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          placeholder="Share your thoughts about this book..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Public Toggle */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="mt-1 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
        />
        <div>
          <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 cursor-pointer">
            Share as public review
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Your rating and review will be visible to all Bookdart users
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || !rating}
          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {saving ? 'Saving...' : 'Save Review'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
