'use client'

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Tooltip } from '@base-ui/react/tooltip';
import type { Book } from '@/lib/types/book';
import type { UserBook } from '@/lib/types/userBook';
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
  initialBookStatus?: UserBook[];
  showTextBelow?: boolean;
}

const BookCard = React.memo(function BookCard({ book, onClick, showAddButton = false, onBookAdded, showPublishYear = true, initialBookStatus, showTextBelow = false }: BookCardProps) {
  const router = useRouter();
  const { fadeCompletedBooks } = useUserPreferences();
  const { readBookIds } = useReadBooks();
  const [isActionsMenuOpen, setIsActionsMenuOpen] = React.useState(false);
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

  const cardContent = (
    <div
      onClick={handleClick}
      className="relative overflow-hidden transition-all border rounded-lg cursor-pointer bg-warm-bg-secondary border-warm-border hover:border-warm-border hover:shadow-sm group"
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
            <div className="flex items-center justify-center w-full h-full p-4 bg-neutral-600">
              <p className="text-lg font-bold text-center text-neutral-200 line-clamp-6">
                {book.title}
              </p>
            </div>
          )}
        </div>

        {/* Hover darkening overlay - stays visible when menu is open */}
        <div className={`absolute inset-0 transition-opacity bg-black pointer-events-none ${
          isActionsMenuOpen ? 'opacity-30' : 'opacity-0 group-hover:opacity-30'
        }`} />

        {/* Dog-ear bookmark - visible only when marked as read */}
        {isRead && (
          <div className="absolute top-1 right-0.5 z-10 pointer-events-none">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              {/* Black triangle with subtle white border */}
              <path
                d="M31.6765 0.5C32.7811 0.5 33.6765 1.39543 33.6765 2.5V31.6716C33.6765 33.4534 31.5222 34.3457 30.2623 33.0858L1.09072 3.91421C-0.169206 2.65428 0.723131 0.5 2.50494 0.5H31.6765Z"
                fill="black"
                stroke="rgba(255, 255, 255, .4)"
                strokeWidth="0"
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
          <BookCardActions
            book={book}
            onAdded={onBookAdded}
            initialStatus={initialBookStatus}
            isMenuOpen={isActionsMenuOpen}
            onMenuOpenChange={setIsActionsMenuOpen}
          />
        )}
      </div>
      {showTextBelow && (
        <div className="p-4">
          <h3 className="mb-1 text-sm font-semibold text-warm-text line-clamp-2">
            {book.title}
          </h3>
          <p className="mb-1 text-xs text-warm-text-secondary line-clamp-1">
            {authors}
          </p>
          {showPublishYear && book.publishYear && (
            <p className="text-xs text-warm-text-tertiary">
              {book.publishYear}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (!showTextBelow) {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger>
          {cardContent}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={4}>
            <Tooltip.Popup className="z-50 px-3 py-2 text-xs bg-warm-text text-white max-w-xs transition-all duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
              <div className="space-y-1">
                <p className="font-semibold">
                  {book.title}
                  {showPublishYear && book.publishYear && (
                    <span className="text-white text-opacity-60"> ({book.publishYear})</span>
                  )}
                </p>
                <p className="text-white text-opacity-80">{authors}</p>
              </div>
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }

  return cardContent;
});

export default BookCard;
