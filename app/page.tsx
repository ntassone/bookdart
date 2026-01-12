export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-700">Bookdart</h1>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-600 hover:text-gray-700 transition-colors">
                Browse
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-700 transition-colors">
                My Books
              </a>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

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
            A clean, simple way to track the books you've read, discover new favorites,
            and build your personal reading timeline.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
              Get Started
            </button>
            <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-600 px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
              Learn More
            </button>
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
