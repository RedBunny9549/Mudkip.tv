import React, { useState, useEffect } from 'react';
import axios from 'axios';
<<<<<<< HEAD
import { Search, Play, BookOpen, User, LogOut, Loader2 } from 'lucide-react';
=======
import { Search, Play, BookOpen, User, Loader as Loader2, LogOut, ShieldCheck, X, Users, Star, BookMarked, History, TrendingUp } from 'lucide-react';
>>>>>>> 08e85babf28bd124342ac3f8f4e89b03d9a99aad
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
<<<<<<< HEAD
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
=======
          <div className="mt-12 space-y-20">
            {results.length > 0 ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-4xl font-black mb-12 flex items-center gap-4 italic uppercase tracking-tighter">
                  <div className="w-2 h-10 bg-blue-600 rounded-full" /> Search Results
                </h2>
                <div className="grid grid-cols-6 gap-10">
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
                   <div className="flex gap-10">
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
                <div className="grid grid-cols-3 gap-12">
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
>>>>>>> 08e85babf28bd124342ac3f8f4e89b03d9a99aad
        )}
      </main>
    </div>
  );
}

export default App;