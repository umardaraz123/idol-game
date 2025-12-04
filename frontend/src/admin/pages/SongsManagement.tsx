import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { songsAPI, mediaAPI } from '../../services/api';
import { Loader2, Music, Mic, Clock, Play, Edit, Upload } from 'lucide-react';
import './SongsManagement.css';

interface MultilingualText {
  en: string;
  hi: string;
  ru: string;
  ko: string;
  zh: string;
  ja: string;
  es: string;
}

interface Song {
  _id: string;
  key: string;
  title: MultilingualText;
  description?: MultilingualText;
  artist?: MultilingualText;
  audioUrl: string;
  cloudinaryId?: string;
  duration: number;
  coverImage?: {
    url: string;
    publicId: string;
  };
  genre: string;
  releaseYear?: number;
  metadata: {
    order: number;
    isActive: boolean;
    isFeatured: boolean;
    tags: string[];
    playCount: number;
  };
  lyrics?: MultilingualText;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ru', name: 'Russian' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'es', name: 'Spanish' },
];

const emptyFormData = {
  key: 'main_song',
  title: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
  description: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
  artist: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
  audioUrl: '',
  cloudinaryId: '',
  duration: 0,
  coverImage: { url: '', publicId: '' },
  genre: 'Pop',
  releaseYear: new Date().getFullYear(),
  metadata: {
    order: 0,
    isActive: true,
    isFeatured: true,
    tags: [] as string[],
    playCount: 0
  },
  lyrics: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' }
};

const SongsManagement = () => {
  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  // const [isUploadingCover, setIsUploadingCover] = useState(false); // commented - cover upload hidden
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    fetchSong();
  }, []);

  const fetchSong = async () => {
    try {
      const response = await songsAPI.getAll();
      const songs = response.data.data.songs || [];
      // Get the first (and only) song
      if (songs.length > 0) {
        const existingSong = songs[0];
        setSong(existingSong);
        setFormData({
          key: existingSong.key,
          title: existingSong.title,
          description: existingSong.description || { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
          artist: existingSong.artist || { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
          audioUrl: existingSong.audioUrl,
          cloudinaryId: existingSong.cloudinaryId || '',
          duration: existingSong.duration,
          coverImage: existingSong.coverImage || { url: '', publicId: '' },
          genre: existingSong.genre || 'Pop',
          releaseYear: existingSong.releaseYear || new Date().getFullYear(),
          metadata: existingSong.metadata,
          lyrics: existingSong.lyrics || { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' }
        });
      }
    } catch (error) {
      console.error('Failed to fetch song:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setIsUploadingAudio(true);
    setUploadProgress(0);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('category', 'general');

      const response = await mediaAPI.upload(formDataUpload, (progress) => {
        setUploadProgress(progress);
      });

      const uploadedFile = response.data.data.file;
      
      // Get audio duration
      const audio = new Audio(uploadedFile.secureUrl);
      audio.addEventListener('loadedmetadata', () => {
        setFormData(prev => ({
          ...prev,
          audioUrl: uploadedFile.secureUrl,
          cloudinaryId: uploadedFile.cloudinaryId,
          duration: Math.floor(audio.duration)
        }));
      });

      toast.success('Audio uploaded successfully!');
    } catch (error: any) {
      toast.error('Failed to upload audio: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUploadingAudio(false);
      setUploadProgress(0);
    }
  };

  // handleCoverUpload - commented by umar (cover image section hidden)
  // const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   if (!file.type.startsWith('image/')) {
  //     toast.error('Please upload an image file');
  //     return;
  //   }
  //   setIsUploadingCover(true);
  //   try {
  //     const formDataUpload = new FormData();
  //     formDataUpload.append('file', file);
  //     formDataUpload.append('category', 'general');
  //     const response = await mediaAPI.upload(formDataUpload);
  //     const uploadedFile = response.data.data.file;
  //     setFormData(prev => ({
  //       ...prev,
  //       coverImage: {
  //         url: uploadedFile.secureUrl,
  //         publicId: uploadedFile.cloudinaryId
  //       }
  //     }));
  //     toast.success('Cover image uploaded successfully!');
  //   } catch (error: any) {
  //     toast.error('Failed to upload image: ' + (error.response?.data?.message || error.message));
  //   } finally {
  //     setIsUploadingCover(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.en.trim()) {
      toast.error('English title is required!');
      setSelectedLanguage('en');
      return;
    }

    if (!formData.audioUrl) {
      toast.error('Audio file is required!');
      return;
    }

    if (formData.duration <= 0) {
      toast.error('Duration must be greater than 0!');
      return;
    }

    setIsSaving(true);

    try {
      if (song) {
        // Update existing song
        await songsAPI.update(song._id, formData);
        toast.success('Song updated successfully!');
      } else {
        // Create new song
        await songsAPI.create(formData);
        toast.success('Song created successfully!');
      }
      fetchSong();
    } catch (error: any) {
      toast.error('Failed to save song: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleChange = (lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      title: { ...prev.title, [lang]: value }
    }));
  };

  const handleDescriptionChange = (lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      description: { ...prev.description, [lang]: value }
    }));
  };

  const handleArtistChange = (lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      artist: { ...prev.artist, [lang]: value }
    }));
  };

  const handleLyricsChange = (lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      lyrics: { ...prev.lyrics, [lang]: value }
    }));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader2 size={32} className="spinning" />
        <p>Loading song...</p>
      </div>
    );
  }

  return (
    <div className="songs-management">
      <div className="page-header">
        <div>
          <h1> Song Management</h1>
          <p>Manage the single song displayed on the website</p>
        </div>
      </div>

      {/* Current Song Preview */}
      {song && (
        <div className="current-song-preview">
          <h3>Current Song</h3>
          <div className="song-card">
            <div className="song-cover">
              {song.coverImage?.url ? (
                <img src={song.coverImage.url} alt={song.title.en} />
              ) : (
                <div className="default-cover">
                  <Music size={32} />
                </div>
              )}
            </div>
            <div className="song-info">
              <h3>{song.title.en || song.key}</h3>
              {song.artist?.en && <p className="artist"><Mic size={14} /> {song.artist.en}</p>}
              <div className="song-meta">
                <span className="badge">{song.genre}</span>
                <span className="duration"><Clock size={14} /> {formatDuration(song.duration)}</span>
              </div>
              {song.metadata.playCount > 0 && (
                <p className="play-count"><Play size={14} /> {song.metadata.playCount} plays</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Song Form */}
      <form onSubmit={handleSubmit} className="song-form-inline">
        <div className="form-section">
          <h3><Edit size={18} /> {song ? 'Update Song' : 'Add Song'}</h3>
          
          {/* Basic Info */}
          <div className="form-row">
            <div className="form-group">
              <label>Genre</label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                placeholder="Pop, Rock, etc."
              />
            </div>

            <div className="form-group">
              <label>Duration (seconds) *</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                placeholder="180"
                required
                min="1"
              />
              <small>{formatDuration(formData.duration)}</small>
            </div>
          </div>
        </div>

        {/* Audio Upload - Moved to Cover Image position */}
        <div className="form-section">
          <h3>Upload Song File *</h3>
          <div className="upload-area">
            {formData.audioUrl ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.5rem',
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '10px',
                width: '100%'
              }}>
                <Music size={24} style={{ color: '#00d4ff' }} />
                <span style={{ color: '#00d4ff', fontWeight: 600 }}>Audio uploaded</span>
                <audio controls src={formData.audioUrl} style={{ width: '100%', marginTop: '10px' }}></audio>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, audioUrl: '', cloudinaryId: '', duration: 0 })}
                  style={{
                    padding: '10px 20px',
                    marginTop: '15px',
                    background: 'rgba(255, 59, 59, 0.3)',
                    border: '1px solid #ff3b3b',
                    borderRadius: '8px',
                    color: '#ff3b3b',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Remove & Replace Song
                </button>
              </div>
            ) : (
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 2rem',
                border: '2px dashed rgba(181, 55, 242, 0.6)',
                borderRadius: '10px',
                background: 'rgba(181, 55, 242, 0.1)',
                cursor: 'pointer'
              }}>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  disabled={isUploadingAudio}
                  style={{ display: 'none' }}
                />
                <Upload size={40} style={{ color: '#b537f2', marginBottom: '1rem' }} />
                <span style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  {isUploadingAudio ? `Uploading audio... ${uploadProgress}%` : 'Click here to upload song file'}
                </span>
                <small style={{ color: '#888' }}>MP3, WAV, etc. (Max 50MB)</small>
              </label>
            )}
          </div>
        </div>

        {/* Cover Image Upload - commented by umar */}
        {/* 
        <div className="form-section">
          <h3>Cover Image</h3>
          <div className="upload-area">
            {formData.coverImage.url ? (
              <div className="uploaded-image">
                <img src={formData.coverImage.url} alt="Cover" />
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => setFormData({ ...formData, coverImage: { url: '', publicId: '' } })}
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={isUploadingAudio || isUploadingCover}
                />
                <ImageIcon size={32} />
                <span>{isUploadingCover ? 'Uploading cover...' : 'Click to upload cover image'}</span>
                <small>JPG, PNG, etc.</small>
              </label>
            )}
          </div>
        </div>
        */}

        {/* Language Tabs */}
        <div className="form-section">
          <h3>Multilingual Content</h3>
          <div className="language-tabs">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                type="button"
                className={`lang-tab ${selectedLanguage === lang.code ? 'active' : ''} ${lang.code === 'en' ? 'required-tab' : ''}`}
                onClick={() => setSelectedLanguage(lang.code)}
              >
                {lang.name} {lang.code === 'en' && '*'}
              </button>
            ))}
          </div>

          <div className="language-content">
            <div className="form-group">
              <label>Title {selectedLanguage === 'en' ? '* (Required)' : ''}</label>
              <input
                type="text"
                value={formData.title[selectedLanguage as keyof typeof formData.title]}
                onChange={(e) => handleTitleChange(selectedLanguage, e.target.value)}
                placeholder="Song title"
              />
            </div>

            <div className="form-group">
              <label>Artist</label>
              <input
                type="text"
                value={formData.artist[selectedLanguage as keyof typeof formData.artist]}
                onChange={(e) => handleArtistChange(selectedLanguage, e.target.value)}
                placeholder="Artist name"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description[selectedLanguage as keyof typeof formData.description]}
                onChange={(e) => handleDescriptionChange(selectedLanguage, e.target.value)}
                placeholder="Song description"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Lyrics (Optional)</label>
              <textarea
                value={formData.lyrics[selectedLanguage as keyof typeof formData.lyrics]}
                onChange={(e) => handleLyricsChange(selectedLanguage, e.target.value)}
                placeholder="Song lyrics"
                rows={8}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={isUploadingAudio || isSaving}>
            {isSaving ? 'Saving...' : (isUploadingAudio ? 'Uploading...' : (song ? 'Update Song' : 'Save Song'))}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SongsManagement;
