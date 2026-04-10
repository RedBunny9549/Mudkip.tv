import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Play, BookOpen, User, LogOut, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Auth from './Auth';

// Mudkip Colors
const colors = {
  bgDeep: '#060d17',
  accent: '#3a86ff',
  orange: '#fb8500'
};

const MUDKIP_LOGO = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/258.png";

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('anime'); 
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const endpoint = `https://api-consumet-org-five.vercel.app/meta/anilist/${query}`;
      const { data } = await axios.get(endpoint);
      const filtered = data.results.filter(item => 
        mode === 'anime' ? (item.type === 'ANIME' || item.type === 'TV') : item.type === 'MANGA'
      );
      setResults(filtered || data.results);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen text-white font-sans pb-20" style={{ backgroundColor: colors.bgDeep }}>
      
      {/* 1. HEADER (Mudkip Logo, Tabs, Account) */}
      <nav className="p-4 border-b border-white/5 flex justify-between items-center sticky top-0 z-[100] bg-[#060d17]/90 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link to="/" onClick={() => setResults([])} className="flex items-center gap-2">
            <img src={MUDKIP_LOGO} className="w-10 h-10" alt="Mudkip" />
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">MUDKIP.TV</h1>
          </Link>

          {/* 2. ANIME & MANGA TABS */}
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
            <button 
              onClick={() => setMode('anime')} 
              className={`px-6 py-2 rounded-lg text-xs font-black transition ${mode === 'anime' ? 'bg-blue-600' : 'text-gray-500'}`}
            >ANIME</button>
            <button 
              onClick={() => setMode('manga')} 
              className={`px-6 py-2 rounded-lg text-xs font-black transition ${mode === 'manga' ? 'bg-blue-600' : 'text-gray-500'}`}
            >MANGA</button>
          </div>
        </div>

        {/* 3. ACCOUNT SECTION */}
        <div>
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-blue-500">{session.user.email.split('@')[0]}</span>
              <button onClick={() => supabase.auth.signOut()} className="bg-white/5 p-2 rounded-lg hover:bg-red-500 transition">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(!showAuth)} className="bg-blue-600 px-6 py-2 rounded-lg text-xs font-black">SIGN IN</button>
          )}
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 mt-10">
        {showAuth && !session ? <Auth /> : (
          <>
            {/* 4. SEARCH BAR */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-16">
              <input 
                type="text" 
                placeholder={`Search ${mode}...`}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-12 outline-none focus:border-blue-500 transition-all text-lg"
                onChange={(e) => setQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-5 text-gray-500" size={24} />
              {loading && <Loader2 className="absolute right-4 top-5 text-blue-500 animate-spin" />}
            </form>

            {/* 5. SEARCH RESULTS */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {results.map((item) => (
                <Link to={`/watch/${item.id}`} key={item.id} className="group">
                  <div className="relative aspect-[3/4.5] rounded-3xl overflow-hidden border border-white/5 shadow-2xl transition-transform group-hover:-translate-y-2">
                    <img src={item.image} className="w-full h-full object-cover" alt="poster" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Play fill="white" size={48} />
                    </div>
                  </div>
                  <h3 className="mt-4 text-sm font-bold line-clamp-1 text-center group-hover:text-blue-500 transition">
                    {item.title.english || item.title.romaji}
                  </h3>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;