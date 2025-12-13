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
  linkedinUrl?: string; // LinkedIn profile URL
  metadata: {
    order: number;
    isActive: boolean;
    category?: string;
  };
}

// Hardcoded translations for section header
const sectionTranslations: Record<string, { title: string; description: string }> = {
  en: {
    title: 'Our Team',
    description: 'Meet the talented individuals behind Idol be who bring their creativity and expertise to make this game extraordinary.'
  },
  hi: {
    title: 'हमारी टीम',
    description: 'आइडल बी के पीछे की प्रतिभाशाली टीम से मिलें जो अपनी रचनात्मकता और विशेषज्ञता से इस गेम को असाधारण बनाती है।'
  },
  ru: {
    title: 'Наша Команда',
    description: 'Познакомьтесь с талантливыми людьми, стоящими за Idol be, которые привносят свой креатив и опыт, делая эту игру необыкновенной.'
  },
  ko: {
    title: '우리 팀',
    description: 'Idol be를 만드는 재능있는 사람들을 만나보세요. 그들의 창의성과 전문성이 이 게임을 특별하게 만듭니다.'
  },
  zh: {
    title: '我们的团队',
    description: '认识 Idol be 背后才华横溢的团队成员，他们用创造力和专业知识让这款游戏非凡卓越。'
  },
  ja: {
    title: '私たちのチーム',
    description: 'Idol beの背後にいる才能あるメンバーをご紹介します。彼らの創造性と専門知識がこのゲームを特別なものにしています。'
  },
  es: {
    title: 'Nuestro Equipo',
    description: 'Conoce a las personas talentosas detrás de Idol be que aportan su creatividad y experiencia para hacer este juego extraordinario.'
  }
};

const ArtistTeam = () => {
  const { language } = useLanguage();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Get translations for current language
  const sectionHeader = sectionTranslations[language] || sectionTranslations.en;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all artist_team content (only team members)
        const teamResponse = await publicAPI.getContent(language, { type: 'artist_team' });
        const contentData = teamResponse.data.data.content?.artist_team || [];
        
        // Filter only team members (exclude header content)
        const teamMembers = Array.isArray(contentData)
          ? contentData.filter((item: any) => 
              item.metadata?.category && 
              item.metadata?.category !== ''
            ).sort((a: any, b: any) => a.metadata.order - b.metadata.order)
          : [];
        
        setMembers(teamMembers);
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
          {members.map((member, index) => {
            const CardContent = (
              <>
                {member.imageUrl && (
                  <div className="member-photo-wrapper">
                    <img 
                      src={member.imageUrl} 
                      alt={member.title} 
                      className="member-photo"
                    />
                  </div>
                )}
                <div className="member-info">
                  <span className="member-name">
                    {member.title}
                  </span>
                  {member.subtitle && (
                    <span className="member-position">
                      {member.subtitle}
                    </span>
                  )}
                  <div className="linkedin-link-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    <span>{member.linkedinUrl ? 'Visit LinkedIn Profile' : 'LinkedIn Not Available'}</span>
                  </div>
                </div>
              </>
            );

            return member.linkedinUrl ? (
              <a
                key={member._id}
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="team-member team-member-link"
                data-aos="fade-up"
                data-aos-delay={200 + (index * 50)}
              >
                {CardContent}
              </a>
            ) : (
              <div
                key={member._id}
                className="team-member"
                data-aos="fade-up"
                data-aos-delay={200 + (index * 50)}
              >
                {CardContent}
              </div>
            );
          })}
        </div>

       
      </div>
    </section>
  );
};

export default ArtistTeam;
