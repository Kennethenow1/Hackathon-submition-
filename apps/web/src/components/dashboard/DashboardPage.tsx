import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllVideos, deleteVideo, type SavedVideo } from "../../lib/storage/savedVideosDb";
import { PaletteFab } from "../shared/PaletteFab";
import "../../styles/dashboard.css";

export function DashboardPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    try {
      const saved = await getAllVideos();
      setVideos(saved);
    } catch (err) {
      console.error("Failed to load videos:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      await deleteVideo(id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error("Failed to delete video:", err);
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <>
      <div className="shadow" aria-hidden="true" />
      <div className="dashboard">
        <header className="dashboard__header">
          <button
            type="button"
            className="dashboard__back"
            onClick={() => navigate("/")}
          >
            &larr; Back to home
          </button>
          <div className="dashboard__header-content">
            <p className="dashboard__eyebrow">Dashboard</p>
            <h1 className="dashboard__title">Saved videos</h1>
            <p className="dashboard__lede">
              Review and manage your generated promo videos.
            </p>
          </div>
        </header>

        <main className="dashboard__main">
          {loading ? (
            <div className="dashboard__loading">
              <p>Loading videos...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <h2 className="empty-state__title">No saved videos yet</h2>
              <p className="empty-state__desc">
                Create your first promo video and save it here to build your library.
              </p>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => navigate("/create")}
              >
                Create a video
              </button>
            </div>
          ) : (
            <div className="video-grid">
              {videos.map((video) => (
                <div key={video.id} className="video-card">
                  <div className="video-card__thumbnail">
                    {playingId === video.id ? (
                      <video
                        src={video.videoUrl}
                        controls
                        autoPlay
                        className="video-card__player"
                        onEnded={() => setPlayingId(null)}
                      />
                    ) : (
                      <>
                        {video.thumbnailUrl ? (
                          <img src={video.thumbnailUrl} alt="" />
                        ) : (
                          <div className="video-card__placeholder" />
                        )}
                        <button
                          type="button"
                          className="video-card__play-icon"
                          onClick={() => setPlayingId(video.id)}
                          aria-label={`Play ${video.title}`}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="6,4 20,12 6,20" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  <div className="video-card__info">
                    <h3 className="video-card__title">{video.title}</h3>
                    <p className="video-card__meta">
                      {formatDate(video.createdAt)}
                      {video.metadata?.brandName && ` • ${video.metadata.brandName}`}
                    </p>
                    <div className="video-card__actions">
                      <a
                        href={video.videoUrl}
                        download={`${video.title}.mp4`}
                        className="btn btn--secondary"
                      >
                        Download
                      </a>
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => handleDelete(video.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <PaletteFab />
    </>
  );
}
