import type { Book } from '@/lib/types/book'

/**
 * Patterns that indicate a book is a derivative work (summary, study guide, etc.)
 * rather than the original work
 */
const DERIVATIVE_PATTERNS = [
  // Summaries
  /summary/i,
  /summarized/i,
  /cliff'?s?\s*notes/i,
  /spark\s*notes/i,
  /book\s*summary/i,
  /minute\s*summary/i,

  // Study guides and analysis
  /study\s*guide/i,
  /reading\s*guide/i,
  /teacher'?s?\s*guide/i,
  /lesson\s*plans?/i,
  /student\s*guide/i,
  /companion/i,
  /analysis/i,
  /critical\s*analysis/i,

  // Reviews and commentary
  /book\s*review/i,
  /review\s*and\s*analysis/i,
  /commentary/i,

  // Workbooks and exercises
  /workbook/i,
  /activity\s*book/i,
  /coloring\s*book/i,

  // Adaptations
  /graphic\s*novel\s*adaptation/i,
  /comic\s*adaptation/i,

  // Common prefixes/suffixes that indicate derivative works
  /^(a\s*)?guide\s*to/i,
  /:\s*a\s*summary/i,
  /in\s*\d+\s*minutes?/i,
  /key\s*takeaways/i,
]

/**
 * Checks if a book title suggests it's a derivative work
 */
export function isDerivativeWork(book: Book): boolean {
  const titleToCheck = book.title.toLowerCase()

  return DERIVATIVE_PATTERNS.some(pattern => pattern.test(titleToCheck))
}

/**
 * Filters out derivative works from a list of books
 */
export function filterDerivativeWorks(books: Book[]): Book[] {
  return books.filter(book => !isDerivativeWork(book))
}

/**
 * Separates books into original works and derivative works
 */
export function separateDerivativeWorks(books: Book[]): {
  originalWorks: Book[]
  derivativeWorks: Book[]
} {
  const originalWorks: Book[] = []
  const derivativeWorks: Book[] = []

  books.forEach(book => {
    if (isDerivativeWork(book)) {
      derivativeWorks.push(book)
    } else {
      originalWorks.push(book)
    }
  })

  return { originalWorks, derivativeWorks }
}
