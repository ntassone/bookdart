import type { Book } from '@/lib/types/book'

/**
 * Converts a string to a URL-friendly slug
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '')          // Trim - from end of text
}

/**
 * Generates a human-readable URL slug for a book
 * Format: /book/{author-slug}/{title-slug}-{openlibrary-id}
 * Example: /book/j-k-rowling/harry-potter-and-the-sorcerers-stone-OL26331930M
 */
export function generateBookUrl(book: Book): string {
  // Get first author or use "unknown" if none
  const author = book.authors[0] || 'unknown'
  const authorSlug = slugify(author)

  // Generate title slug
  const titleSlug = slugify(book.title)

  // Extract the Open Library ID from the key (e.g., "/works/OL12345W" -> "OL12345W")
  const bookId = book.id.split('/').pop() || book.id

  return `/book/${authorSlug}/${titleSlug}-${bookId}`
}

/**
 * Extracts the Open Library ID from a book URL slug
 * Example: "harry-potter-and-the-sorcerers-stone-OL26331930M" -> "OL26331930M"
 */
export function extractBookIdFromSlug(slug: string): string {
  // The ID is always at the end after the last hyphen
  // Format: {title-slug}-{ID}
  const parts = slug.split('-')

  // Find the part that looks like an Open Library ID (starts with OL and ends with W or M)
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i]
    if (part.match(/^OL\d+[WM]$/)) {
      return part
    }
  }

  // If no valid ID found, return the last part
  return parts[parts.length - 1]
}

/**
 * Converts an Open Library ID to the full key format
 * Example: "OL12345W" -> "/works/OL12345W"
 */
export function bookIdToKey(bookId: string): string {
  if (bookId.startsWith('/works/')) {
    return bookId
  }

  // Determine if it's a work or edition based on the suffix
  if (bookId.endsWith('W')) {
    return `/works/${bookId}`
  } else if (bookId.endsWith('M')) {
    return `/books/${bookId}`
  }

  // Default to works
  return `/works/${bookId}`
}
