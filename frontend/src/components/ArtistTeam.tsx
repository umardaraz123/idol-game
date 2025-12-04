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
        // Fetch all artist_team content
        const teamResponse = await publicAPI.getContent(language, { type: 'artist_team' });
        const contentData = teamResponse.data.data.content?.artist_team || [];
        
        // Separate header content from team members
        // Header has no category or empty category
        const headerContent = Array.isArray(contentData) 
          ? contentData.find((item: any) => 
              !item.metadata?.category || 
              item.metadata?.category === '' ||
              item.key === 'artist_team_header' ||
              item.key === 'teamnew'
            )
          : null;
        
        // Team members have valid categories
        const teamMembers = Array.isArray(contentData)
          ? contentData.filter((item: any) => 
              item.metadata?.category && 
              item.metadata?.category !== '' &&
              item.key !== 'artist_team_header' &&
              item.key !== 'teamnew'
            ).sort((a: any, b: any) => a.metadata.order - b.metadata.order)
          : [];
        
        setMembers(teamMembers);
        
        // Update header if found
        if (headerContent) {
          setSectionHeader({
            title: headerContent.title || 'Artistic Team',
            subtitle: headerContent.subtitle || 'THE CREATORS',
            description: headerContent.description || 'Idol be has a wonderful team of artists and creators who have contributed their talent and dedication to the development of this project.'
          });
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

  // getCategoryTitle - commented by umar (not used, members displayed directly)
  // const getCategoryTitle = (category: string) => {
  //   const titles: Record<string, { icon: string; text: string }> = {
  //     'game_design': { icon: '🎮', text: 'Game Design' },
  //     'programming': { icon: '💻', text: 'Programming' },
  //     'music': { icon: '🎵', text: 'Music' },
  //     'singers': { icon: '🎤', text: 'Singers' },
  //     'other': { icon: '', text: '' }
  //   };
  //   return titles[category] || { icon: '', text: '' };
  // };

  // groupedMembers - commented by umar (members displayed directly without grouping)
  // const groupedMembers = members.reduce((acc, member) => {
  //   const category = member.category || 'other';
  //   if (!acc[category]) {
  //     acc[category] = [];
  //   }
  //   acc[category].push(member);
  //   return acc;
  // }, {} as Record<string, TeamMember[]>);

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
          
        </div>

       

        <div className="team-grid">
          {members.map((member, index) => (
            <div 
              key={member._id} 
              className="team-member"
              data-aos="fade-up" 
              data-aos-delay={200 + (index * 50)}
            >
              {member.imageUrl && (
                <div className="member-photo-wrapper">
                  <img 
                    src={member.imageUrl} 
                    alt={member.title} 
                    className="member-photo"
                  />
                </div>
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
    </section>
  );
};

export default ArtistTeam;
