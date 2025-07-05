import React, { useState, useRef, useEffect, useCallback } from 'react';

const YOUTUBE_SEARCH_API = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed/';
// IMPORTANT: Set your API key in a .env file as REACT_APP_YOUTUBE_API_KEY
const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const LOCAL_KEY = 'learning_youtube_state';
const HOURS_KEY = 'learning_hours_watched';
const getToday = () => new Date().toISOString().slice(0, 10);

function getTodayHours() {
  const stored = localStorage.getItem(HOURS_KEY);
  if (!stored) return 0;
  try {
    const parsed = JSON.parse(stored);
    if (parsed.date === getToday()) return parsed.hours || 0;
    return 0;
  } catch {
    return 0;
  }
}

function setTodayHours(hours: number) {
  localStorage.setItem(HOURS_KEY, JSON.stringify({ date: getToday(), hours }));
}

const PLACEHOLDER_AVATAR = 'https://www.gstatic.com/youtube/img/originals/promo/ytr-logo-for-search_96x96.png';

const Learning: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);
  const playerRef = useRef<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [lastTrackedTime, setLastTrackedTime] = useState(0);
  const [channelAvatars, setChannelAvatars] = useState<{ [key: string]: string }>({});

  // Load state from localStorage on mount (only once)
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setQuery(parsed.query || '');
        setResults(parsed.results || []);
        setSelectedVideo(parsed.selectedVideo || null);
        setNextPageToken(parsed.nextPageToken || null);
        setHasMore(parsed.hasMore || false);
      } catch {}
    }
    setLoadedFromStorage(true);
  }, []);

  // Save state to localStorage only after initial load
  useEffect(() => {
    if (!loadedFromStorage) return;
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({
        query,
        results,
        selectedVideo,
        nextPageToken,
        hasMore,
      })
    );
  }, [query, results, selectedVideo, nextPageToken, hasMore, loadedFromStorage]);

  // --- YouTube IFrame API watch time tracking ---
  // interval ref for cleanup
  const intervalRef = useRef<any>(null);

  // Player state change handler
  const onPlayerStateChange = useCallback((event: any) => {
    if (event.data === 1) { // playing
      trackTime();
    } else if (event.data === 2 || event.data === 0) { // paused or ended
      stopTracking();
    }
  }, [lastTrackedTime]);

  // Track time function
  const trackTime = useCallback(() => {
    stopTracking();
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const delta = current - lastTrackedTime;
        if (delta > 0 && delta < 10) { // avoid big jumps
          let hours = getTodayHours();
          hours += delta / 3600;
          setTodayHours(hours);
        }
        setLastTrackedTime(current);
      }
    }, 5000);
  }, [lastTrackedTime]);

  // Stop tracking function
  const stopTracking = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  // Create player function for YouTube IFrame API
  const createPlayer = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.destroy();
    }
    playerRef.current = new (window as any).YT.Player('learning-yt-iframe', {
      videoId: selectedVideo, // Pass the selected video ID to the player
      events: {
        onReady: () => setPlayerReady(true),
        onStateChange: onPlayerStateChange,
      },
    });
  }, [onPlayerStateChange, selectedVideo]);

  // Load YouTube IFrame API and create player
  useEffect(() => {
    if (!selectedVideo) return;
    // If API already loaded, skip
    if ((window as any).YT && (window as any).YT.Player) {
      createPlayer();
    } else {
      // Load script
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = createPlayer;
    }
    return () => {
      stopTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVideo, createPlayer, stopTracking]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastVideoRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          fetchVideos(query, nextPageToken);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, nextPageToken, query]
  );

  const fetchVideos = async (search: string, pageToken: string | null = null, isNewSearch = false) => {
    if (!API_KEY) {
      setError('YouTube API key is not set. Please set REACT_APP_YOUTUBE_API_KEY in your .env file.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const url = `${YOUTUBE_SEARCH_API}?part=snippet&type=video&maxResults=12&q=${encodeURIComponent(
        search
      )}&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch videos');
      const data = await res.json();
      setResults(prev =>
        isNewSearch ? data.items || [] : [...prev, ...(data.items || [])]
      );
      setNextPageToken(data.nextPageToken || null);
      setHasMore(!!data.nextPageToken);
    } catch (err: any) {
      setError('Could not fetch videos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setSelectedVideo(null);
    setResults([]);
    setNextPageToken(null);
    setHasMore(false);
    fetchVideos(query, null, true);
  };

  // Helper to format published date
  function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const intervals: [number, string][] = [
      [31536000, 'year'],
      [2592000, 'month'],
      [604800, 'week'],
      [86400, 'day'],
      [3600, 'hour'],
      [60, 'minute'],
      [1, 'second'],
    ];
    for (const [secs, label] of intervals) {
      const interval = Math.floor(seconds / secs);
      if (interval >= 1) {
        return `${interval} ${label}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  }

  // Helper to fetch channel avatar
  const fetchChannelAvatar = async (channelId: string) => {
    if (!API_KEY || channelAvatars[channelId]) return;
    try {
      const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const avatarUrl = data.items?.[0]?.snippet?.thumbnails?.default?.url;
      if (avatarUrl) {
        setChannelAvatars(prev => ({ ...prev, [channelId]: avatarUrl }));
      }
    } catch {}
  };

  // Fetch channel avatars for all results
  useEffect(() => {
    results.forEach((item: any) => {
      const channelId = item.snippet.channelId;
      if (channelId && !channelAvatars[channelId]) {
        fetchChannelAvatar(channelId);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  return (
    <div className="learning-page" style={{ maxWidth: 1100, margin: '20px auto', background: '#1c1c27', borderRadius: 16, boxShadow: '0 2px 16px #181818', padding: 32, color: '#fff' }}>
      <h2 style={{ fontWeight: 700, fontSize: 32, color: '#eebbc3', marginBottom: 8 }}>Learning Resources</h2>
      <p style={{ color: '#b8c1ec', marginBottom: 24 }}>Search for learning videos below:</p>
      <form onSubmit={handleSearch} style={{ display: 'flex', marginBottom: 32, background: '#232946', borderRadius: 8, padding: 8 }}>
        <input
          type="text"
          placeholder="Search learning videos..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 1, padding: 14, borderRadius: 8, border: '1.5px solid #b8c1ec', fontSize: 18, background: '#181818', color: '#fff', marginRight: 16 }}
        />
        <button
          type="submit"
          style={{ padding: '14px 36px', borderRadius: 8, background: '#eebbc3', color: '#232946', border: 'none', fontWeight: 700, fontSize: 18, letterSpacing: 1, boxShadow: '0 2px 8px #232946', transition: 'background 0.18s, color 0.18s' }}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      {selectedVideo && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ position: 'relative' }}>
            <div id="learning-yt-iframe" style={{ width: '100%', height: 480, borderRadius: 12, boxShadow: '0 2px 16px #e0e0e0', overflow: 'hidden' }}></div>
          </div>
        </div>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 32,
        marginTop: 8,
      }}>
        {results.map((item: any, idx: number) => {
          const { videoId } = item.id;
          const { title, channelTitle, publishedAt, thumbnails, channelId } = item.snippet;
          const channelAvatar = channelAvatars[channelId] || PLACEHOLDER_AVATAR;
          if (results.length === idx + 1) {
            // Last item: attach ref for infinite scroll
            return (
              <div
                ref={lastVideoRef}
                key={videoId}
                onClick={() => setSelectedVideo(videoId)}
                style={{
                  background: '#232946',
                  borderRadius: 12,
                  boxShadow: '0 2px 8px #181818',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  padding: 0,
                  border: '1.5px solid #232946',
                  overflow: 'hidden',
                  position: 'relative',
                  minHeight: 320,
                  display: 'flex',
                  flexDirection: 'column',
                  outline: 'none',
                  color: '#fff',
                }}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') setSelectedVideo(videoId); }}
              >
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
                  <img
                    src={thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url}
                    alt={title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                      transition: 'filter 0.2s',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    borderRadius: 6,
                    fontSize: 13,
                    padding: '2px 8px',
                    zIndex: 2,
                  }}>{timeAgo(publishedAt)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 16px 12px 16px', gap: 12 }}>
                  <img
                    src={channelAvatar}
                    alt={channelTitle}
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: '#eee', flexShrink: 0 }}
                    onError={e => (e.currentTarget.src = PLACEHOLDER_AVATAR)}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 18, color: '#fff', marginBottom: 2, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
                    <div style={{ color: '#666', fontSize: 15, fontWeight: 500, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{channelTitle}</div>
                  </div>
                </div>
                <div style={{ position: 'absolute', inset: 0, borderRadius: 12, transition: 'box-shadow 0.2s, background 0.2s', pointerEvents: 'none' }} className="yt-card-hover" />
              </div>
            );
          }
          // Not last item
          return (
            <div
              key={videoId}
              onClick={() => setSelectedVideo(videoId)}
              style={{
                background: '#232946',
                borderRadius: 12,
                boxShadow: '0 2px 8px #181818',
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                padding: 0,
                border: '1.5px solid #232946',
                overflow: 'hidden',
                position: 'relative',
                minHeight: 320,
                display: 'flex',
                flexDirection: 'column',
                outline: 'none',
                color: '#fff',
              }}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') setSelectedVideo(videoId); }}
            >
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
                <img
                  src={thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url}
                  alt={title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    transition: 'filter 0.2s',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  borderRadius: 6,
                  fontSize: 13,
                  padding: '2px 8px',
                  zIndex: 2,
                }}>{timeAgo(publishedAt)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 16px 12px 16px', gap: 12 }}>
                <img
                  src={channelAvatar}
                  alt={channelTitle}
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: '#eee', flexShrink: 0 }}
                  onError={e => (e.currentTarget.src = PLACEHOLDER_AVATAR)}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 18, color: '#fff', marginBottom: 2, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
                  <div style={{ color: '#666', fontSize: 15, fontWeight: 500, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{channelTitle}</div>
                </div>
              </div>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 12, transition: 'box-shadow 0.2s, background 0.2s', pointerEvents: 'none' }} className="yt-card-hover" />
            </div>
          );
        })}
      </div>
      {loading && <div style={{ textAlign: 'center', margin: 32, color: '#888', fontSize: 18 }}>Loading more videos...</div>}
      <style>{`
        .yt-card-hover:hover {
          box-shadow: 0 4px 24px #bbb;
          background: rgba(0,0,0,0.03);
        }
        .yt-card-hover:focus {
          box-shadow: 0 0 0 3px #FF0000;
        }
      `}</style>
    </div>
  );
};

export default Learning; 