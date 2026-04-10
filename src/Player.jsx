import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Play, Loader2, AlertCircle, ChevronRight, Zap } from 'lucide-react';
import { supabase } from './supabaseClient';

function Player() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [animeData, setAnimeData] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEp, setCurrentEp] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        // Using the Consumet Meta Anilist Info endpoint
        const { data } = await axios.get(`https://api.consumet.org/meta/anilist/info/${id}`);
        setAnimeData(data);
        setEpisodes(data.episodes || []);
        if (data.episodes?.length > 0) loadEpisode(data.episodes[0].id, data.episodes[0].number);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchInfo();
  }, [id]);

  const loadEpisode = async (episodeId, num) => {
    try {
      setVideoUrl(''); 
      setCurrentEp(episodeId);
      
      // Update Supabase Progress (inspired by Anikku's auto-sync)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('watch_history').upsert({
          user_id: user.id,
          media_id: id,
          title: animeData?.title?.english || id,
          image_url: animeData?.image,
          episode_number: num,
          type: 'anime',
          updated_at: new Date()
        });
      }

      const { data } = await axios.get(`https://api.consumet.org/meta/anilist/watch/${episodeId}`);
      const source = data.sources.find(s => s.quality === 'default') || data.sources[0];
      setVideoUrl(source.url);
    } catch (err) { 
        // Fallback to external embed if API fails
        setVideoUrl(`https://www.2embed.cc/embedanime/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#060d17] text-white font-sans">
      <nav className="p-4 border-b border-white/5 flex items-center justify-between bg-[#060d17]/90 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition font-black text-[10px] uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Nest
        </Link>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">{animeData?.title?.english || "Streaming"}</span>
        <div className="w-20" />
      </nav>

      <div className="max-w-[1700px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3">
          <div className="relative aspect-video bg-black rounded-[3rem] overflow-hidden shadow-2xl border border-white/5">
            {videoUrl ? (
              <iframe src={videoUrl} className="w-full h-full" allowFullScreen title="Mudkip Player" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest">Tapping Source...</p>
              </div>
            )}
          </div>
          
          <div className="mt-10 p-10 rounded-[3rem] border border-white/5 bg-white/[0.02]">
             <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4">{animeData?.title?.english}</h2>
             <div className="flex gap-4 mb-6">
                <span className="bg-blue-600 text-[10px] font-black px-4 py-1 rounded-lg italic">ANIME</span>
                <span className="bg-orange-500 text-[10px] font-black px-4 py-1 rounded-lg italic">{animeData?.releaseDate}</span>
             </div>
             <p className="text-gray-500 text-sm leading-relaxed max-w-3xl">{animeData?.description?.replace(/<[^>]*>/g, '')}</p>
          </div>
        </div>

        <div className="lg:col-span-1">
           <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 h-full max-h-[80vh] flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-gray-500 flex items-center gap-2 italic">
                <Zap size={14} className="text-blue-500" fill="currentColor" /> Episodes
              </h3>
              <div className="overflow-y-auto flex-1 space-y-3 pr-2 custom-scrollbar">
                 {episodes.map((ep) => (
                    <button 
                      key={ep.id} 
                      onClick={() => loadEpisode(ep.id, ep.number)}
                      className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${currentEp === ep.id ? 'bg-blue-600 border-blue-500 shadow-xl' : 'bg-white/5 border-white/5 text-gray-600 hover:text-white hover:border-blue-500'}`}
                    >
                      Episode {ep.number}
                    </button>
                 ))}
              </div>
           </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }` }} />
    </div>
  );
}

export default Player;