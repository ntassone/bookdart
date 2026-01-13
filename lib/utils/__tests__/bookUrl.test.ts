import { generateBookUrl, extractBookIdFromSlug, bookIdToKey } from '../bookUrl'
import type { Book } from '@/lib/types/book'

describe('bookUrl utilities', () => {
  describe('generateBookUrl', () => {
    it('generates human-readable URLs for books', () => {
      const book: Book = {
        id: '/works/OL45804W',
        title: 'Harry Potter and the Sorcerer\'s Stone',
        authors: ['J.K. Rowling'],
        publishYear: 1997,
        coverUrl: 'https://covers.openlibrary.org/b/id/123-L.jpg',
        isbn: ['9780439708180']
      }

      const url = generateBookUrl(book)
      expect(url).toBe('/book/jk-rowling/harry-potter-and-the-sorcerers-stone-OL45804W')
    })

    it('handles books with no author', () => {
      const book: Book = {
        id: '/works/OL12345W',
        title: 'Mystery Book',
        authors: [],
        publishYear: 2020,
      }

      const url = generateBookUrl(book)
      expect(url).toBe('/book/unknown/mystery-book-OL12345W')
    })

    it('handles special characters in title', () => {
      const book: Book = {
        id: '/works/OL98765W',
        title: 'The Lord of the Rings: The Fellowship of the Ring (Vol. 1)',
        authors: ['J.R.R. Tolkien'],
        publishYear: 1954,
      }

      const url = generateBookUrl(book)
      expect(url).toBe('/book/jrr-tolkien/the-lord-of-the-rings-the-fellowship-of-the-ring-vol-1-OL98765W')
    })
  })

  describe('extractBookIdFromSlug', () => {
    it('extracts Open Library ID from slug', () => {
      const slug = 'harry-potter-and-the-sorcerers-stone-OL45804W'
      const id = extractBookIdFromSlug(slug)
      expect(id).toBe('OL45804W')
    })

    it('handles edition IDs', () => {
      const slug = 'some-book-title-OL12345M'
      const id = extractBookIdFromSlug(slug)
      expect(id).toBe('OL12345M')
    })
  })

  describe('bookIdToKey', () => {
    it('converts work ID to key', () => {
      const key = bookIdToKey('OL45804W')
      expect(key).toBe('/works/OL45804W')
    })

    it('converts edition ID to key', () => {
      const key = bookIdToKey('OL12345M')
      expect(key).toBe('/books/OL12345M')
    })

    it('handles already formatted keys', () => {
      const key = bookIdToKey('/works/OL45804W')
      expect(key).toBe('/works/OL45804W')
    })
  })
})

// Example URLs that will be generated:
// /book/j-k-rowling/harry-potter-and-the-sorcerers-stone-OL45804W
// /book/george-orwell/1984-OL123456W
// /book/jane-austen/pride-and-prejudice-OL234567W
// /book/j-r-r-tolkien/the-lord-of-the-rings-the-fellowship-of-the-ring-OL345678W
// /book/unknown/mystery-book-OL456789W
