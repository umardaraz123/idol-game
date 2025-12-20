import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { publicAPI, footerAPI } from '../services/api';
import { useLanguage } from './LanguageContext';

// LocalStorage keys for persistent cache
const STORAGE_KEYS = {
    content: 'idol_content_cache',
    songs: 'idol_songs_cache',
    footer: 'idol_footer_cache',
};

// Helper functions for localStorage cache
const getFromStorage = <T,>(key: string): Record<string, T> => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

const saveToStorage = <T,>(key: string, data: Record<string, T>) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        // Storage might be full, clear old cache
        console.warn('Failed to save to localStorage:', e);
    }
};

// Types for the content data
interface ContentData {
    [key: string]: any[];
}

interface FooterData {
    leftColumn: {
        title: string;
        subtitle: string;
        description: string;
    };
    centerColumn: {
        title: string;
        subtitle: string;
        description: string;
    };
    rightColumn: {
        title: string;
        subtitle: string;
        description: string;
    };
    socialIcons: Array<{
        platform: string;
        url: string;
        iconUrl: string;
        order: number;
        isActive: boolean;
    }>;
    copyrightText: string;
}

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

interface ContentContextType {
    // Content data
    content: ContentData;
    songs: Song[];
    footer: FooterData | null;

    // Loading states
    isContentLoading: boolean;
    isSongsLoading: boolean;
    isFooterLoading: boolean;

    // Helper to get content by type
    getContentByType: (type: string) => any[];

    // Refresh functions
    refreshContent: () => Promise<void>;
    refreshSongs: () => Promise<void>;
    refreshFooter: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

// Stable empty array to prevent re-renders when content type doesn't exist
const EMPTY_ARRAY: any[] = [];

export const ContentProvider = ({ children }: { children: ReactNode }) => {
    const { language } = useLanguage();

    // Initialize state from localStorage cache for instant load
    const [content, setContent] = useState<ContentData>(() => {
        const cached = getFromStorage<ContentData>(STORAGE_KEYS.content);
        const initialLang = localStorage.getItem('selectedLanguage') || 'en';
        return cached[initialLang] || {};
    });
    const [songs, setSongs] = useState<Song[]>(() => {
        const cached = getFromStorage<Song[]>(STORAGE_KEYS.songs);
        const initialLang = localStorage.getItem('selectedLanguage') || 'en';
        return cached[initialLang] || [];
    });
    const [footer, setFooter] = useState<FooterData | null>(() => {
        const cached = getFromStorage<FooterData>(STORAGE_KEYS.footer);
        const initialLang = localStorage.getItem('selectedLanguage') || 'en';
        return cached[initialLang] || null;
    });

    // Loading states - start as false to avoid loading flash when cache exists
    const [isContentLoading, setIsContentLoading] = useState(false);
    const [isSongsLoading, setIsSongsLoading] = useState(false);
    const [isFooterLoading, setIsFooterLoading] = useState(false);

    // Cache refs to store data per language (persists across renders without causing them)
    // Initialize from localStorage
    const contentCache = useRef<Record<string, ContentData>>(getFromStorage<ContentData>(STORAGE_KEYS.content));
    const songsCache = useRef<Record<string, Song[]>>(getFromStorage<Song[]>(STORAGE_KEYS.songs));
    const footerCache = useRef<Record<string, FooterData>>(getFromStorage<FooterData>(STORAGE_KEYS.footer));

    // Fetch all main content in one call (with caching)
    const fetchContent = useCallback(async (forceRefresh = false) => {
        // Return cached data immediately if available
        if (!forceRefresh && contentCache.current[language]) {
            setContent(contentCache.current[language]);
            return;
        }

        setIsContentLoading(true);
        try {
            const response = await publicAPI.getContent(language);
            const contentData = response.data.data.content || {};
            contentCache.current[language] = contentData; // Cache in memory
            saveToStorage(STORAGE_KEYS.content, contentCache.current); // Persist to localStorage
            setContent(contentData);
        } catch (error) {
            console.error('Failed to fetch content:', error);
            setContent({});
        } finally {
            setIsContentLoading(false);
        }
    }, [language]);

    // Fetch songs (with caching)
    const fetchSongs = useCallback(async (forceRefresh = false) => {
        // Return cached data immediately if available
        if (!forceRefresh && songsCache.current[language]) {
            setSongs(songsCache.current[language]);
            return;
        }

        setIsSongsLoading(true);
        try {
            const response = await publicAPI.getSongs(language);
            const songsData = response.data.data.songs || [];
            songsCache.current[language] = songsData; // Cache in memory
            saveToStorage(STORAGE_KEYS.songs, songsCache.current); // Persist to localStorage
            setSongs(songsData);
        } catch (error) {
            console.error('Failed to fetch songs:', error);
            setSongs([]);
        } finally {
            setIsSongsLoading(false);
        }
    }, [language]);

    // Fetch footer (with caching)
    const fetchFooter = useCallback(async (forceRefresh = false) => {
        // Return cached data immediately if available
        if (!forceRefresh && footerCache.current[language]) {
            setFooter(footerCache.current[language]);
            return;
        }

        setIsFooterLoading(true);
        try {
            const response = await footerAPI.get(language);
            const footerData = response.data.data.footer;
            footerCache.current[language] = footerData; // Cache in memory
            saveToStorage(STORAGE_KEYS.footer, footerCache.current); // Persist to localStorage
            setFooter(footerData);
        } catch (error) {
            console.error('Failed to fetch footer:', error);
            setFooter(null);
        } finally {
            setIsFooterLoading(false);
        }
    }, [language]);

    // Fetch all data when language changes (uses cache if available)
    useEffect(() => {
        // Fetch all content in parallel
        Promise.all([
            fetchContent(),
            fetchSongs(),
            fetchFooter()
        ]);
    }, [fetchContent, fetchSongs, fetchFooter]);

    // Helper to get content by type
    const getContentByType = useCallback((type: string): any[] => {
        return content[type] || EMPTY_ARRAY;
    }, [content]);

    return (
        <ContentContext.Provider
            value={{
                content,
                songs,
                footer,
                isContentLoading,
                isSongsLoading,
                isFooterLoading,
                getContentByType,
                refreshContent: fetchContent,
                refreshSongs: fetchSongs,
                refreshFooter: fetchFooter
            }}
        >
            {children}
        </ContentContext.Provider>
    );
};

// Main hook to access all content
export const useContent = () => {
    const context = useContext(ContentContext);
    if (!context) {
        throw new Error('useContent must be used within a ContentProvider');
    }
    return context;
};

// Convenience hook to get specific content type
export const useContentByType = (type: string) => {
    const { getContentByType, isContentLoading } = useContent();
    return {
        data: getContentByType(type),
        isLoading: isContentLoading
    };
};

// Hook for songs
export const useSongs = () => {
    const { songs, isSongsLoading, refreshSongs } = useContent();
    return {
        songs,
        isLoading: isSongsLoading,
        refresh: refreshSongs
    };
};

// Hook for footer
export const useFooter = () => {
    const { footer, isFooterLoading, refreshFooter } = useContent();
    return {
        footer,
        isLoading: isFooterLoading,
        refresh: refreshFooter
    };
};
