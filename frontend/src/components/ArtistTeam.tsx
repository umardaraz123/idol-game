import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useContentByType } from '../context/ContentContext';
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
    title: 'Artistic Team',
    description: 'Idol be has a wonderful team of artists and creators who have contributed their talent and dedication to the development of this project. Idol be is a game made through the hard work of real people: no AI involved! Get to know them all!'
  },
  hi: {
    title: 'कलात्मक टीम',
    description: 'Idol be में कलाकारों और रचनाकारों की एक शानदार टीम है जिन्होंने इस परियोजना के विकास में अपनी प्रतिभा और समर्पण का योगदान दिया है। Idol be एक ऐसा गेम है जो वास्तविक लोगों की कड़ी मेहनत से बना है: कोई AI शामिल नहीं! उन सभी को जानें!'
  },
  ru: {
    title: 'Творческая Команда',
    description: 'Idol be имеет замечательную команду художников и создателей, которые внесли свой талант и преданность в разработку этого проекта. Idol be — это игра, созданная упорным трудом реальных людей: без участия ИИ! Познакомьтесь со всеми!'
  },
  ko: {
    title: '아티스트 팀',
    description: 'Idol be에는 이 프로젝트 개발에 재능과 헌신을 기여한 훌륭한 아티스트와 크리에이터 팀이 있습니다. Idol be는 실제 사람들의 노력으로 만들어진 게임입니다: AI가 관여하지 않았습니다! 모든 팀원을 만나보세요!'
  },
  zh: {
    title: '艺术团队',
    description: 'Idol be 拥有一支出色的艺术家和创作者团队，他们为这个项目的开发贡献了自己的才华和奉献精神。Idol be 是一款由真人辛勤工作制作的游戏：没有 AI 参与！来认识他们所有人吧！'
  },
  ja: {
    title: 'アーティストチーム',
    description: 'Idol beには、このプロジェクトの開発に才能と献身を捧げた素晴らしいアーティストとクリエイターのチームがいます。Idol beは実際の人々の努力によって作られたゲームです：AIは一切関与していません！全員を知ってください！'
  },
  es: {
    title: 'Equipo Artístico',
    description: 'Idol be cuenta con un maravilloso equipo de artistas y creadores que han contribuido con su talento y dedicación al desarrollo de este proyecto. ¡Idol be es un juego hecho a través del trabajo duro de personas reales: sin IA involucrada! ¡Conócelos a todos!'
  }
};

const ArtistTeam = () => {
  const { language } = useLanguage();
  const { data: teamData, isLoading: loading } = useContentByType('artist_team');
  const [members, setMembers] = useState<TeamMember[]>([]);

  // Get translations for current language
  const sectionHeader = sectionTranslations[language] || sectionTranslations.en;

  // Update members from cached context data
  useEffect(() => {
    if (teamData && teamData.length > 0) {
      // Filter only team members (exclude header content)
      const teamMembers = Array.isArray(teamData)
        ? teamData.sort((a: any, b: any) => (a.metadata?.order || 0) - (b.metadata?.order || 0))
        : [];
      setMembers(teamMembers);
    } else {
      setMembers([]);
    }
  }, [teamData]);

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
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
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
