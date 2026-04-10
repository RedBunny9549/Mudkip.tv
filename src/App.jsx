import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Play, BookOpen, User, Loader2, LogOut, ShieldCheck } from 'lucide-react';
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdmin(session?.user?.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdmin(session?.user?.id);
      if (session) setShowAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId) => {
    if (!userId) return setIsAdmin(false);
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (data?.role === 'admin') setIsAdmin(true);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const endpoint = `https://api-consumet-org-five.vercel.app/meta/anilist/${query}`;
      const { data } = await axios.get(endpoint);
      setResults(data.results || []);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-gray-100 font-sans">
      <nav className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Play className="fill-white text-white" size={16} />
            </div>
            <h1 className="text-2xl font-black text-blue-500 tracking-tighter uppercase">MUDKIP.TV</h1>
          </Link>
        </div>
        
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 relative">
          <input 
            type="text" 
            placeholder="Search..."
            className="w-full bg-gray-800 border-none rounded-full py-2 px-10 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </form>

        <div className="flex gap-2 sm:gap-4">
          {isAdmin && (
            <button className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/50 flex items-center gap-2 text-xs font-bold">
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

      <main className="p-6 max-w-[1400px] mx-auto">
        {showAuth && !session ? <Auth /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {results.map((item) => (
              <Link to={`/watch/${item.id}`} key={item.id} className="group block">
                <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-gray-800">
                  <img src={item.image} alt="poster" className="object-cover w-full h-full group-hover:scale-110 transition duration-500" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-4">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded font-bold text-xs">WATCH NOW</span>
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-bold truncate group-hover:text-blue-500 transition">
                  {item.title.english || item.title.romaji}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;