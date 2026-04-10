import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Play, BookOpen, User, Loader2, LogOut, ShieldCheck, X, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Auth from './Auth';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('anime'); 
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkAdmin(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkAdmin(session.user.id);
        setShowAuth(false);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (data?.role === 'admin') {
      setIsAdmin(true);
      // As an admin, let's count total users just for fun
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      setUserCount(count);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const type = mode === 'anime' ? 'anime' : 'manga';
      const endpoint = `https://api-consumet-org-five.vercel.app/meta/anilist/${query}`;
      const { data } = await axios.get(endpoint);
      
      const filtered = data.results.filter(item => {
        if (mode === 'anime') return item.type === 'ANIME' || item.type === 'TV';
        return item.type === 'MANGA';
      });
      setResults(filtered || data.results);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-gray-100 font-sans">
      {/* Navbar */}
      <nav className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Play className="fill-white text-white" size={16} />
            </div>
            <h1 className="text-2xl font-black text-blue-500 tracking-tighter uppercase hidden sm:block">MUDKIP.TV</h1>
          </Link>
        </div>
        
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 relative">
          <input 
            type="text" 
            placeholder={`Search ${mode}...`}
            className="w-full bg-gray-800 border-none rounded-full py-2 px-10 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </form>

        <div className="flex gap-2 sm:gap-4 items-center">
          {/* Restored Tabs */}
          <div className="hidden md:flex bg-gray-800 rounded-full p-1">
            <button onClick={() => setMode('anime')} className={`px-4 py-1 rounded-full text-xs font-bold transition ${mode === 'anime' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>ANIME</button>
            <button onClick={() => setMode('manga')} className={`px-4 py-1 rounded-full text-xs font-bold transition ${mode === 'manga' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>MANGA</button>
          </div>

          {isAdmin && (
            <button 
              onClick={() => setShowAdminMenu(true)}
              className="bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-full border border-yellow-500/50 flex items-center gap-2 text-[10px] font-black hover:bg-yellow-500/20 transition"
            >
              <ShieldCheck size={14} /> ADMIN
            </button>
          )}

          {session ? (
            <button onClick={() => supabase.auth.signOut()} className="bg-red-500/10 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition">
              <LogOut size={20}/>
            </button>
          ) : (
            <button onClick={() => setShowAuth(!showAuth)} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition text-blue-500">
              <User size={20}/>
            </button>
          )}
        </div>
      </nav>

      {/* Admin Panel Modal */}
      {showAdminMenu && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl w-full max-w-lg p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-yellow-500 flex items-center gap-2">
                <ShieldCheck size={28} /> ADMIN DASHBOARD
              </h2>
              <button onClick={() => setShowAdminMenu(false)} className="text-gray-500 hover:text-white"><X /></button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 text-blue-500 rounded-lg"><Users /></div>
                  <div>
                    <p className="text-gray-400 text-sm font-bold uppercase">Total Users</p>
                    <p className="text-3xl font-black">{userCount}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                <p className="text-xs text-yellow-500/80 italic">More admin features like "User Management" and "Site Logs" can be added here once we have more data.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="p-6 max-w-[1400px] mx-auto">
        {showAuth && !session ? <Auth /> : (
          <>
            <div className="md:hidden flex justify-center mb-6">
                <div className="bg-gray-800 rounded-full p-1 flex">
                    <button onClick={() => setMode('anime')} className={`px-6 py-2 rounded-full text-xs font-bold transition ${mode === 'anime' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>ANIME</button>
                    <button onClick={() => setMode('manga')} className={`px-6 py-2 rounded-full text-xs font-bold transition ${mode === 'manga' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>MANGA</button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {results.map((item) => (
                <Link to={`/watch/${item.id}`} key={item.id} className="group block">
                  <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-gray-800">
                    <img src={item.image} alt="poster" className="object-cover w-full h-full group-hover:scale-110 transition duration-500" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-4">
                      <span className="bg-blue-500 text-white px-4 py-2 rounded font-bold text-xs">WATCH NOW</span>
                    </div>
                  </div>
                  <h3 className="mt-3 text-sm font-bold line-clamp-1 group-hover:text-blue-500 transition">
                    {item.title.english || item.title.romaji}
                  </h3>
                </Link>
              ))}
            </div>
            
            {!loading && results.length === 0 && (
              <div className="text-center mt-32">
                <Search size={80} className="mx-auto text-gray-800 mb-4" />
                <h3 className="text-xl font-bold text-gray-400 font-sans">Search for some {mode}!</h3>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;