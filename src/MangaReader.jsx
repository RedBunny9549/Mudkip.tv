import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CircleAlert as AlertCircle, Loader as Loader2, ChevronUp, ChevronDown, LayoutGrid as Layout } from 'lucide-react';
import { supabase } from './supabaseClient';

function MangaReader() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [viewMode, setViewMode] = useState('webtoon');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    const getMangaInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        const infoRes = await axios.get(
          `https://api-consumet-org-five.vercel.app/meta/anilist/manga/${id}`
        );
        setTitle(infoRes.data.title.english || infoRes.data.title.romaji);

        if (!infoRes.data.chapters || infoRes.data.chapters.length === 0) {
          throw new Error("No chapters found for this manga.");
        }

        setChapters(infoRes.data.chapters);
        loadChapterPages(infoRes.data.chapters[0].id, 0);
      } catch (err) {
        console.error("Manga Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getMangaInfo();
  }, [id]);

  const loadChapterPages = async (chapterId, chapterIndex) => {
    try {
      setLoading(true);
      const pagesRes = await axios.get(
        `https://api-consumet-org-five.vercel.app/manga/mangadex/read/${chapterId}`
      );

      setPages(pagesRes.data.chapters || []);
      setCurrentChapterIndex(chapterIndex);
      setCurrentPage(1);

      if (session && chapters[chapterIndex]) {
        await supabase.from('watch_history').upsert(
          {
            user_id: session.user.id,
            manga_id: id,
            title: title,
            episode_id: chapterId,
            episode_number: chapters[chapterIndex].number,
            exact_timestamp: 1,
            media_type: 'manga',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,manga_id,episode_id' }
        );
      }
    } catch (err) {
      console.error("Failed to load chapter:", err);
      setError("Failed to load this chapter. Try another one.");
    } finally {
      setLoading(false);
    }
  };

  const handleChapterClick = (chapterId, index) => {
    loadChapterPages(chapterId, index);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < pages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousChapter = () => {
    if (currentChapterIndex > 0) {
      handleChapterClick(chapters[currentChapterIndex - 1].id, currentChapterIndex - 1);
    }
  };

  const goToNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      handleChapterClick(chapters[currentChapterIndex + 1].id, currentChapterIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white font-sans flex flex-col">
      <nav className="p-4 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-full transition" style={{ color: '#3a86ff' }}>
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold truncate uppercase tracking-tighter">
            {loading ? "Loading..." : "Reading:"}
            <span style={{ color: '#3a86ff' }} className="ml-2">
              {title || id}
            </span>
          </h1>
        </div>

        <button
          onClick={() => setViewMode(viewMode === 'webtoon' ? 'page-turn' : 'webtoon')}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
          title="Toggle view mode"
        >
          <Layout size={20} />
          <span className="text-xs font-bold">{viewMode === 'webtoon' ? 'WEBTOON' : 'PAGE-TURN'}</span>
        </button>
      </nav>

      <main className="flex-1 flex p-8 gap-8">
        {/* Main Reading Area */}
        <div className="flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: '#3a86ff' }} />
              <p className="text-gray-500">Loading manga...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h3 className="text-xl font-bold">Error</h3>
              <p className="text-gray-400 mt-2 max-w-md">{error}</p>
            </div>
          ) : viewMode === 'webtoon' ? (
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {pages.length > 0 ? (
                  pages.map((page, idx) => (
                    <div key={idx} className="bg-gray-900 rounded-lg overflow-hidden">
                      <img
                        src={page}
                        alt={`Page ${idx + 1}`}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">No pages available</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex gap-4 justify-center items-center bg-gray-900/30 rounded-lg overflow-hidden">
                {pages[currentPage - 2] && (
                  <img
                    src={pages[currentPage - 2]}
                    alt={`Page ${currentPage - 1}`}
                    className="h-full w-1/2 object-contain"
                  />
                )}
                {pages[currentPage - 1] && (
                  <img
                    src={pages[currentPage - 1]}
                    alt={`Page ${currentPage}`}
                    className="h-full w-1/2 object-contain"
                  />
                )}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={goToPreviousChapter}
                  disabled={currentChapterIndex === 0}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg transition font-bold"
                >
                  Previous Chapter
                </button>

                <div className="text-center">
                  <p className="text-sm font-bold">
                    Page {Math.max(currentPage - 1, 1)}-{currentPage} of {pages.length}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Chapter {chapters[currentChapterIndex]?.number || 1}
                  </p>
                </div>

                <button
                  onClick={goToNextChapter}
                  disabled={currentChapterIndex === chapters.length - 1}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg transition font-bold"
                >
                  Next Chapter
                </button>
              </div>

              <div className="mt-6 flex gap-4 justify-center">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage <= 1}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition"
                >
                  Previous Page
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage >= pages.length}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition"
                >
                  Next Page
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chapter Selector Drawer */}
        <div className="w-96 bg-gray-900/50 border border-gray-800 rounded-2xl p-6 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold uppercase">Chapters</h3>
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="p-2 hover:bg-gray-800 rounded transition"
            >
              {isDrawerOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          {isDrawerOpen && (
            <div className="flex-1 overflow-y-auto space-y-3">
              {chapters.length > 0 ? (
                chapters.map((chapter, idx) => (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterClick(chapter.id, idx)}
                    className={`w-full text-left p-4 rounded-xl transition border-2 ${
                      currentChapterIndex === idx
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-700 bg-gray-800/30 hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="font-bold text-sm">Chapter {chapter.number}</div>
                    <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {chapter.title || 'No title'}
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No chapters available</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MangaReader;
