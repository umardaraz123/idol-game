import { useState, useRef, useEffect } from 'react';
import { publicAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useSongs } from '../context/ContentContext';
import { FaPlay, FaPause, FaMusic, FaClock, FaMicrophone } from 'react-icons/fa';
import './Songs.css';

// Translations for the Songs section
const songsTranslations: Record<string, { title: string; titleHighlight: string; subtitle: string }> = {
  en: {
    title: 'Original',
    titleHighlight: 'Songs',
    subtitle: 'Listen to an example of our original pop songs!'
  },
  hi: {
    title: 'मौलिक',
    titleHighlight: 'गाने',
    subtitle: 'हमारे मौलिक पॉप गानों का एक उदाहरण सुनें!'
  },
  ru: {
    title: 'Оригинальные',
    titleHighlight: 'Песни',
    subtitle: 'Послушайте пример наших оригинальных поп-песен!'
  },
  ko: {
    title: '오리지널',
    titleHighlight: '노래',
    subtitle: '우리의 오리지널 팝송 예시를 들어보세요!'
  },
  zh: {
    title: '原创',
    titleHighlight: '歌曲',
    subtitle: '聆听我们原创流行歌曲的示例！'
  },
  ja: {
    title: 'オリジナル',
    titleHighlight: 'ソング',
    subtitle: 'オリジナルポップソングの例をお聴きください！'
  },
  es: {
    title: 'Canciones',
    titleHighlight: 'Originales',
    subtitle: '¡Escucha un ejemplo de nuestras canciones pop originales!'
  }
};

const Songs = () => {
  const { language } = useLanguage();
  const { songs: allSongs, isLoading: loading } = useSongs();
  const song = allSongs.length > 0 ? allSongs[0] : null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Track if song was playing before language change
  const wasPlayingRef = useRef(false);
  const previousSongIdRef = useRef<string | null>(null);
  const previousLanguageRef = useRef(language);

  // Handle song change when language changes - autoplay if previous song was playing
  useEffect(() => {
    const audio = audioRef.current;

    // Check if language actually changed
    if (previousLanguageRef.current !== language) {
      // Store current playing state before song changes
      wasPlayingRef.current = isPlaying;
      previousLanguageRef.current = language;

      // Pause current audio if playing
      if (audio && isPlaying) {
        audio.pause();
      }

      // Reset playback state for new song
      setCurrentTime(0);
      setDuration(0);
    }
  }, [language, isPlaying]);

  // Effect to handle autoplay when song data changes after language switch
  useEffect(() => {
    const audio = audioRef.current;

    if (!song || !audio) return;

    // Check if this is a new song (language switch caused song change)
    if (previousSongIdRef.current !== null && previousSongIdRef.current !== song._id) {
      // Song has changed - if we were playing before, autoplay the new song
      if (wasPlayingRef.current) {
        // Load and play the new song
        audio.load();
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              // Increment play count for new song
              publicAPI.incrementSongPlay(song._id).catch(console.error);
            })
            .catch((error) => {
              console.error('Autoplay failed:', error);
              setIsPlaying(false);
            });
        }

        // Reset the flag
        wasPlayingRef.current = false;
      }
    }

    // Update the previous song ID
    previousSongIdRef.current = song._id;
  }, [song]);

  // Get translations for current language
  const t = songsTranslations[language] || songsTranslations.en;

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
          {/* <div className="section-tag">MUSIC LIBRARY</div> */}
          <h2 className="section-title">
            {t.title} <span className="text-glow-purple">{t.titleHighlight}</span>
          </h2>
          <div className="title-underline"></div>
          <p className="section-subtitle">
            {t.subtitle}
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

                {/* Language Badge */}
                <div className="song-badge">
                  {t.title === 'Original' ? '🇬🇧 English' :
                    language === 'hi' ? '🇮🇳 हिन्दी' :
                      language === 'ru' ? '🇷🇺 Русский' :
                        language === 'ko' ? '🇰🇷 한국어' :
                          language === 'zh' ? '🇨🇳 中文' :
                            language === 'ja' ? '🇯🇵 日本語' :
                              language === 'es' ? '🇪🇸 Español' : song.genre}
                </div>
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
