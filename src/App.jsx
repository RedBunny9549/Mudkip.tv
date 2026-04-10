import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Play, BookOpen, User, LogOut, Loader2, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Auth from './Auth';

const colors = {
  bgDeep: '#060d17',
  accent: '#3a86ff',
  orange: '#fb8500',
  glass: 'rgba(255, 255, 255, 0.03)'
};

const MUDKIP_LOGO = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/258.png";

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('anime'); 
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [lastWatched, setLastWatched] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchLastWatched(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchLastWatched(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchLastWatched = async (userId) => {
    const { data } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    if (data) setLastWatched(data);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const endpoint = `https://api.consumet.org/meta/anilist/${query}`;
      const { data } = await axios.get(endpoint);
      const filtered = data.results.filter(item => 
        mode === 'anime' ? (item.type === 'ANIME' || item.type === 'TV') : item.type === 'MANGA'
      );
      setResults(filtered || data.results);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen text-white font-sans pb-20 selection:bg-blue-600" style={{ backgroundColor: colors.bgDeep }}>
      
      <nav className="p-4 border-b border-white/5 flex justify-between items-center sticky top-0 z-[100] bg-[#060d17]/80 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <Link to="/" onClick={() => setResults([])} className="flex items-center gap-2 group">
            <img src={MUDKIP_LOGO} className="w-10 h-10 group-hover:rotate-12 transition-transform" alt="Mudkip" />
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">MUDKIP.TV</h1>
          </Link>

          <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10 shadow-inner">
            <button onClick={() => setMode('anime')} className={`px-8 py-2 rounded-xl text-xs font-black transition-all ${mode === 'anime' ? 'bg-blue-600 shadow-lg' : 'text-gray-500 hover:text-white'}`}>ANIME</button>
            <button onClick={() => setMode('manga')} className={`px-8 py-2 rounded-xl text-xs font-black transition-all ${mode === 'manga' ? 'bg-blue-600 shadow-lg' : 'text-gray-500 hover:text-white'}`}>MANGA</button>
          </div>
        </div>

        <div>
          {session ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                 <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Logged in as</p>
                 <p className="text-sm font-bold">{session.user.email.split('@')[0]}</p>
              </div>
              <button onClick={() => supabase.signOut()} className="bg-white/5 p-3 rounded-2xl border border-white/10 hover:bg-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(!showAuth)} className="bg-blue-600 px-8 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-blue-600/30">SIGN IN</button>
          )}
        </div>
      </nav>

      <main className="max-w-[1500px] mx-auto px-10 mt-12">
        {showAuth && !session ? <Auth /> : (
          <>
            {/* ANIKKU STYLE HERO BUTTON (CONTINUE WATCHING) */}
            {lastWatched && results.length === 0 && (
              <div className="mb-16 p-8 rounded-[3rem] border border-blue-600/20 bg-gradient-to-r from-blue-600/10 to-transparent flex items-center justify-between group cursor-pointer hover:border-blue-600/50 transition-all">
                <div className="flex items-center gap-8">
                   <div className="relative">
                      <img src={lastWatched.image_url} className="w-20 h-28 object-cover rounded-2xl shadow-2xl" />
                      <div className="absolute inset-0 bg-blue-600/20 rounded-2xl" />
                   </div>
                   <div>
                      <p className="text-blue-500 font-black text-xs uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Sparkles size={14} /> Continue {lastWatched.type === 'anime' ? 'Watching' : 'Reading'}
                      </p>
                      <h2 className="text-4xl font-black italic tracking-tighter">{lastWatched.title}</h2>
                      <p className="text-gray-500 font-bold mt-1">Episode {lastWatched.episode_number}</p>
                   </div>
                </div>
                <Link to={`/watch/${lastWatched.media_id}`} className="bg-white text-black w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                  <Play fill="black" size={24} className="translate-x-0.5" />
                </Link>
              </div>
            )}

            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-16 group">
              <input 
                type="text" 
                placeholder={`Search ${mode}...`}
                className="w-full bg-white/5 border border-white/10 rounded-3xl py-4.5 px-14 outline-none focus:border-blue-500 transition-all text-lg shadow-2xl"
                onChange={(e) => setQuery(e.target.value)}
              />
              <Search className="absolute left-5 top-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={24} />
              {loading && <Loader2 className="absolute right-5 top-5 text-blue-500 animate-spin" />}
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
              {results.map((item) => (
                <Link to={`/watch/${item.id}`} key={item.id} className="group">
                  <div className="relative aspect-[3/4.5] rounded-[2.5rem] overflow-hidden border border-white/5 transition-all duration-500 group-hover:-translate-y-3 group-hover:border-blue-600/50 shadow-2xl">
                    <img src={item.image} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="poster" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl scale-50 group-hover:scale-100 transition-transform">
                        <Play fill="white" size={32} className="translate-x-1" />
                      </div>
                    </div>
                  </div>
                  <h3 className="mt-5 text-sm font-black text-center group-hover:text-blue-500 transition tracking-tight line-clamp-1 uppercase italic">
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