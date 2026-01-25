import type { Book } from '@/lib/types/book'

/**
 * Patterns that indicate a book is a derivative work (summary, study guide, etc.)
 * rather than the original work
 */
const DERIVATIVE_PATTERNS = [
  // Summaries (all variations)
  /\bsummary\b/i,
  /summarized/i,
  /summarised/i,
  /cliff'?s?\s*notes/i,
  /cliffsnotes/i,
  /spark\s*notes/i,
  /sparknotes/i,
  /book\s*summary/i,
  /minute\s*summary/i,
  /quick\s*summary/i,
  /brief\s*summary/i,
  /executive\s*summary/i,
  /plot\s*summary/i,
  /chapter\s*summary/i,

  // Notes (catch all variations)
  /\bnotes?\b/i,
  /book\s*notes/i,
  /study\s*notes/i,
  /lecture\s*notes/i,
  /reader'?s?\s*notes/i,
  /critical\s*notes/i,

  // Study guides and analysis
  /study\s*guide/i,
  /reading\s*guide/i,
  /teacher'?s?\s*guide/i,
  /lesson\s*plans?/i,
  /student\s*guide/i,
  /educator'?s?\s*guide/i,
  /classroom\s*guide/i,
  /companion/i,
  /reader'?s?\s*companion/i,
  /\banalysis\b/i,
  /critical\s*analysis/i,
  /literary\s*analysis/i,
  /character\s*analysis/i,
  /theme\s*analysis/i,
  /explained/i,
  /understanding/i,
  /\bguide\b/i,
  /overview/i,
  /introduction\s*to/i,

  // Reviews and commentary
  /book\s*review/i,
  /review\s*and\s*analysis/i,
  /\bcommentary\b/i,
  /discussion\s*guide/i,
  /conversation\s*guide/i,
  /critical\s*commentary/i,

  // Workbooks and exercises
  /workbook/i,
  /activity\s*book/i,
  /coloring\s*book/i,
  /puzzle\s*book/i,
  /\bjournal\b/i,
  /\bnotebook\b/i,
  /exercise\s*book/i,
  /practice\s*book/i,

  // Adaptations
  /graphic\s*novel\s*adaptation/i,
  /comic\s*adaptation/i,
  /manga\s*adaptation/i,
  /adaptation\s*for/i,
  /adapted\s*for/i,
  /abridged/i,
  /condensed/i,
  /simplified/i,

  // Box sets and collections
  /box\s*set/i,
  /boxed\s*set/i,
  /\d+\s*book\s*set/i,
  /\d+\s*book\s*collection/i,
  /complete\s*collection/i,
  /complete\s*set/i,
  /\d+\s*volume\s*set/i,
  /collection\s*boxed/i,
  /omnibus/i,
  /anthology/i,

  // Special editions and merchandise
  /poster\s*book/i,
  /art\s*book/i,
  /movie\s*companion/i,
  /cinematic\s*guide/i,
  /film\s*companion/i,
  /film\s*tie-in/i,
  /movie\s*tie-in/i,
  /tv\s*tie-in/i,
  /behind\s*the\s*scenes/i,
  /making\s*of/i,
  /official\s*guide/i,
  /visual\s*companion/i,
  /visual\s*guide/i,
  /visual\s*dictionary/i,
  /illustrated\s*edition/i,
  /illustrated\s*companion/i,
  /pop-up\s*book/i,
  /deluxe\s*illustrated/i,
  /gift\s*edition/i,
  /encyclopedia/i,
  /handbook/i,
  /manual/i,

  // Reader guides and book club materials
  /reader'?s?\s*guide/i,
  /book\s*club/i,
  /reading\s*questions/i,
  /discussion\s*questions/i,
  /group\s*discussion/i,

  // Notes and annotations
  /annotated/i,
  /with\s*notes/i,
  /notes\s*and/i,
  /footnotes/i,
  /annotations/i,

  // Educational materials
  /textbook/i,
  /coursebook/i,
  /curriculum/i,
  /syllabus/i,

  // Common prefixes/suffixes that indicate derivative works
  /^(a\s*)?guide\s*to/i,
  /:\s*a\s*summary/i,
  /in\s*\d+\s*minutes?/i,
  /key\s*takeaways/i,
  /:\s*summary/i,
  /:\s*book\s*summary/i,
  /:\s*companion/i,
  /:\s*guide/i,
  /:\s*notes/i,
  /:\s*analysis/i,
  /\btrivia\b/i,
  /quiz\s*book/i,
  /unauthorized/i,
  /unofficial/i,
  /fan\s*guide/i,
  /fan\s*companion/i,

  // Exam prep and test materials
  /exam\s*prep/i,
  /test\s*prep/i,
  /practice\s*test/i,
  /study\s*aid/i,
  /revision\s*guide/i,

  // Reference materials
  /reference\s*guide/i,
  /companion\s*guide/i,
  /essential\s*guide/i,
  /ultimate\s*guide/i,
  /complete\s*guide/i,
]

/**
 * Checks if a book has an unknown author
 */
function hasUnknownAuthor(book: Book): boolean {
  if (!book.authors || book.authors.length === 0) {
    return true
  }

  const authorText = book.authors.join(' ').toLowerCase()

  return (
    authorText === 'unknown' ||
    authorText === 'unknown author' ||
    authorText === 'anonymous' ||
    authorText === '' ||
    authorText.trim() === ''
  )
}

/**
 * Checks if a book title suggests it's a derivative work
 */
export function isDerivativeWork(book: Book): boolean {
  const titleToCheck = book.title.toLowerCase()

  // Filter out books with unknown authors
  if (hasUnknownAuthor(book)) {
    return true
  }

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
