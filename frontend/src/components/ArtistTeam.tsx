import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { publicAPI } from '../services/api';
import './ArtistTeam.css';

interface TeamMember {
  _id: string;
  title: string; // Name (localized)
  description: string; // Role/Description (localized)
  subtitle?: string; // Position/Title (localized)
  imageUrl?: string;
  metadata: {
    order: number;
    isActive: boolean;
    category?: string;
  };
}

interface SectionHeader {
  title: string;
  subtitle: string;
  description: string;
}

const ArtistTeam = () => {
  const { language } = useLanguage();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [sectionHeader, setSectionHeader] = useState<SectionHeader>({
    title: 'Artistic Team',
    subtitle: 'THE CREATORS',
    description: 'Idol be has a wonderful team of artists and creators who have contributed their talent and dedication to the development of this project.'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch team members
        const teamResponse = await publicAPI.getContent(language, { type: 'artist_team' });
        const contentData = teamResponse.data.data.content?.artist_team || [];
        setMembers(
          Array.isArray(contentData) 
            ? contentData.sort((a: any, b: any) => a.metadata.order - b.metadata.order)
            : []
        );

        // Try to fetch header content (optional)
        try {
          const headerResponse = await publicAPI.getContentByKey('team', language);
          if (headerResponse?.data?.data?.content) {
            const header = headerResponse.data.data.content;
            setSectionHeader({
              title: header.title || 'Artistic Team',
              subtitle: header.subtitle || 'THE CREATORS',
              description: header.description || 'Idol be has a wonderful team of artists and creators who have contributed their talent and dedication to the development of this project.'
            });
          }
        } catch (headerError) {
          // Header content not found, use defaults - this is okay
          console.log('Using default artist team header');
        }
      } catch (error) {
        console.error('Failed to fetch team data:', error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [language]);

  const getCategoryTitle = (category: string) => {
    const titles: Record<string, string> = {
      'game_design': '🎮 Game Design',
      'programming': '💻 Programming',
      'music': '🎵 Music',
      'singers': '🎤 Singers',
      'other': '✨ Other Contributors'
    };
    return titles[category] || '✨ Team';
  };

  const groupedMembers = members.reduce((acc, member) => {
    const category = member.metadata.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  if (loading) {
    return (
      <section className="artist-team-section">
        <div className="container">
          <div className="section-header">
            <h2>Loading...</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="artist-team-section">
      <div className="container">
        <div className="section-header" data-aos="fade-up">
          <div className="section-tag">{sectionHeader.subtitle}</div>
          <h2 className="section-title">
            {sectionHeader.title.split(' ').map((word, index, arr) => 
              index === arr.length - 1 ? (
                <span key={index} className="text-glow-blue">{word}</span>
              ) : (
                <span key={index}>{word} </span>
              )
            )}
          </h2>
          <div className="title-underline"></div>
          <p className="section-subtitle">
            {sectionHeader.description}
          </p>
          <p className="section-note">
            Idol be is a game created by <strong>real people, no AI involved!</strong> Meet them all:
          </p>
        </div>

        <div className="team-intro" data-aos="fade-up" data-aos-delay="100">
          <div className="presenter-card">
            <div className="presenter-label">Presented by</div>
            <h3 className="presenter-name">Victoria Jiménez Díaz</h3>
            <p className="presenter-role">presents: Idol be</p>
          </div>
        </div>

        <div className="team-grid">
          {Object.entries(groupedMembers).map(([category, categoryMembers], catIndex) => (
            <div 
              key={category} 
              className="team-category" 
              data-aos="fade-up" 
              data-aos-delay={200 + (catIndex * 50)}
            >
              <h3 className="category-title">{getCategoryTitle(category)}</h3>
              <div className={category === 'singers' ? 'team-members-list' : ''}>
                {categoryMembers.map((member) => (
                  <div 
                    key={member._id} 
                    className={category === 'singers' ? 'singer-item' : 'team-member'}
                  >
                    {member.imageUrl && (
                      <img 
                        src={member.imageUrl} 
                        alt={member.title} 
                        className="member-photo"
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '50%', 
                          objectFit: 'cover',
                          marginRight: '1rem'
                        }}
                      />
                    )}
                    <span className="member-name">
                      {member.title}
                    </span>
                    {member.subtitle && (
                      <span className="member-position">
                        {member.subtitle}
                      </span>
                    )}
                    <span className="member-role">
                      {member.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="gratitude-section" data-aos="zoom-in" data-aos-delay="400">
          <h3 className="gratitude-title">Thank you all very much! Without you, this would not have been possible.</h3>
        </div>
      </div>
    </section>
  );
};

export default ArtistTeam;
