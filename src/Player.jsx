import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Play, Loader2, AlertCircle, ChevronRight, RefreshCw, HardDrive } from 'lucide-react';

const colors = {
  bgDeep: '#060d17',
  accent: '#3a86ff'
};

const BASE_URL = "https://consumet-api-one.vercel.app/meta/anilist";

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
      
      // Step 1: Try getting info from Anilist Meta
      const { data } = await axios.get(`${BASE_URL}/info/${id}`);
      setAnimeData(data);
      
      let fetchedEpisodes = data.episodes || [];

      // Step 2: If Anilist has 0 episodes, do a "Deeper Dive" into Gogoanime directly
      if (fetchedEpisodes.length === 0) {
        console.log("Anilist empty, searching Gogoanime directly...");
        const searchTitle = data.title.english || data.title.romaji;
        const searchRes = await axios.get(`https://consumet-api-one.vercel.app/anime/gogoanime/${searchTitle}`);
        
        if (searchRes.data.results && searchRes.data.results.length > 0) {
          const gogoId = searchRes.data.results[0].id; // Get the most relevant Gogo ID
          const gogoInfo = await axios.get(`https://consumet-api-one.vercel.app/anime/gogoanime/info/${gogoId}`);
          fetchedEpisodes = gogoInfo.data.episodes || [];
        }
      }

      setEpisodes(fetchedEpisodes);
      
      if (fetchedEpisodes.length > 0) {
        loadEpisode(fetchedEpisodes[0].id);
      } else {
        setError("No episodes found. This title might not be released yet.");
      }
    } catch (err) {
      setError("Mudkip couldn't find the episode data. Try again!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInfo(); }, [id]);

  const loadEpisode = async (episodeId) => {
    try {
      setVideoUrl(''); 
      setCurrentEp(episodeId);
      // Try Anilist watch provider first, fallback to Gogo watch
      const { data } = await axios.get(`https://consumet-api-one.vercel.app/meta/anilist/watch/${episodeId}`)
        .catch(() => axios.get(`https://consumet-api-one.vercel.app/anime/gogoanime/watch/${episodeId}`));
      
      const stream = data.sources.find(s => s.quality === 'default') || data.sources[0];
      setVideoUrl(stream?.url || `https://www.2embed.cc/embedanime/${id}`);
    } catch (err) {
      setVideoUrl(`https://www.2embed.cc/embedanime/${id}`);
    }
  };

  return (
    <div className="min-h-screen text-white font-sans" style={{ backgroundColor: colors.bgDeep }}>
      <nav className="p-4 border-b border-white/5 flex items-center justify-between bg-[#060d17]/90 sticky top-0 z-50 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition font-black text-[10px] uppercase tracking-widest">
          <ArrowLeft size={18} /> Back to Nest
        </Link>
        <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 truncate max-w-md italic">
          {animeData?.title?.english || "Streaming"}
        </h1>
        <div className="w-20" />
      </nav>

      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 shadow-blue-500/5">
            {videoUrl ? (
              <iframe src={videoUrl} className="w-full h-full" allowFullScreen title="Mudkip Player" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {error ? (
                   <div className="text-center">
                     <AlertCircle size={40} className="text-red-500 mb-4 mx-auto" />
                     <button onClick={fetchInfo} className="bg-blue-600 px-6 py-2 rounded-xl font-black text-[10px]">RETRY SEARCH</button>
                   </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="text-blue-500 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Syncing with Gogoanime...</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mt-8 p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02]">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">{animeData?.title?.english || animeData?.title?.romaji}</h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-3xl">{animeData?.description?.replace(/<[^>]*>/g, '')}</p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 p-8 h-full max-h-[85vh] flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-gray-500 italic flex items-center gap-2">
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
                  <p className="text-[10px] font-black uppercase tracking-widest">No Sources Linked</p>
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