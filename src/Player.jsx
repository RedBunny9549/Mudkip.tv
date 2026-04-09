import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Info, AlertCircle, Loader2 } from 'lucide-react';

function Player() {
  const { id } = useParams(); 
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const getStream = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Get Anime Info
        const infoRes = await axios.get(`https://api-consumet-org-five.vercel.app/meta/anilist/info/${id}`);
        setTitle(infoRes.data.title.english || infoRes.data.title.romaji);
        
        if (!infoRes.data.episodes || infoRes.data.episodes.length === 0) {
            throw new Error("No episodes found for this title.");
        }

        const firstEpId = infoRes.data.episodes[0].id;
        
        // 2. Get Video Link
        const watchRes = await axios.get(`https://api-consumet-org-five.vercel.app/anime/gogoanime/watch/${firstEpId}`);
        
        // Use the best available source
        const stream = watchRes.data.headers?.Referer || watchRes.data.sources[0]?.url;
        
        if (!stream) throw new Error("Could not find a working stream.");
        
        setVideoUrl(stream);
      } catch (err) {
        console.error("Stream Error:", err);
        setError(err.response?.status === 504 ? "The server is overloaded (504). Try refreshing in a few seconds!" : err.message);
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
          {loading ? "Loading..." : `Watching: `}
          <span className="text-accent">{title || id}</span>
        </h1>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Video Frame */}
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
              <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
              <p className="text-gray-500 animate-pulse">Summoning the stream...</p>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h3 className="text-xl font-bold">Oops! Something went wrong</h3>
              <p className="text-gray-400 mt-2 max-w-md">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 bg-accent px-6 py-2 rounded-full font-bold hover:scale-105 transition"
              >
                Try Again
              </button>
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
        <div className="mt-8 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Info className="text-accent" /> About this Title
            </h2>
            <p className="text-gray-400 leading-relaxed">
              ID: {id} <br />
              You're watching the first episode. We'll be setting up the 
              <strong> Supabase Database</strong> next so you can save your progress and 
              actually have a "Continue Watching" list!
            </p>
        </div>
      </main>
    </div>
  );
}

export default Player;