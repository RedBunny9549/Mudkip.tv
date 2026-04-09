import React, { useState } from 'react';
import axios from 'axios';
import { Search, Play, BookOpen, User } from 'lucide-react';
import { Link } from 'react-router-dom';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('anime');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    
    try {
      const endpoint = mode === 'anime' 
        ? `https://api.consumet.org/anime/gogoanime/${query}`
        : `https://api.consumet.org/manga/mangadex/${query}`;
        
      const { data } = await axios.get(endpoint);
      setResults(data.results);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 font-sans">
      <nav className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 sticky top-0 z-50 backdrop-blur-md">
        <h1 className="text-2xl font-black text-accent tracking-tighter">MUDKIP.TV</h1>
        
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 relative">
          <input 
            type="text" 
            placeholder={`Search ${mode}...`}
            className="w-full bg-gray-800 border-none rounded-full py-2 px-10 focus:ring-2 focus:ring-accent outline-none"
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </form>

        <div className="flex gap-4">
          <button onClick={() => setMode('anime')} className={`p-2 ${mode === 'anime' ? 'text-accent' : ''}`}><Play /></button>
          <button onClick={() => setMode('manga')} className={`p-2 ${mode === 'manga' ? 'text-accent' : ''}`}><BookOpen /></button>
          <button className="bg-accent p-2 rounded-full"><User size={20}/></button>
        </div>
      </nav>

      <main className="p-6">
        {loading && <p className="text-center text-accent animate-pulse">Searching the deep sea...</p>}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {results.map((item) => (
            <Link to={`/watch/${item.id}`} key={item.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg aspect-[3/4]">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="object-cover w-full h-full group-hover:scale-110 transition duration-300" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div className="bg-accent w-full py-2 rounded text-sm font-bold text-center text-white">
                    {mode === 'anime' ? 'WATCH' : 'READ'}
                  </div>
                </div>
              </div>
              <h3 className="mt-2 text-sm font-medium truncate group-hover:text-accent transition">{item.title}</h3>
              <p className="text-xs text-gray-500 uppercase">{item.releaseDate || 'Ongoing'}</p>
            </Link>
          ))}
        </div>

        {!loading && results.length === 0 && (
          <div className="text-center mt-20 text-gray-600">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p>Search for your favorite {mode} to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;