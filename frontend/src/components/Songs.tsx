import { useState, useEffect, useRef } from 'react';
import { publicAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { FaPlay, FaPause, FaMusic, FaClock, FaMicrophone } from 'react-icons/fa';
import './Songs.css';

interface Song {
  _id: string;
  key: string;
  title: string;
  description: string;
  artist: string;
  audioUrl: string;
  duration: number;
  formattedDuration: string;
  coverImage?: {
    url: string;
  };
  genre: string;
  metadata: {
    playCount: number;
    order: number;
  };
}

const Songs = () => {
  const { language } = useLanguage();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchSong();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const fetchSong = async () => {
    try {
      const response = await publicAPI.getSongs(language);
      console.log('Songs API response:', response.data);
      const songsData = response.data.data.songs || [];
      console.log('Songs data:', songsData);
      // Get only the first song
      setSong(songsData.length > 0 ? songsData[0] : null);
    } catch (error) {
      console.error('Failed to fetch song:', error);
      setSong(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    
    if (!audio || !song) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        // Increment play count
        await publicAPI.incrementSongPlay(song._id);
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value;
      setCurrentTime(value);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <section className="songs-section">
        <div className="container">
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading song...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="songs-section">
      <div className="songs-bg-effect"></div>
      
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <div className="section-tag">MUSIC LIBRARY</div>
          <h2 className="section-title">
            Original <span className="text-glow-purple">Songs</span>
          </h2>
          <div className="title-underline"></div>
          <p className="section-subtitle">
            Listen to our completely original pop song
          </p>
        </div>

        {song ? (
          <div className="song-single-wrapper" data-aos="fade-up" data-aos-delay="200">
            {/* Hidden audio element */}
            <audio
              ref={audioRef}
              src={song.audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onLoadedMetadata={() => {
                if (audioRef.current) {
                  setDuration(audioRef.current.duration);
                }
              }}
              preload="metadata"
              crossOrigin="anonymous"
            />
          
            <div className="song-card">
              {/* Cover Image */}
              <div className="song-cover">
                {song.coverImage?.url ? (
                  <img src={song.coverImage.url} alt={song.title} />
                ) : (
                  <div className="default-cover">
                    <FaMusic />
                  </div>
                )}
                <div className="cover-overlay">
                  <button
                    className={`play-button ${isPlaying ? 'playing' : ''}`}
                    onClick={handlePlayPause}
                  >
                    <span className="play-icon-inner">
                      {isPlaying ? <FaPause /> : <FaPlay />}
                    </span>
                  </button>
                </div>
                
                {song.genre && (
                  <div className="song-badge">{song.genre}</div>
                )}
              </div>

              {/* Song Info */}
              <div className="song-info">
                <h3 className="song-title">{song.title}</h3>
                
                {song.artist && (
                  <div className="song-artist">
                    <FaMicrophone />
                    <span>{song.artist}</span>
                  </div>
                )}

                {song.description && (
                  <p className="song-description">{song.description}</p>
                )}

                <div className="song-meta">
                  <span className="song-duration">
                    <FaClock />
                    {song.formattedDuration}
                  </span>
                  {song.metadata.playCount > 0 && (
                    <span className="play-count">
                      {song.metadata.playCount} plays
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                {isPlaying && (
                  <div className="song-progress">
                    <div className="progress-time">{formatTime(currentTime)}</div>
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="progress-bar"
                    />
                    <div className="progress-time">{formatTime(duration)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="no-songs-message" data-aos="fade-up">
            <FaMusic size={48} />
            <p>Song coming soon! Stay tuned for our amazing music.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Songs;
