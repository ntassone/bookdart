import type { OpenLibraryWork, OpenLibraryEditionsResponse, OpenLibraryAuthor } from '@/lib/types/bookDetail'
import type { Book } from '@/lib/types/book'
import { extractYear } from '@/lib/utils/dateUtils'

const BASE_URL = 'https://openlibrary.org'

/**
 * Fetch detailed book information from Open Library Works API
 * Book IDs from search are in format "/works/OL12345W"
 */
export async function getBookDetails(bookId: string): Promise<Book | null> {
  try {
    // bookId comes in as "/works/OL12345W" from search results
    const response = await fetch(`${BASE_URL}${bookId}.json`)

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error('Failed to fetch book details')
    }

    const work: OpenLibraryWork = await response.json()

    // Fetch edition data for cover and ISBN if not in work
    let coverUrl: string | undefined
    let isbn: string[] | undefined
    let publishYear: number | undefined

    // Try to get cover from work
    if (work.covers && work.covers.length > 0) {
      coverUrl = `https://covers.openlibrary.org/b/id/${work.covers[0]}-L.jpg`
    }

    // Try multiple sources for publish year in priority order:
    // 1. Work's first_publish_date
    // 2. First edition's publish_date
    // 3. Any edition with a valid year

    // First try the work's first publish date
    if (work.first_publish_date) {
      publishYear = extractYear(work.first_publish_date)
    }

    // Get additional metadata from editions
    try {
      const editionsResponse = await fetch(`${BASE_URL}${bookId}/editions.json?limit=10`)
      if (editionsResponse.ok) {
        const editionsData: OpenLibraryEditionsResponse = await editionsResponse.json()

        // Try to get cover and ISBN from first edition
        const firstEdition = editionsData.entries?.[0]
        if (firstEdition) {
          if (!coverUrl && firstEdition.covers?.[0]) {
            coverUrl = `https://covers.openlibrary.org/b/id/${firstEdition.covers[0]}-L.jpg`
          }
          isbn = firstEdition.isbn
        }

        // If we still don't have a valid publish year, try editions
        if (!publishYear && editionsData.entries) {
          // Sort editions by publish_date to find the earliest valid one
          const validYears = editionsData.entries
            .map(edition => edition.publish_date ? extractYear(edition.publish_date) : undefined)
            .filter((year): year is number => year !== undefined)
            .sort((a, b) => a - b)

          if (validYears.length > 0) {
            publishYear = validYears[0] // Use the earliest valid year
          }
        }
      }
    } catch {
      // Continue without edition data
    }

    // Extract author names from work
    let authors: string[] = []
    if (work.authors && work.authors.length > 0) {
      // Fetch author details
      const authorPromises = work.authors.map(async (a) => {
        try {
          const authorResponse = await fetch(`${BASE_URL}${a.author.key}.json`)
          if (authorResponse.ok) {
            const authorData: OpenLibraryAuthor = await authorResponse.json()
            return authorData.name
          }
        } catch {
          return null
        }
      })
      const authorNames = await Promise.all(authorPromises)
      authors = authorNames.filter(Boolean) as string[]
    }

    return {
      id: work.key,
      title: work.title,
      authors: authors.length > 0 ? authors : ['Unknown Author'],
      publishYear,
      coverUrl,
      isbn,
    }
  } catch (error) {
    console.error('Error fetching book details:', error)
    return null
  }
}
