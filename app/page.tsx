import Link from 'next/link';
import { Button } from '@base-ui/react/button';
import Navigation from '@/components/Navigation';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl text-center">
          <h2 className="text-6xl font-bold text-gray-700 mb-6">
            Bookdart
          </h2>
          <p className="text-2xl text-gray-600 mb-12">
            Track your reading journey
          </p>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            A clean, simple way to track the books you&apos;ve read, discover new favorites,
            and build your personal reading timeline.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/search">
              <Button className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
                Get Started
              </Button>
            </Link>
            <Button className="border-2 border-gray-300 hover:border-gray-400 text-gray-600 px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
              Learn More
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          Built with Next.js, TypeScript, and Tailwind CSS
        </div>
      </footer>
    </div>
  );
}
