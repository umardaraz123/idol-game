import { useState, useEffect } from 'react';
import { useContentByType } from '../context/ContentContext';
import './WhoIsAna.css';

interface AnaContent {
  title: string;
  subtitle: string;
  description: string;
}

const WhoIsAna = () => {
  const { data: whoIsAnaData } = useContentByType('who_is_ana');
  const { data: aboutData } = useContentByType('about_section');

  const [content, setContent] = useState<AnaContent>({
    title: 'Who is Ana?',
    subtitle: 'MEET YOUR IDOL',
    description: `Ever since I was little, I've always loved to sing. That's why I sing every day. My dream is to become a star and enjoy my fans. Although I know it's a very difficult dream, I guess that's how dreams are, right?

There will be an audition in my city soon, but I feel like I'm not ready. I need to improve my singing skills to have any chance. There are so many people out there who sing so well... I wish everything were easier.`
  });

  // Update content from cached context data
  useEffect(() => {
    let anaContent = null;

    if (whoIsAnaData && whoIsAnaData.length > 0) {
      anaContent = whoIsAnaData.find((item: any) =>
        item.metadata?.category === 'main' || item.metadata?.isFeatured
      ) || whoIsAnaData[0];
    } else if (aboutData && aboutData.length > 0) {
      // Look for ana content in about_section by key
      anaContent = aboutData.find((item: any) => item.key === 'who_is_ana');
    }

    if (anaContent) {
      setContent({
        title: anaContent.title || 'Who is Ana?',
        subtitle: anaContent.subtitle || 'MEET YOUR IDOL',
        description: anaContent.description || `Ever since I was little, I've always loved to sing. That's why I sing every day. My dream is to become a star and enjoy my fans. Although I know it's a very difficult dream, I guess that's how dreams are, right?\n\nThere will be an audition in my city soon, but I feel like I'm not ready. I need to improve my singing skills to have any chance. There are so many people out there who sing so well... I wish everything were easier.`
      });
    }
  }, [whoIsAnaData, aboutData]);

  // Split description into paragraphs
  const paragraphs = content.description.split('\n').filter(p => p.trim());

  return (
    <section className="who-is-ana-section">
      <div className="container">
        <div className="row align-items-center g-5">
          {/* Left Column - Content */}
          <div className="col-lg-6 col-md-12" data-aos="fade-right" data-aos-duration="1000">
            <div className="ana-content">
              {/* <div className="section-tag">{content.subtitle}</div> */}
              <h2 className="section-title">
                <span className="text-glow-purple">{content.title}</span>
              </h2>
              <div className="title-underline"></div>

              {paragraphs.map((paragraph, index) => (
                <p key={index} className="ana-text">
                  {paragraph}
                </p>
              ))}

              {/* <div className="ana-quote-box">
                <div className="quote-icon">"</div>
                <p className="quote-text">
                  Anyway, I enjoy singing and no one can take that away from me. For me, 
                  singing is like flying, I can be free. I can express my feelings and get to know 
                  myself better. That's why I invite you not to be afraid and to join me on this 
                  adventure. If you're like me, let's do it together!
                </p>
                <div className="quote-author">— Ana</div>
              </div> */}


            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoIsAna;
