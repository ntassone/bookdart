'use client'

import type { PublicReview } from '@/lib/types/userBook'
import StarRating from './StarRating'

interface ReviewCardProps {
  review: PublicReview
}

/**
 * Display a single public review
 * Shows rating, notes, date finished, and reread badge
 */
export default function ReviewCard({ review }: ReviewCardProps) {
  const formattedDate = review.date_finished
    ? new Date(review.date_finished).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header with rating and date */}
      <div className="flex items-start justify-between mb-3">
        <StarRating rating={review.rating} size="md" />
        <div className="text-sm text-gray-500 text-right">
          {formattedDate && <div>{formattedDate}</div>}
          {review.read_count > 1 && (
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Reread {review.read_count}x
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Review text */}
      {review.notes && (
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {review.notes}
        </p>
      )}

      {/* Footer - placeholder for future username display */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Bookdart Reader
        </p>
      </div>
    </div>
  )
}
