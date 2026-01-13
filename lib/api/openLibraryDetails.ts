import type { OpenLibraryWork, OpenLibraryEditionsResponse, OpenLibraryAuthor } from '@/lib/types/bookDetail'
import type { Book } from '@/lib/types/book'

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

    // Get additional metadata from first edition
    try {
      const editionsResponse = await fetch(`${BASE_URL}${bookId}/editions.json?limit=1`)
      if (editionsResponse.ok) {
        const editionsData: OpenLibraryEditionsResponse = await editionsResponse.json()
        const firstEdition = editionsData.entries?.[0]

        if (firstEdition) {
          if (!coverUrl && firstEdition.covers?.[0]) {
            coverUrl = `https://covers.openlibrary.org/b/id/${firstEdition.covers[0]}-L.jpg`
          }
          isbn = firstEdition.isbn
          publishYear = firstEdition.publish_date
            ? parseInt(firstEdition.publish_date)
            : undefined
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
      publishYear: publishYear || (work.first_publish_date ? parseInt(work.first_publish_date) : undefined),
      coverUrl,
      isbn,
    }
  } catch (error) {
    console.error('Error fetching book details:', error)
    return null
  }
}
