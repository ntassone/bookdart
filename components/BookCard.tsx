'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Book } from '@/lib/types/book';
import BookCardActions from './BookCardActions';
import { generateBookUrl } from '@/lib/utils/bookUrl';

interface BookCardProps {
  book: Book;
  onClick?: () => void;
  showAddButton?: boolean;
  onBookAdded?: () => void;
}

export default function BookCard({ book, onClick, showAddButton = false, onBookAdded }: BookCardProps) {
  const router = useRouter();
  const authors = book.authors.join(', ') || 'Unknown Author';

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
      className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all group cursor-pointer relative overflow-hidden"
    >
      <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`${book.title} cover`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}

        {/* Action buttons on hover - overlay on cover */}
        {showAddButton && (
          <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <BookCardActions book={book} onAdded={onBookAdded} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-700 text-sm mb-1 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-1 mb-1">
          {authors}
        </p>
        {book.publishYear && (
          <p className="text-xs text-gray-500">
            {book.publishYear}
          </p>
        )}
      </div>
    </div>
  );
}
