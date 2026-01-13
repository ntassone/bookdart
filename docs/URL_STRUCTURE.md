# Book URL Structure

## Overview

Book detail pages now use human-readable, SEO-friendly URLs that combine author name, book title, and the Open Library ID for uniqueness.

## URL Format

```
/book/{author-slug}/{title-slug}-{openlibrary-id}
```

### Examples

- **Harry Potter and the Sorcerer's Stone** by J.K. Rowling:
  ```
  /book/jk-rowling/harry-potter-and-the-sorcerers-stone-OL45804W
  ```

- **1984** by George Orwell:
  ```
  /book/george-orwell/1984-OL123456W
  ```

- **Pride and Prejudice** by Jane Austen:
  ```
  /book/jane-austen/pride-and-prejudice-OL234567W
  ```

- **The Lord of the Rings** by J.R.R. Tolkien:
  ```
  /book/jrr-tolkien/the-lord-of-the-rings-the-fellowship-of-the-ring-OL345678W
  ```

## Implementation Details

### Route Structure

Next.js dynamic route: `/app/book/[author]/[slug]/page.tsx`

- `[author]`: Slugified first author name
- `[slug]`: Slugified book title + Open Library ID

### Utilities

Located in `/lib/utils/bookUrl.ts`:

#### `generateBookUrl(book: Book): string`
Generates a complete book URL from a Book object.

```typescript
const url = generateBookUrl(book)
// Returns: /book/j-k-rowling/harry-potter-and-the-sorcerers-stone-OL45804W
```

#### `extractBookIdFromSlug(slug: string): string`
Extracts the Open Library ID from the URL slug.

```typescript
const bookId = extractBookIdFromSlug('harry-potter-and-the-sorcerers-stone-OL45804W')
// Returns: OL45804W
```

#### `bookIdToKey(bookId: string): string`
Converts an Open Library ID to the full API key format.

```typescript
const key = bookIdToKey('OL45804W')
// Returns: /works/OL45804W
```

### Slugification Rules

1. Convert to lowercase
2. Replace spaces with hyphens (`-`)
3. Remove all non-word characters (keeping only letters, numbers, and hyphens)
4. Collapse multiple hyphens into single hyphens
5. Trim hyphens from start and end

### Special Cases

- **Books with no author**: Uses `unknown` as the author slug
  ```
  /book/unknown/mystery-book-OL456789W
  ```

- **Multiple authors**: Uses only the first author in the URL
  ```
  /book/neil-gaiman/good-omens-OL123456W
  ```
  (Even though Terry Pratchett is a co-author)

- **Special characters**: Removed from slugs
  ```
  "The Lord of the Rings: The Fellowship (Vol. 1)"
  becomes
  "the-lord-of-the-rings-the-fellowship-vol-1"
  ```

## Benefits

1. **SEO-friendly**: Search engines can understand the URL content
2. **Human-readable**: Users can see what book they're viewing from the URL
3. **Shareable**: URLs are clean and easy to share
4. **Unique**: Open Library ID ensures no collisions
5. **Backwards compatible**: Old URLs can redirect to new format if needed

## Usage in Components

### BookCard Component

```typescript
import { generateBookUrl } from '@/lib/utils/bookUrl'

const url = generateBookUrl(book)
router.push(url)
```

### Book Detail Page

```typescript
import { extractBookIdFromSlug, bookIdToKey } from '@/lib/utils/bookUrl'

const bookId = extractBookIdFromSlug(slug)
const bookKey = bookIdToKey(bookId)
const bookDetail = await getBookDetailData(bookKey)
```

## Technical Notes

- The Open Library ID at the end ensures uniqueness even if two books have the same title and author
- Work IDs end with `W` (e.g., `OL45804W`)
- Edition IDs end with `M` (e.g., `OL12345M`)
- The system automatically converts between these formats as needed
