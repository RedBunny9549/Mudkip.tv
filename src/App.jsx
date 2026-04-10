import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Play, BookOpen, User, Loader2, LogOut, ShieldCheck, X, Users, Star, BookMarked, History, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Auth from './Auth';

const colors = {
  bgDeep: '#060d17',      // Darker Navy
  bgCard: '#0f1c2e',      // Mudkip Blue
  accent: '#3a86ff',      // Fin Blue
  secondary: '#fb8500',   // Gill Orange
  text: '#e0e1dd'
};

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

  const [recent, setRecent] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  const MUDKIP_AVATAR = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/258.png";
  const MUDKIP_BG = "https://images5.alphacoders.com/606/606411.jpg";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkAdmin(session.user.id);
        fetchNestData(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkAdmin(session.user.id);
        fetchNestData(session.user.id);
        setShowAuth(false);
      } else {
        setIsAdmin(false);
        setRecent([]);
        setBookmarks([]);
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

  const fetchNestData = async (userId) => {
    const { data: historyData } = await supabase.from('watch_history').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(4);
    setRecent(historyData || []);
    const { data: bookmarkData } = await supabase.from('bookmarks').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(4);
    setBookmarks(bookmarkData || []);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const endpoint = `https://api-consumet-org-five.vercel.app/meta/anilist/${query}`;
      const { data } = await axios.get(endpoint);
      const filtered = data.results.filter(item => mode === 'anime' ? (item.type === 'ANIME' || item.type === 'TV') : item.type === 'MANGA');
      setResults(filtered || data.results);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-gray-100 font-sans selection:bg-accent overflow-x-hidden relative">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10 grayscale hover:grayscale-0 transition-all duration-1000" style={{ backgroundImage: `url(${MUDKIP_BG})` }} />
      <div className="fixed inset-0 z-0" style={{ backgroundColor: colors.bgDeep, opacity: 0.92 }} />

      {/* Navbar */}
      <nav className="p-5 border-b border-white/5 flex justify-between items-center sticky top-0 z-[60] backdrop-blur-2xl" style={{ backgroundColor: `${colors.bgDeep}cc` }}>
        <div className="flex items-center gap-10">
          <Link to="/" onClick={() => setResults([])} className="flex items-center gap-3 group">
            <img src={MUDKIP_AVATAR} alt="logo" className="w-10 h-10 group-hover:scale-125 transition-transform" />
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">MUDKIP<span style={{ color: colors.accent }}>.TV</span></h1>
          </Link>

          <div className="flex bg-white/5 rounded-2xl p-1 border border-white/5 shadow-inner">
            <button onClick={() => setMode('anime')} className={`px-8 py-2 rounded-xl text-xs font-black transition-all ${mode === 'anime' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-gray-500 hover:text-white'}`}>ANIME</button>
            <button onClick={() => setMode('manga')} className={`px-8 py-2 rounded-xl text-xs font-black transition-all ${mode === 'manga' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-gray-500 hover:text-white'}`}>MANGA</button>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-10 relative group">
          <input 
            type="text" 
            placeholder={`Search the ocean for ${mode}...`}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-12 focus:ring-2 focus:border-transparent outline-none text-sm transition-all placeholder:text-gray-600"
            style={{ '--tw-ring-color': colors.accent }}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-4 text-gray-600 group-focus-within:text-accent transition-colors" size={20} />
        </form>

        <div className="flex gap-4 items-center">
          {isAdmin && (
            <button onClick={() => setShowAdminMenu(true)} className="bg-orange-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black hover:scale-105 transition shadow-lg shadow-orange-500/20">
              <ShieldCheck size={16} /> ADMIN PANEL
            </button>
          )}
          {session ? (
            <button onClick={() => supabase.auth.signOut()} className="bg-white/5 border border-white/10 text-gray-400 p-3 rounded-2xl hover:bg-red-500/20 hover:text-red-500 transition-all">
              <LogOut size={22}/>
            </button>
          ) : (
            <button onClick={() => setShowAuth(!showAuth)} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 text-xs">SIGN IN</button>
          )}
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto pb-32 px-10 relative z-10">
        {showAuth && !session ? <Auth /> : (
          <div className="mt-12 space-y-20">
            {results.length > 0 ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-4xl font-black mb-12 flex items-center gap-4 italic uppercase tracking-tighter">
                  <div className="w-2 h-10 bg-blue-600 rounded-full" /> Search Results
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-10">
                  {results.map((item) => (
                    <Link to={`/watch/${item.id}`} key={item.id} className="group block relative">
                      <div className="relative overflow-hidden rounded-[2.5rem] aspect-[3/4.5] border border-white/5 transition-all duration-500 group-hover:border-blue-500/50 shadow-2xl group-hover:-translate-y-3" style={{ backgroundColor: colors.bgCard }}>
                        <img src={item.image} alt="poster" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                           <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl scale-50 group-hover:scale-100 transition-transform"><Play fill="white" size={32} /></div>
                        </div>
                      </div>
                      <h3 className="mt-5 text-sm font-black line-clamp-1 group-hover:text-blue-400 transition-colors px-2">{item.title.english || item.title.romaji}</h3>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Account Section - The Nest */}
                <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-12 rounded-[3.5rem] backdrop-blur-md">
                   <div className="flex items-center gap-10">
                      <div className="relative">
                        <img src={MUDKIP_AVATAR} alt="Avatar" className="w-32 h-32 rounded-[2.5rem] bg-blue-600/20 p-4 border border-blue-500/20 shadow-2xl shadow-blue-600/10" />
                        <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl border-4 border-[#060d17]"><Star size={16} fill="white" /></div>
                      </div>
                      <div>
                        <p className="text-blue-500 font-black text-xs uppercase tracking-[0.3em] mb-2">Authenticated Mudkip</p>
                        <h2 className="text-6xl font-black tracking-tighter text-white italic">{session?.user?.email.split('@')[0] || 'Trainer'}</h2>
                        <div className="flex gap-4 mt-6">
                           <div className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black text-gray-400 border border-white/5 uppercase">Lv. 100 Streaming</div>
                           <div className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-black text-gray-400 border border-white/5 uppercase">Master Rank Reader</div>
                        </div>
                      </div>
                   </div>
                   <div className="hidden xl:flex gap-10">
                      <div className="text-center">
                        <p className="text-3xl font-black text-white">{recent.length}</p>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Watched</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-black text-white">{bookmarks.length}</p>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Saved</p>
                      </div>
                   </div>
                </div>

                {/* Account Titles - The 3 Main Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                   {/* 1. Recent Activity */}
                   <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem]">
                      <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase italic text-blue-500"><History /> Recent Watch</h3>
                      <div className="space-y-4">
                        {recent.length > 0 ? recent.map(r => (
                          <Link key={r.id} className="flex items-center gap-4 group p-2 hover:bg-white/5 rounded-2xl transition">
                            <img src={r.image_url} className="w-12 h-16 rounded-lg object-cover" />
                            <div><p className="text-sm font-black text-white line-clamp-1">{r.title}</p><p className="text-[10px] text-gray-600 font-bold uppercase mt-1">EP {r.episode_number}</p></div>
                          </Link>
                        )) : <p className="text-gray-700 text-sm font-bold p-10 text-center">No recent history.</p>}
                      </div>
                   </div>

                   {/* 2. Bookmarks */}
                   <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem]">
                      <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase italic text-orange-500"><BookMarked /> Bookmarks</h3>
                      <div className="space-y-4">
                        {bookmarks.length > 0 ? bookmarks.map(b => (
                          <Link key={b.id} className="flex items-center gap-4 group p-2 hover:bg-white/5 rounded-2xl transition">
                            <img src={b.image_url} className="w-12 h-16 rounded-lg object-cover" />
                            <div><p className="text-sm font-black text-white line-clamp-1">{b.title}</p><p className="text-[10px] text-gray-600 font-bold uppercase mt-1">{b.type}</p></div>
                          </Link>
                        )) : <p className="text-gray-700 text-sm font-bold p-10 text-center">Nothing saved yet.</p>}
                      </div>
                   </div>

                   {/* 3. Recommended / Top Titles */}
                   <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem]">
                      <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase italic text-yellow-500"><TrendingUp /> Top Titles</h3>
                      <div className="space-y-6">
                         <div className="flex items-center gap-4 bg-blue-600/10 p-4 rounded-3xl border border-blue-500/20">
                            <div className="text-2xl font-black text-blue-500">01</div>
                            <div className="font-black text-sm tracking-tight">One Piece</div>
                         </div>
                         <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                            <div className="text-2xl font-black text-gray-700">02</div>
                            <div className="font-black text-sm tracking-tight text-gray-400">Jujutsu Kaisen</div>
                         </div>
                         <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                            <div className="text-2xl font-black text-gray-700">03</div>
                            <div className="font-black text-sm tracking-tight text-gray-400">Naruto Shippuden</div>
                         </div>
                      </div>
                   </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;