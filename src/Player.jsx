import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Play, Loader2, AlertCircle, ChevronRight, RefreshCw, HardDrive } from 'lucide-react';

const colors = {
  bgDeep: '#060d17',
  accent: '#3a86ff'
};

// This is currently the most stable direct anime provider link
const ANIME_API = "https://consumet-api-one.vercel.app/anime/gogoanime";

function Player() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animeData, setAnimeData] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEp, setCurrentEp] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');

  const fetchInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Step 1: Get Info directly from Gogoanime (more stable for episodes)
      // We use the ID passed from search. 
      const { data } = await axios.get(`${ANIME_API}/info/${id}`);
      
      setAnimeData(data);
      setEpisodes(data.episodes || []);
      
      if (data.episodes && data.episodes.length > 0) {
        loadEpisode(data.episodes[0].id);
      } else {
        setError("Mudkip couldn't find episodes for this specific ID.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("The ocean is blocked! Try a different anime or refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInfo(); }, [id]);

  const loadEpisode = async (episodeId) => {
    try {
      setVideoUrl(''); 
      setCurrentEp(episodeId);
      
      // Step 2: Get the streaming link
      const { data } = await axios.get(`${ANIME_API}/watch/${episodeId}`);
      
      // Priority: 'default' -> 'backup' -> first available source
      const stream = data.sources.find(s => s.quality === 'default') || 
                     data.sources.find(s => s.quality === 'backup') || 
                     data.sources[0];
      
      setVideoUrl(stream?.url || `https://www.2embed.cc/embedanime/${id}`);
    } catch (err) {
      console.error("Stream Error", err);
      // Ultimate fallback
      setVideoUrl(`https://www.2embed.cc/embedanime/${id}`);
    }
  };

  return (
    <div className="min-h-screen text-white font-sans" style={{ backgroundColor: colors.bgDeep }}>
      <nav className="p-4 border-b border-white/5 flex items-center justify-between bg-[#060d17]/90 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition font-black text-[10px] uppercase tracking-widest">
          <ArrowLeft size={18} /> Back to Nest
        </Link>
        <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 truncate max-w-md italic">
          {animeData?.title || "Mudkip.TV Stream"}
        </h1>
        <div className="w-20" />
      </nav>

      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
            {videoUrl ? (
              <iframe 
                src={videoUrl} 
                className="w-full h-full" 
                allowFullScreen 
                title="Mudkip Player"
                frameBorder="0"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {error ? (
                   <button onClick={fetchInfo} className="bg-blue-600 px-6 py-2 rounded-xl font-black text-[10px] flex items-center gap-2">
                     <RefreshCw size={14} /> REFRESH SOURCES
                   </button>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="text-blue-500 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Syncing Mudkip Nodes...</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-8 p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02]">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">
                {animeData?.title || "Anime Title"}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-3xl">
                {animeData?.description || "Loading anime description..."}
            </p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 p-8 h-full max-h-[85vh] flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-gray-500 italic flex items-center gap-2 font-bold">
              <HardDrive size={14} className="text-blue-500" /> Episode List
            </h3>
            <div className="overflow-y-auto flex-1 space-y-3 pr-2 custom-scrollbar">
              {episodes.map((ep) => (
                <button 
                  key={ep.id} 
                  onClick={() => loadEpisode(ep.id)} 
                  className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                    currentEp === ep.id ? 'bg-blue-600 border-blue-500 shadow-lg' : 'bg-white/5 border-white/5 text-gray-600 hover:text-white hover:border-blue-500'
                  }`}
                >
                  Episode {ep.number}
                </button>
              ))}
              {episodes.length === 0 && !loading && (
                <div className="py-20 text-center opacity-30">
                  <p className="text-[10px] font-black uppercase tracking-widest">No Links Found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }` }} />
    </div>
  );
}

export default Player;