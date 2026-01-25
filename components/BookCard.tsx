'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Book } from '@/lib/types/book';
import BookCardActions from './BookCardActions';
import { generateBookUrl } from '@/lib/utils/bookUrl';
import { useUserPreferences } from '@/lib/contexts/UserPreferencesContext';
import { useReadBooks } from '@/lib/contexts/ReadBooksContext';

interface BookCardProps {
  book: Book;
  onClick?: () => void;
  showAddButton?: boolean;
  onBookAdded?: () => void;
  showPublishYear?: boolean;
}

export default function BookCard({ book, onClick, showAddButton = false, onBookAdded, showPublishYear = true }: BookCardProps) {
  const router = useRouter();
  const { fadeCompletedBooks } = useUserPreferences();
  const { readBookIds } = useReadBooks();
  const authors = book.authors.join(', ') || 'Unknown Author';

  // Check if book is in the read list
  const isRead = readBookIds.has(book.id);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to book detail page with human-readable URL
      const url = generateBookUrl(book);
      router.push(url);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-warm-bg-secondary border border-warm-border rounded-lg hover:border-warm-border hover:shadow-sm transition-all group cursor-pointer relative overflow-hidden"
    >
      <div className="relative aspect-[2/3] bg-warm-bg overflow-hidden">
        {/* Faded image layer */}
        <div className={`absolute inset-0 transition-opacity ${isRead && fadeCompletedBooks ? 'opacity-40' : 'opacity-100'}`}>
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={`${book.title} cover`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-600 p-4">
              <p className="text-gray-200 text-center text-lg font-bold line-clamp-6">
                {book.title}
              </p>
            </div>
          )}
        </div>

        {/* Hover darkening overlay */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />

        {/* Dog-ear bookmark - visible only when marked as read */}
        {isRead && (
          <div className="absolute top-1 right-0.5 z-10 pointer-events-none">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              {/* Black triangle with subtle white border */}
              <path
                d="M31.6765 0.5C32.7811 0.5 33.6765 1.39543 33.6765 2.5V31.6716C33.6765 33.4534 31.5222 34.3457 30.2623 33.0858L1.09072 3.91421C-0.169206 2.65428 0.723131 0.5 2.50494 0.5H31.6765Z"
                fill="black"
                stroke="rgba(255, 255, 255, .4)"
                strokeWidth=".75"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* White checkmark icon */}
              <path
                stroke="white"
                d="M 18 11 L 21 14 L 27 8"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        )}

        {/* Action buttons on hover - overlay on cover at full opacity */}
        {showAddButton && (
          <BookCardActions book={book} onAdded={onBookAdded} />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-warm-text text-sm mb-1 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-xs text-warm-text-secondary line-clamp-1 mb-1">
          {authors}
        </p>
        {showPublishYear && book.publishYear && (
          <p className="text-xs text-warm-text-tertiary">
            {book.publishYear}
          </p>
        )}
      </div>
    </div>
  );
}
