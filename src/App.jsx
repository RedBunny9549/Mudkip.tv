import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Play, BookOpen, User, Loader2, LogOut, ShieldCheck, X, Users, Star, Info } from 'lucide-react';
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
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (data?.role === 'admin') {
      setIsAdmin(true);
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      setUserCount(count);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
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
    <div className="min-h-screen bg-[#0b0e14] text-gray-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Navbar */}
      <nav className="p-4 border-b border-gray-800/50 flex justify-between items-center bg-[#0b0e14]/80 sticky top-0 z-[60] backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <Play className="fill-white text-white translate-x-0.5" size={18} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase hidden md:block">
              MUDKIP<span className="text-blue-500">.TV</span>
            </h1>
          </Link>

          {/* Desktop Tabs */}
          <div className="hidden lg:flex bg-gray-900/50 rounded-full p-1 border border-gray-800">
            <button onClick={() => setMode('anime')} className={`px-5 py-1.5 rounded-full text-xs font-black transition-all ${mode === 'anime' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>ANIME</button>
            <button onClick={() => setMode('manga')} className={`px-5 py-1.5 rounded-full text-xs font-black transition-all ${mode === 'manga' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>MANGA</button>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-4 relative group">
          <input 
            type="text" 
            placeholder={`Search ${mode}...`}
            className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-2.5 px-11 focus:ring-2 focus:ring-blue-600 focus:bg-gray-900 outline-none text-sm transition-all placeholder:text-gray-600"
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-3 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
          {loading && <Loader2 className="absolute right-4 top-3 text-blue-500 animate-spin" size={18} />}
        </form>

        <div className="flex gap-3 items-center">
          {isAdmin && (
            <button onClick={() => setShowAdminMenu(true)} className="bg-yellow-500 text-black px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-black hover:bg-yellow-400 transition shadow-[0_0_10px_rgba(234,179,8,0.3)]">
              <ShieldCheck size={14} /> ADMIN
            </button>
          )}

          {session ? (
            <button onClick={() => supabase.auth.signOut()} className="bg-gray-900 border border-gray-800 text-gray-400 p-2.5 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
              <LogOut size={20}/>
            </button>
          ) : (
            <button onClick={() => setShowAuth(!showAuth)} className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
              <User size={20}/>
            </button>
          )}
        </div>
      </nav>

      {/* Admin Panel Modal */}
      {showAdminMenu && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-yellow-500/30 rounded-3xl w-full max-w-md p-8 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-yellow-500 flex items-center gap-3 italic">
                <ShieldCheck size={32} /> SYSTEM ADMIN
              </h2>
              <button onClick={() => setShowAdminMenu(false)} className="bg-gray-800 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Total Registered Users</p>
                  <p className="text-4xl font-black mt-1">{userCount}</p>
                </div>
                <Users size={40} className="text-blue-500 opacity-20" />
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1600px] mx-auto pb-20">
        {showAuth && !session ? <Auth /> : (
          <>
            {/* Hero Section (Only shows when no results) */}
            {results.length === 0 && !loading && (
              <div className="relative w-full h-[60vh] md:h-[75vh] flex items-end p-6 md:p-16 overflow-hidden animate-in fade-in zoom-in duration-700">
                <div className="absolute inset-0 z-0">
                  <img src="https://images.alphacoders.com/132/1322479.png" alt="Hero" className="w-full h-full object-cover opacity-40" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/60 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14] via-transparent to-transparent"></div>
                </div>
                
                <div className="relative z-10 max-w-2xl mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-600 text-[10px] font-black px-2 py-1 rounded text-white uppercase tracking-tighter">New Series</span>
                    <span className="flex items-center gap-1 text-yellow-500 text-xs font-bold"><Star size={14} fill="currentColor"/> 9.8 Rating</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black text-white leading-none mb-6 italic tracking-tighter">JUJUTSU <br/><span className="text-blue-500">KAISEN</span></h2>
                  <p className="text-gray-400 text-lg mb-8 line-clamp-3 font-medium">Step into a world where cursed energy thrives. Experience the journey of Yuji Itadori as he navigates the dangerous path of a Jujutsu Sorcerer.</p>
                  <div className="flex gap-4">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all transform hover:scale-105 shadow-xl shadow-blue-600/30">
                      <Play fill="currentColor" size={20}/> WATCH NOW
                    </button>
                    <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all">
                      <Info size={20}/> DETAILS
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Tab Bar */}
            <div className="lg:hidden flex justify-center p-6">
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-1.5 flex w-full max-w-sm shadow-xl">
                    <button onClick={() => setMode('anime')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${mode === 'anime' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}>ANIME</button>
                    <button onClick={() => setMode('manga')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${mode === 'manga' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}>MANGA</button>
                </div>
            </div>

            {/* Search Results Grid */}
            <div className="px-6">
              {results.length > 0 && (
                <h2 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-[0.2em] text-gray-500">
                  Found <span className="text-white">{results.length}</span> {mode} Results
                </h2>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
                {results.map((item) => (
                  <Link to={`/watch/${item.id}`} key={item.id} className="group block relative">
                    <div className="relative overflow-hidden rounded-[2rem] aspect-[3/4.2] bg-gray-900 border border-gray-800 transition-all duration-500 group-hover:border-blue-600/50 group-hover:shadow-[0_20px_50px_rgba(37,99,235,0.2)]">
                      <img src={item.image} alt="poster" className="object-cover w-full h-full group-hover:scale-110 transition duration-700 opacity-80 group-hover:opacity-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-transparent to-transparent opacity-60"></div>
                      <div className="absolute bottom-4 left-0 right-0 px-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 w-full py-3 rounded-2xl text-[10px] font-black text-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          {mode === 'anime' ? 'START STREAMING' : 'READ CHAPTERS'}
                        </div>
                      </div>
                    </div>
                    <h3 className="mt-4 text-sm font-bold line-clamp-1 group-hover:text-blue-500 transition-colors px-2">
                      {item.title.english || item.title.romaji}
                    </h3>
                    <p className="px-2 text-[10px] font-black text-gray-600 uppercase mt-1 tracking-widest">{item.releaseDate || 'Ongoing'}</p>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;