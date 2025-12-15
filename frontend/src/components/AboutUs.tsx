import { useLanguage } from '../context/LanguageContext';
import './AboutUs.css';

// Translations for all 7 languages
const translations: Record<string, { title: string; paragraph1: string; paragraph2: string; paragraph3: string }> = {
    en: {
        title: 'About us',
        paragraph1: 'Idol be is the brainchild of Jacinto Jiménez. Of course, he didn\'t do it alone. Developing Idol be required the effort and collaboration of numerous artists from different disciplines. But Jacinto was a key figure in the creation of the project, as he designed the game concept, the main melody for all the songs, and their lyrics. He also sought out and selected the developers!',
        paragraph2: 'But above all, if we have to thank someone for the existence of this project, that person is Victoria Jiménez Diaz. Thank you for your unwavering support and trust. Without you, Idol be would not have become a reality. Thank you very much, Victoria!',
        paragraph3: 'So what? Shall we sing a little?'
    },
    hi: {
        title: 'हमारे बारे में',
        paragraph1: 'Idol be जैसिंटो जिमेनेज़ की कल्पना है। बेशक, उन्होंने यह अकेले नहीं किया। Idol be को विकसित करने के लिए विभिन्न विषयों के कई कलाकारों के प्रयास और सहयोग की आवश्यकता थी। लेकिन जैसिंटो परियोजना के निर्माण में एक महत्वपूर्ण व्यक्ति थे, क्योंकि उन्होंने गेम कॉन्सेप्ट, सभी गानों की मुख्य धुन और उनके बोल डिज़ाइन किए। उन्होंने डेवलपर्स को भी खोजा और चुना!',
        paragraph2: 'लेकिन सबसे बढ़कर, अगर हमें इस परियोजना के अस्तित्व के लिए किसी को धन्यवाद देना है, तो वह व्यक्ति हैं विक्टोरिया जिमेनेज़ डियाज़। आपके अटूट समर्थन और विश्वास के लिए धन्यवाद। आपके बिना, Idol be हकीकत नहीं बन पाता। बहुत-बहुत धन्यवाद, विक्टोरिया!',
        paragraph3: 'तो क्या? क्या हम थोड़ा गाएं?'
    },
    ru: {
        title: 'О нас',
        paragraph1: 'Idol be — это детище Хасинто Хименеса. Конечно, он сделал это не в одиночку. Разработка Idol be потребовала усилий и сотрудничества многочисленных художников из разных дисциплин. Но Хасинто был ключевой фигурой в создании проекта, так как он разработал концепцию игры, основную мелодию для всех песен и их тексты. Он также искал и отбирал разработчиков!',
        paragraph2: 'Но прежде всего, если мы должны кого-то поблагодарить за существование этого проекта, то это Виктория Хименес Диас. Спасибо за вашу непоколебимую поддержку и доверие. Без вас Idol be не стал бы реальностью. Большое спасибо, Виктория!',
        paragraph3: 'Ну что? Споём немного?'
    },
    ko: {
        title: '우리에 대해',
        paragraph1: 'Idol be는 Jacinto Jiménez의 아이디어입니다. 물론 혼자 한 것은 아닙니다. Idol be를 개발하려면 다양한 분야의 수많은 아티스트들의 노력과 협력이 필요했습니다. 그러나 Jacinto는 게임 컨셉, 모든 노래의 주 멜로디, 가사를 디자인했기 때문에 프로젝트 창작에 핵심적인 인물이었습니다. 그는 또한 개발자들을 찾아 선발했습니다!',
        paragraph2: '하지만 무엇보다도, 이 프로젝트의 존재에 대해 누군가에게 감사해야 한다면 그 사람은 Victoria Jiménez Diaz입니다. 변함없는 지원과 신뢰에 감사드립니다. 당신이 없었다면 Idol be는 현실이 되지 못했을 것입니다. 정말 감사합니다, Victoria!',
        paragraph3: '그래서요? 조금 노래할까요?'
    },
    zh: {
        title: '关于我们',
        paragraph1: 'Idol be 是 Jacinto Jiménez 的心血结晶。当然，他并不是独自完成的。开发 Idol be 需要来自不同领域的众多艺术家的努力和协作。但 Jacinto 是项目创建的关键人物，因为他设计了游戏概念、所有歌曲的主旋律和歌词。他还寻找并选择了开发人员！',
        paragraph2: '但最重要的是，如果我们要感谢某人使这个项目得以存在，那个人就是 Victoria Jiménez Diaz。感谢您坚定不移的支持和信任。没有您，Idol be 就不会成为现实。非常感谢您，Victoria！',
        paragraph3: '那么，我们来唱一首歌吧？'
    },
    ja: {
        title: '私たちについて',
        paragraph1: 'Idol be は Jacinto Jiménez のアイデアです。もちろん、彼一人で成し遂げたわけではありません。Idol be の開発には、さまざまな分野の多くのアーティストの努力と協力が必要でした。しかし、Jacinto はプロジェクト作成の重要人物でした。彼がゲームコンセプト、すべての曲のメインメロディ、歌詞をデザインしたからです。彼は開発者も探して選びました！',
        paragraph2: 'しかし何よりも、このプロジェクトの存在に感謝すべき人がいるとすれば、それは Victoria Jiménez Diaz です。揺るぎないサポートと信頼をありがとうございます。あなたがいなければ、Idol be は現実にならなかったでしょう。本当にありがとうございます、Victoria！',
        paragraph3: 'さて、少し歌いましょうか？'
    },
    es: {
        title: 'Sobre nosotros',
        paragraph1: 'Idol be es la creación de Jacinto Jiménez. Por supuesto, no lo hizo solo. Desarrollar Idol be requirió el esfuerzo y la colaboración de numerosos artistas de diferentes disciplinas. Pero Jacinto fue una figura clave en la creación del proyecto, ya que diseñó el concepto del juego, la melodía principal de todas las canciones y sus letras. ¡También buscó y seleccionó a los desarrolladores!',
        paragraph2: 'Pero sobre todo, si tenemos que agradecer a alguien la existencia de este proyecto, esa persona es Victoria Jiménez Diaz. Gracias por tu apoyo y confianza inquebrantables. Sin ti, Idol be no se habría convertido en realidad. ¡Muchas gracias, Victoria!',
        paragraph3: '¿Y qué? ¿Cantamos un poco?'
    }
};

const AboutUs = () => {
    const { language } = useLanguage();
    const content = translations[language] || translations.en;

    return (
        <section className="aboutus-section">
            <div className="container">
                <div className="aboutus-content" data-aos="fade-up">
                    <h2 className="section-title">
                        <span className="text-glow-blue">{content.title}</span>
                    </h2>
                    <div className="title-underline"></div>

                    <div className="aboutus-text">
                        <p className="aboutus-paragraph">
                            {content.paragraph1}
                        </p>
                        <p className="aboutus-paragraph highlight">
                            {content.paragraph2}
                        </p>
                        <p className="aboutus-cta">
                            {content.paragraph3}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
