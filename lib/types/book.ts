export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  author_key?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  number_of_pages_median?: number;
  publisher?: string[];
}

export interface OpenLibrarySearchResponse {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  docs: OpenLibraryBook[];
}

export interface Book {
  id: string;
  title: string;
  authors: string[];
  author?: string; // Convenience field for single author display
  publishYear?: number;
  coverUrl?: string;
  cover_url?: string; // Alternative naming for cover URL
  isbn?: string[];
}

export interface CachedBook extends Book {
  description?: string;
  cached_at: string;
  updated_at: string;
}
