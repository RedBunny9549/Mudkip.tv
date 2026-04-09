import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Info, PlayCircle } from 'lucide-react';

function Player() {
  const { id } = useParams(); // This gets the anime ID from the URL
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStream = async () => {
      try {
        setLoading(true);
        // We fetch the info first to get the first episode ID
        const infoRes = await axios.get(`https://api-consumet-org-five.vercel.app/meta/anilist/info/${id}`);
        const firstEpId = infoRes.data.episodes[0].id;
        
        // Then we get the actual video link for that episode
        const watchRes = await axios.get(`https://api-consumet-org-five.vercel.app/anime/gogoanime/watch/${firstEpId}`);
        
        // We use the 'Referer' or the first M3U8 source
        setVideoUrl(watchRes.data.headers.Referer || watchRes.data.sources[0].url);
      } catch (err) {
        console.error("Stream Error:", err);
      } finally {
        setLoading(false);
      }
    };

    getStream();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white font-sans">
      {/* Top Bar */}
      <nav className="p-4 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-gray-800 rounded-full transition text-accent">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold truncate uppercase tracking-tighter">
          Now Playing: <span className="text-accent">{id.replace(/-/g, ' ')}</span>
        </h1>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Video Frame */}
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 animate-pulse">Summoning the stream...</p>
            </div>
          ) : (
            <iframe 
              src={videoUrl} 
              className="w-full h-full" 
              allowFullScreen 
              scrolling="no"
              title="Mudkip Player"
            />
          )}
        </div>

        {/* Info Area */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Info className="text-accent" /> About this Title
            </h2>
            <p className="text-gray-400 leading-relaxed">
              You are currently watching the first episode of {id}. We are working on adding an episode selector and a "Save to Watchlist" button using Supabase next!
            </p>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 text-center">
            <PlayCircle size={40} className="mx-auto text-accent mb-2" />
            <h3 className="font-bold">Next Episode</h3>
            <button className="mt-4 w-full bg-accent py-2 rounded-lg font-bold hover:bg-blue-600 transition opacity-50 cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Player;