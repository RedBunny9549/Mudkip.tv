import React, { useState } from 'react';
import axios from 'axios';
import { Search, Play, BookOpen, User, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('anime'); // 'anime' or 'manga'

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    
    try {
      // Using a more stable meta-provider (Anilist) via a public Consumet instance
      // This helps avoid the CORS issues we saw earlier
      const endpoint = `https://api-consumet-org-five.vercel.app/meta/anilist/${query}`;
        
      const { data } = await axios.get(endpoint);
      
      // We filter based on mode since the 'meta' endpoint often returns both
      const filteredResults = data.results.filter(item => {
        if (mode === 'anime') return item.type === 'ANIME' || item.type === 'TV';
        return item.type === 'MANGA';
      });

      setResults(filteredResults || data.results);
    } catch (err) {
      console.error("Search failed", err);
      // Fallback alert so you know if the API is acting up
      alert("The deep sea search failed. The API might be sleepy, try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 font-sans">
      {/* Navbar */}
      <nav className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Play className="fill-white text-white" size={16} />
          </div>
          <h1 className="text-2xl font-black text-accent tracking-tighter">MUDKIP.TV</h1>
        </div>
        
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 relative">
          <input 
            type="text" 
            placeholder={`Search ${mode}...`}
            className="w-full bg-gray-800 border-none rounded-full py-2 px-10 focus:ring-2 focus:ring-accent outline-none text-sm transition-all"
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          {loading && <Loader2 className="absolute right-3 top-2.5 text-accent animate-spin" size={18} />}
        </form>

        <div className="flex gap-2 sm:gap-4">
          <button 
            onClick={() => setMode('anime')} 
            className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${mode === 'anime' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Play size={16} /> <span className="hidden sm:inline">Anime</span>
          </button>
          <button 
            onClick={() => setMode('manga')} 
            className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${mode === 'manga' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <BookOpen size={16} /> <span className="hidden sm:inline">Manga</span>
          </button>
          <button className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition">
            <User size={20}/>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 max-w-[1400px] mx-auto">
        {results.length > 0 && (
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-gray-400">
            Results for <span className="text-white">"{query}"</span>
          </h2>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {results.map((item) => (
            <Link 
              to={`/watch/${item.id}`} 
              key={item.id} 
              className="group cursor-pointer block"
            >
              <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-gray-800 shadow-lg">
                <img 
                  src={item.image} 
                  alt={item.title.english || item.title.romaji} 
                  className="object-cover w-full h-full group-hover:scale-110 transition duration-500" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="bg-accent w-full py-2 rounded-lg text-sm font-bold text-center text-white shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    {mode === 'anime' ? 'WATCH NOW' : 'READ NOW'}
                  </div>
                </div>
              </div>
              <h3 className="mt-3 text-sm font-bold line-clamp-2 group-hover:text-accent transition">
                {item.title.english || item.title.romaji}
              </h3>
              <div className="flex justify-between items-center mt-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                <span>{item.releaseDate || 'N/A'}</span>
                <span className="bg-gray-800 px-2 py-0.5 rounded text-accent border border-gray-700">
                  {item.format || item.type}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {!loading && results.length === 0 && (
          <div className="text-center mt-32">
            <div className="relative inline-block">
              <Search size={80} className="mx-auto text-gray-800 mb-4" />
              <Play size={30} className="absolute bottom-6 right-0 text-accent animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-gray-400">Search your favorite titles</h3>
            <p className="text-gray-600 mt-2">Ready to watch some anime or read some manga?</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 p-10 border-t border-gray-800 text-center text-gray-600 text-sm">
        <p>© 2026 MUDKIP.TV - Made for Pokemon fans and Otakus</p>
      </footer>
    </div>
  );
}

export default App;