import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { songsAPI, mediaAPI } from '../../services/api';
import { Loader2, Plus, Music, Mic, Clock, Play, Edit, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
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

const SongsManagement = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    key: '',
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
      isFeatured: false,
      tags: [] as string[],
      playCount: 0
    },
    lyrics: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' }
  });

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await songsAPI.getAll();
      setSongs(response.data.data.songs || []);
    } catch (error) {
      console.error('Failed to fetch songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSong(null);
    setFormData({
      key: '',
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
        isFeatured: false,
        tags: [],
        playCount: 0
      },
      lyrics: { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' }
    });
    setShowModal(true);
  };

  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setFormData({
      key: song.key,
      title: song.title,
      description: song.description || { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
      artist: song.artist || { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' },
      audioUrl: song.audioUrl,
      cloudinaryId: song.cloudinaryId || '',
      duration: song.duration,
      coverImage: song.coverImage || { url: '', publicId: '' },
      genre: song.genre || 'Pop',
      releaseYear: song.releaseYear || new Date().getFullYear(),
      metadata: song.metadata,
      lyrics: song.lyrics || { en: '', hi: '', ru: '', ko: '', zh: '', ja: '', es: '' }
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;

    try {
      await songsAPI.delete(id);
      fetchSongs();
      toast.success('Song deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete song');
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

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploadingCover(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('category', 'general');

      const response = await mediaAPI.upload(formDataUpload);
      const uploadedFile = response.data.data.file;

      setFormData(prev => ({
        ...prev,
        coverImage: {
          url: uploadedFile.secureUrl,
          publicId: uploadedFile.cloudinaryId
        }
      }));

      toast.success('Cover image uploaded successfully!');
    } catch (error: any) {
      toast.error('Failed to upload image: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUploadingCover(false);
    }
  };

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

    try {
      if (editingSong) {
        await songsAPI.update(editingSong._id, formData);
        toast.success('Song updated successfully!');
      } else {
        await songsAPI.create(formData);
        toast.success('Song created successfully!');
      }
      setShowModal(false);
      fetchSongs();
    } catch (error: any) {
      toast.error('Failed to save song: ' + (error.response?.data?.message || error.message));
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
        <p>Loading songs...</p>
      </div>
    );
  }

  return (
    <div className="songs-management">
      <div className="page-header">
        <div>
          <h1>Songs Management</h1>
          <p>Manage songs with multilingual support and audio files</p>
        </div>
        <button className="btn-neon" onClick={handleCreate}>
          <Plus size={18} /> Add Song
        </button>
      </div>

      <div className="songs-grid">
        {songs.length === 0 ? (
          <div className="empty-state">
            <Music size={48} />
            <h3>No Songs Found</h3>
            <p>Add your first song to get started</p>
            <button className="btn-neon" onClick={handleCreate}>
              <Plus size={18} /> Add Song
            </button>
          </div>
        ) : (
          songs.map(song => (
            <div key={song._id} className="song-card">
              <div className="song-cover">
                {song.coverImage?.url ? (
                  <img src={song.coverImage.url} alt={song.title.en} />
                ) : (
                  <div className="default-cover">
                    <Music size={32} />
                  </div>
                )}
                {song.metadata.isFeatured && (
                  <div className="featured-badge">Featured</div>
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
                <span className={`status-badge ${song.metadata.isActive ? 'active' : 'inactive'}`}>
                  {song.metadata.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="song-actions">
                <button className="btn-edit" onClick={() => handleEdit(song)}>
                  <Edit size={16} /> Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(song._id)}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSong ? 'Edit Song' : 'Add Song'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="song-form">
              {/* Basic Info */}
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Song Key *</label>
                    <input
                      type="text"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      placeholder="unique_song_key"
                      required
                    />
                  </div>

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
                    <label>Release Year</label>
                    <input
                      type="number"
                      value={formData.releaseYear}
                      onChange={(e) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) })}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                </div>

                <div className="form-row">
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

                  <div className="form-group">
                    <label>Order</label>
                    <input
                      type="number"
                      value={formData.metadata.order}
                      onChange={(e) => setFormData({
                        ...formData,
                        metadata: { ...formData.metadata, order: parseInt(e.target.value) || 0 }
                      })}
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.metadata.isActive}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, isActive: e.target.checked }
                        })}
                      />
                      Active
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.metadata.isFeatured}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, isFeatured: e.target.checked }
                        })}
                      />
                      Featured
                    </label>
                  </div>
                </div>
              </div>

              {/* Audio Upload */}
              <div className="form-section">
                <h3>Audio File *</h3>
                <div className="upload-area">
                  {formData.audioUrl ? (
                    <div className="uploaded-file">
                      <Music size={24} />
                      <span>Audio uploaded</span>
                      <audio controls src={formData.audioUrl} style={{ width: '100%', marginTop: '10px' }}></audio>
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => setFormData({ ...formData, audioUrl: '', cloudinaryId: '' })}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="upload-label">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        disabled={isUploadingAudio || isUploadingCover}
                      />
                      <Upload size={32} />
                      <span>{isUploadingAudio ? `Uploading audio... ${uploadProgress}%` : 'Click to upload audio file'}</span>
                      <small>MP3, WAV, etc. (Max 50MB)</small>
                    </label>
                  )}
                </div>
              </div>

              {/* Cover Image Upload */}
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
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)} disabled={isUploadingAudio || isUploadingCover}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={isUploadingAudio || isUploadingCover}>
                  {isUploadingAudio || isUploadingCover ? 'File uploading...' : (editingSong ? 'Update Song' : 'Create Song')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongsManagement;
