# Bookdart

## Project Purpose

Bookdart is a clean, focused book tracking application - think Letterboxd, but for books. The goal is to provide readers with a simple, user-friendly platform to:

- Track books they've read, are reading, and want to read
- Rate and review their reading experiences
- Discover new books based on their reading history
- Build a personal reading journey timeline

## Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router for modern, performant web applications
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid, consistent styling

### Backend (Planned)
- **Supabase**: Backend-as-a-Service for authentication, database, and real-time features
  - PostgreSQL database
  - Built-in authentication
  - Row-level security
  - Real-time subscriptions

### External APIs
- **Open Library API**: Free, open-source book data API for:
  - Book metadata (title, author, ISBN, cover images)
  - Search functionality
  - Book details and descriptions

## Design Philosophy

**Simple**: Focus on core book tracking features without unnecessary complexity. Every feature should serve a clear purpose in the reading tracking experience.

**Focused**: Build what matters most to readers - tracking, rating, and discovering books. Avoid feature creep and stay true to the Letterboxd-inspired model.

**User-Friendly**: Prioritize intuitive UI/UX that makes book tracking feel effortless. The app should fade into the background and let the books shine.

## Project Structure

```
bookdart/
├── app/              # Next.js App Router pages and layouts
├── components/       # Reusable React components
├── lib/             # Utility functions, API clients, and shared logic
├── public/          # Static assets
└── CLAUDE.md        # This file - project documentation for development
```

## Development Roadmap

### Phase 1: Foundation ✓
- Project setup with Next.js 14, TypeScript, and Tailwind CSS
- Basic folder structure
- Landing page with branding

### Phase 2: Core Features (Upcoming)
- Book search integration with Open Library API
- User authentication with Supabase
- Personal book lists (reading, read, want to read)
- Book rating and review system

### Phase 3: Enhancement (Future)
- Reading statistics and insights
- Social features (following, activity feed)
- Advanced search and filtering
- Reading goals and challenges

## Notes for Development

- Keep components small and focused
- Use TypeScript strictly - avoid `any` types
- Follow Next.js App Router conventions (server components by default)
- Implement responsive design mobile-first
- Test with real book data early and often
