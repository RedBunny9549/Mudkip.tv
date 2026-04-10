import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Play, Loader2, AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';

const colors = {
  bgDeep: '#060d17',
  bgCard: '#0f1c2e',
  accent: '#3a86ff',
  orange: '#fb8500'
};

const BASE_URL = "https://api.consumet.org/meta/anilist";

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
      const { data } = await axios.get(`${BASE_URL}/info/${id}`);
      setAnimeData(data);
      setEpisodes(data.episodes || []);
      
      if (data.episodes && data.episodes.length > 0) {
        loadEpisode(data.episodes[0].id);
      } else {
        setError("No episodes found for this title.");
      }
    } catch (err) {
      console.error(err);
      setError("Mudkip server timed out. Try the retry button below!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, [id]);

  const loadEpisode = async (episodeId) => {
    try {
      setVideoUrl(''); 
      setCurrentEp(episodeId);
      const { data } = await axios.get(`https://api.consumet.org/anime/gogoanime/watch/${episodeId}`);
      const stream = data.sources.find(s => s.quality === 'default') || data.sources[0];
      setVideoUrl(stream?.url || data.headers?.Referer);
    } catch (err) {
      console.error("Stream Error", err);
      setVideoUrl(`https://www.2embed.cc/embedanime/${id}`);
    }
  };

  return (
    <div className="min-h-screen text-white font-sans" style={{ backgroundColor: colors.bgDeep }}>
      <nav className="p-4 border-b border-white/5 flex items-center justify-between bg-[#060d17]/90 sticky top-0 z-50 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition font-black text-xs uppercase tracking-widest">
          <ArrowLeft size={18} /> Back to Nest
        </Link>
        <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 truncate max-w-md">
          {animeData?.title?.english || "Streaming Now"}
        </h1>
        <div className="w-20" />
      </nav>

      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className="lg:col-span-3">
          <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5">
            {videoUrl ? (
              <iframe 
                src={videoUrl} 
                className="w-full h-full" 
                allowFullScreen 
                title="Mudkip Stream"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {error ? (
                  <div className="text-center px-6">
                    <AlertCircle size={48} className="text-red-500 mb-4 mx-auto" />
                    <p className="text-gray-400 font-bold mb-6">{error}</p>
                    <button onClick={fetchInfo} className="flex items-center gap-2 bg-blue-600 px-6 py-2 rounded-xl font-black text-xs hover:bg-blue-500 transition mx-auto">
                      <RefreshCw size={14} /> RETRY CONNECTION
                    </button>
                  </div>
                ) : (
                  <>
                    <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Diving for stream...</p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02]">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-white">
              {animeData?.title?.english || animeData?.title?.romaji}
            </h2>
            <div className="flex gap-4 mb-8">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider italic">
                {animeData?.status || 'Active'}
              </span>
              <span className="text-orange-500 px-3 py-1 rounded-lg text-[10px] font-black border border-orange-500/20 uppercase tracking-wider">
                {animeData?.releaseDate || '2026'}
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              {animeData?.description?.replace(/<[^>]*>/g, '') || "No description available."}
            </p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 p-8 h-full max-h-[80vh] flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-gray-500 italic">
              <Play className="text-blue-500" size={16} fill="currentColor" /> Episode List
            </h3>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar space-y-3 pr-2">
              {episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => loadEpisode(ep.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                    currentEp === ep.id 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20' 
                    : 'bg-white/5 border-white/5 text-gray-600 hover:text-white hover:border-blue-500/50'
                  }`}
                >
                  <span>Episode {ep.number}</span>
                  {currentEp === ep.id && <ChevronRight size={14} />}
                </button>
              ))}
              {episodes.length === 0 && !loading && (
                <p className="text-center text-gray-700 font-black text-[10px] uppercase tracking-widest mt-10">Empty Ocean</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3a86ff; }
      `}} />
    </div>
  );
}

export default Player;