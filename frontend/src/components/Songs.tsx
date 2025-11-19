import { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import { publicAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { FaPlay, FaPause, FaMusic, FaClock, FaMicrophone, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
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
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    fetchSongs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const fetchSongs = async () => {
    try {
      const response = await publicAPI.getSongs(language);
      console.log('Songs API response:', response.data);
      const songsData = response.data.data.songs || [];
      console.log('Songs data:', songsData);
      setSongs(songsData);
    } catch (error) {
      console.error('Failed to fetch songs:', error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = async (songId: string) => {
    const audio = audioRefs.current[songId];
    
    console.log('Play/Pause clicked for song:', songId);
    console.log('Audio element:', audio);
    console.log('Audio URL:', audio?.src);
    
    if (!audio) {
      console.error('Audio element not found for song:', songId);
      return;
    }

    // Pause all other songs
    Object.entries(audioRefs.current).forEach(([id, audioEl]) => {
      if (id !== songId && !audioEl.paused) {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
    });

    if (currentPlaying === songId) {
      // Pause current song
      audio.pause();
      setCurrentPlaying(null);
      setCurrentTime(0);
      setDuration(0);
    } else {
      // Reset time states for new song
      setCurrentTime(0);
      setDuration(audio.duration || 0);
      
      // Play new song
      try {
        console.log('Attempting to play audio...');
        audio.currentTime = 0; // Reset to beginning
        await audio.play();
        console.log('Audio playing successfully');
        setCurrentPlaying(songId);
        
        // Increment play count
        await publicAPI.incrementSongPlay(songId);
      } catch (error) {
        console.error('Error playing audio:', error);
        setCurrentPlaying(null);
      }
    }
  };

  const handleTimeUpdate = (songId: string) => {
    const audio = audioRefs.current[songId];
    if (audio && currentPlaying === songId) {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
    }
  };

  const handleEnded = (songId: string) => {
    if (currentPlaying === songId) {
      setCurrentPlaying(null);
      setCurrentTime(0);
    }
  };

  // Add effect to monitor playing state
  useEffect(() => {
    if (currentPlaying) {
      const audio = audioRefs.current[currentPlaying];
      if (audio) {
        const updateTime = () => {
          setCurrentTime(audio.currentTime);
          setDuration(audio.duration || 0);
        };
        
        const interval = setInterval(updateTime, 100);
        return () => clearInterval(interval);
      }
    }
  }, [currentPlaying]);

  const handleSeek = (songId: string, value: number) => {
    const audio = audioRefs.current[songId];
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
            <p>Loading songs...</p>
          </div>
        </div>
      </section>
    );
  }

  if (songs.length === 0) {
    return null; // Don't show section if no songs
  }

  // Custom arrow components
  const NextArrow = (props: any) => {
    const { onClick } = props;
    return (
      <button 
        className="slick-arrow slick-next" 
        onClick={onClick}
        disabled={currentPlaying !== null}
        style={{ opacity: currentPlaying !== null ? 0.3 : 1, cursor: currentPlaying !== null ? 'not-allowed' : 'pointer' }}
      >
        <FaChevronRight />
      </button>
    );
  };

  const PrevArrow = (props: any) => {
    const { onClick } = props;
    return (
      <button 
        className="slick-arrow slick-prev" 
        onClick={onClick}
        disabled={currentPlaying !== null}
        style={{ opacity: currentPlaying !== null ? 0.3 : 1, cursor: currentPlaying !== null ? 'not-allowed' : 'pointer' }}
      >
        <FaChevronLeft />
      </button>
    );
  };

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: songs.length > 1 && currentPlaying === null,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: currentPlaying === null,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    centerMode: false,
    swipe: currentPlaying === null,
    draggable: currentPlaying === null,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

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
            Listen to our collection of completely original pop songs
          </p>
        </div>

        <div className="songs-slider-wrapper" data-aos="fade-up" data-aos-delay="200">
          {/* Hidden audio elements outside slider */}
          <div style={{ display: 'none' }}>
            {songs.map((song) => (
              <audio
                key={song._id}
                ref={(el) => {
                  if (el) {
                    audioRefs.current[song._id] = el;
                    console.log('Audio ref registered:', song._id, el);
                  }
                }}
                src={song.audioUrl}
                onTimeUpdate={() => handleTimeUpdate(song._id)}
                onEnded={() => handleEnded(song._id)}
                onLoadedMetadata={() => {
                  const audio = audioRefs.current[song._id];
                  if (audio) {
                    setDuration(audio.duration);
                  }
                }}
                onError={(e) => {
                  console.error('Audio load error for song:', song.title, song.audioUrl, e);
                }}
                preload="metadata"
                crossOrigin="anonymous"
              />
            ))}
          </div>
          
          <Slider {...sliderSettings}>
            {songs.map((song) => (
              <div key={song._id} className="song-card-wrapper">
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
                    className={`play-button ${currentPlaying === song._id ? 'playing' : ''}`}
                    onClick={() => handlePlayPause(song._id)}
                  >
                    <span className="play-icon-inner">
                      {currentPlaying === song._id ? <FaPause /> : <FaPlay />}
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

                {/* Progress Bar (only for currently playing song) */}
                {currentPlaying === song._id && (
                  <div className="song-progress">
                    <div className="progress-time">{formatTime(currentTime)}</div>
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={(e) => handleSeek(song._id, parseFloat(e.target.value))}
                      className="progress-bar"
                    />
                    <div className="progress-time">{formatTime(duration)}</div>
                  </div>
                )}
              </div>

                  {/* Animated Border */}
                  <div className="song-border"></div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Music Notes Animation */}
        <div className="music-notes-container">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="music-note-float"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            >
              ♪
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Songs;
