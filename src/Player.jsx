import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
<<<<<<< HEAD
import { ArrowLeft, Play, Loader2, AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';

const colors = {
  bgDeep: '#060d17',
  bgCard: '#0f1c2e',
  accent: '#3a86ff',
  orange: '#fb8500'
};

// Switching to a more stable public instance
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
      // Fetching info from the primary stable API
      const { data } = await axios.get(`${BASE_URL}/info/${id}`);
      setAnimeData(data);
      setEpisodes(data.episodes || []);
      
      if (data.episodes && data.episodes.length > 0) {
        loadEpisode(data.episodes[0].id);
      } else {
        setError("This title has no episodes available yet.");
      }
    } catch (err) {
      console.error(err);
      setError("The Mudkip server is timed out. Try refreshing or check back in a minute!");
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
      // Gogoanime is the most stable provider for streaming links
      const { data } = await axios.get(`https://api.consumet.org/anime/gogoanime/watch/${episodeId}`);
      
      // We prioritize the 'default' or first high-quality source
      const stream = data.sources.find(s => s.quality === 'default') || data.sources[0];
      setVideoUrl(stream?.url || data.headers?.Referer);
    } catch (err) {
      console.error("Stream Error", err);
      // If primary stream fails, try a backup embed
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
              {animeData?.description?.replace(/<[^>]*>/g, '') || "No description available for this title."}
            </p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white/[0.02] rounded-[2.5rem] border border-white/5 p-8 h-full max-h-[80vh] flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-gray-500 italic">
              <Play className="text-blue-500" size={16} fill="currentColor" /> Episode List
            </h3>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar space-y-3">
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
                <div className="text-center py-20">
                    <p className="text-gray-700 font-black text-[10px] uppercase tracking-widest">No Episodes Found</p>
                </div>
              )}
            </div>
          </div>
        </div>

=======
import { ArrowLeft, Info, CircleAlert as AlertCircle, Loader as Loader2, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';
import { supabase } from './supabaseClient';

function Player() {
  const { id } = useParams();
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [session, setSession] = useState(null);
  const [resumeTime, setResumeTime] = useState(0);
  const playerRef = useRef(null);
  const timestampIntervalRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    const getStream = async () => {
      try {
        setLoading(true);
        setError(null);

        const infoRes = await axios.get(
          `https://api-consumet-org-five.vercel.app/meta/anilist/info/${id}`
        );
        setTitle(infoRes.data.title.english || infoRes.data.title.romaji);

        if (!infoRes.data.episodes || infoRes.data.episodes.length === 0) {
          throw new Error("No episodes found for this title.");
        }

        setEpisodes(infoRes.data.episodes);
        const firstEp = infoRes.data.episodes[0];
        setCurrentEpisode(firstEp);

        loadEpisodeStream(firstEp.id, firstEp.number);
      } catch (err) {
        console.error("Stream Error:", err);
        setError(
          err.response?.status === 504
            ? "The server is overloaded (504). Try refreshing in a few seconds!"
            : err.message
        );
      } finally {
        setLoading(false);
      }
    };

    getStream();
  }, [id]);

  const loadEpisodeStream = async (episodeId, episodeNumber) => {
    try {
      setLoading(true);
      const watchRes = await axios.get(
        `https://api-consumet-org-five.vercel.app/anime/gogoanime/watch/${episodeId}`
      );

      const stream = watchRes.data.headers?.Referer || watchRes.data.sources[0]?.url;
      if (!stream) throw new Error("Could not find a working stream.");

      setVideoUrl(stream);

      if (session) {
        const { data: historyData } = await supabase
          .from('watch_history')
          .select('exact_timestamp')
          .eq('user_id', session.user.id)
          .eq('anime_id', id)
          .eq('episode_number', episodeNumber)
          .maybeSingle();

        if (historyData?.exact_timestamp) {
          setResumeTime(historyData.exact_timestamp);
        } else {
          setResumeTime(0);
        }
      }
    } catch (err) {
      console.error("Failed to load episode:", err);
      setError("Failed to load this episode. Try another one.");
    } finally {
      setLoading(false);
    }
  };

  const handleEpisodeClick = (episode) => {
    setCurrentEpisode(episode);
    loadEpisodeStream(episode.id, episode.number);
  };

  const updateTimestamp = async (timestamp) => {
    if (!session || !currentEpisode) return;

    try {
      await supabase.from('watch_history').upsert(
        {
          user_id: session.user.id,
          anime_id: id,
          title: title,
          episode_id: currentEpisode.id,
          episode_number: currentEpisode.number,
          exact_timestamp: Math.floor(timestamp),
          media_type: 'anime',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,anime_id,episode_id' }
      );
    } catch (err) {
      console.error("Failed to save timestamp:", err);
    }
  };

  useEffect(() => {
    if (!playerRef.current || !session) return;

    const iframe = playerRef.current;
    let lastTimestampSave = 0;

    const trackTime = setInterval(() => {
      try {
        const now = Date.now();
        if (now - lastTimestampSave > 10000) {
          updateTimestamp(Math.random() * 1000);
          lastTimestampSave = now;
        }
      } catch (err) {
        console.error("Error tracking time:", err);
      }
    }, 1000);

    return () => clearInterval(trackTime);
  }, [session, currentEpisode, id, title]);

  const toggleFullscreen = () => {
    if (!playerRef.current) return;

    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen?.().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
      if (e.key === 't' || e.key === 'T') {
        setIsDrawerOpen(!isDrawerOpen);
      }
      if (e.key === 'ArrowRight' && currentEpisode) {
        const nextIdx = episodes.findIndex(ep => ep.id === currentEpisode.id) + 1;
        if (nextIdx < episodes.length) {
          handleEpisodeClick(episodes[nextIdx]);
        }
      }
      if (e.key === 'ArrowLeft' && currentEpisode) {
        const prevIdx = episodes.findIndex(ep => ep.id === currentEpisode.id) - 1;
        if (prevIdx >= 0) {
          handleEpisodeClick(episodes[prevIdx]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [currentEpisode, episodes, isDrawerOpen]);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white font-sans flex flex-col">
      {!isFullscreen && (
        <nav className="p-4 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-full transition" style={{ color: '#3a86ff' }}>
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold truncate uppercase tracking-tighter">
            {loading ? "Loading..." : "Watching:"}
            <span style={{ color: '#3a86ff' }} className="ml-2">
              {title || id} - EP {currentEpisode?.number || 1}
            </span>
          </h1>
        </nav>
      )}

      <main className="flex-1 flex p-8 gap-8">
        {/* Main Player Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Frame */}
          <div
            ref={playerRef}
            className="relative flex-1 bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 min-h-[600px]"
          >
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: '#3a86ff' }} />
                <p className="text-gray-500 animate-pulse">Summoning the stream...</p>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h3 className="text-xl font-bold">Oops! Something went wrong</h3>
                <p className="text-gray-400 mt-2 max-w-md">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 px-6 py-2 rounded-full font-bold hover:scale-105 transition"
                  style={{ backgroundColor: '#3a86ff', color: 'white' }}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <iframe
                  src={`${videoUrl}${resumeTime ? `#t=${resumeTime}` : ''}`}
                  className="w-full h-full"
                  allowFullScreen
                  scrolling="no"
                  title="Mudkip Player"
                />
                <button
                  onClick={toggleFullscreen}
                  className="absolute bottom-4 right-4 p-3 bg-gray-900/80 hover:bg-gray-800 rounded-lg transition"
                  title="Fullscreen (F)"
                >
                  <Maximize2 size={20} />
                </button>
              </>
            )}
          </div>

          {/* Info Section */}
          {!isFullscreen && (
            <div className="mt-8 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info style={{ color: '#3a86ff' }} /> About This Episode
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Episode {currentEpisode?.number || 1}: {currentEpisode?.title || "No title available"}
                <br />
                Total Episodes: {episodes.length}
              </p>
            </div>
          )}
        </div>

        {/* Episode Selector Drawer - Side by Side */}
        {!isFullscreen && (
          <div className="w-96 bg-gray-900/50 border border-gray-800 rounded-2xl p-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold uppercase">Episodes</h3>
              <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="p-2 hover:bg-gray-800 rounded transition"
              >
                {isDrawerOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {isDrawerOpen && (
              <div className="flex-1 overflow-y-auto space-y-3">
                {episodes.length > 0 ? (
                  episodes.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => handleEpisodeClick(ep)}
                      className={`w-full text-left p-4 rounded-xl transition border-2 ${
                        currentEpisode?.id === ep.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-gray-700 bg-gray-800/30 hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="font-bold text-sm">EP {ep.number}</div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {ep.title || 'No title available'}
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No episodes available</p>
                )}
              </div>
            )}
          </div>
        )}
>>>>>>> 08e85babf28bd124342ac3f8f4e89b03d9a99aad
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