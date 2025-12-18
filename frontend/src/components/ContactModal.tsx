import { useState } from 'react';
import { publicAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { X, Send, AlertCircle, User, Mail, MessageSquare, Loader2, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import logo from '../assets/images/logo.png';
import './ContactModal.css';

// Translations for ContactModal
const translations: Record<string, {
    title: string;
    subtitle: string;
    successTitle: string;
    successText: string;
    yourName: string;
    namePlaceholder: string;
    yourAge: string;
    agePlaceholder: string;
    emailAddress: string;
    emailPlaceholder: string;
    yourMessage: string;
    messagePlaceholder: string;
    sending: string;
    sendMessage: string;
}> = {
    en: {
        title: 'Join to our community',
        subtitle: 'We know you are a Star!',
        successTitle: 'Message Sent!',
        successText: "Thank you for reaching out. We'll get back to you soon!",
        yourName: 'Your Name',
        namePlaceholder: 'Enter your name',
        yourAge: 'Your Age',
        agePlaceholder: 'Enter your age',
        emailAddress: 'Email Address',
        emailPlaceholder: 'your.email@example.com',
        yourMessage: 'Your Message',
        messagePlaceholder: "Tell us what's on your mind...",
        sending: 'Sending...',
        sendMessage: 'Send Message'
    },
    hi: {
        title: 'हमारे समुदाय से जुड़ें',
        subtitle: 'हम जानते हैं आप एक स्टार हैं!',
        successTitle: 'संदेश भेज दिया गया!',
        successText: 'संपर्क करने के लिए धन्यवाद। हम जल्द ही आपसे संपर्क करेंगे!',
        yourName: 'आपका नाम',
        namePlaceholder: 'अपना नाम दर्ज करें',
        yourAge: 'आपकी उम्र',
        agePlaceholder: 'अपनी उम्र दर्ज करें',
        emailAddress: 'ईमेल पता',
        emailPlaceholder: 'your.email@example.com',
        yourMessage: 'आपका संदेश',
        messagePlaceholder: 'हमें बताएं आप क्या सोच रहे हैं...',
        sending: 'भेजा जा रहा है...',
        sendMessage: 'संदेश भेजें'
    },
    ru: {
        title: 'Присоединяйтесь к нашему сообществу',
        subtitle: 'Мы знаем, что ты звезда!',
        successTitle: 'Сообщение отправлено!',
        successText: 'Спасибо за обращение. Мы свяжемся с вами в ближайшее время!',
        yourName: 'Ваше имя',
        namePlaceholder: 'Введите ваше имя',
        yourAge: 'Ваш возраст',
        agePlaceholder: 'Введите ваш возраст',
        emailAddress: 'Электронная почта',
        emailPlaceholder: 'your.email@example.com',
        yourMessage: 'Ваше сообщение',
        messagePlaceholder: 'Расскажите нам, что у вас на уме...',
        sending: 'Отправка...',
        sendMessage: 'Отправить сообщение'
    },
    ko: {
        title: '커뮤니티에 참여하세요',
        subtitle: '당신이 스타라는 걸 알아요!',
        successTitle: '메시지 전송 완료!',
        successText: '연락해 주셔서 감사합니다. 곧 답변 드리겠습니다!',
        yourName: '이름',
        namePlaceholder: '이름을 입력하세요',
        yourAge: '나이',
        agePlaceholder: '나이를 입력하세요',
        emailAddress: '이메일 주소',
        emailPlaceholder: 'your.email@example.com',
        yourMessage: '메시지',
        messagePlaceholder: '무엇이든 말씀해 주세요...',
        sending: '전송 중...',
        sendMessage: '메시지 보내기'
    },
    zh: {
        title: '加入我们的社区',
        subtitle: '我们知道你是明星！',
        successTitle: '消息已发送！',
        successText: '感谢您的联系，我们会尽快回复您！',
        yourName: '您的姓名',
        namePlaceholder: '请输入您的姓名',
        yourAge: '您的年龄',
        agePlaceholder: '请输入您的年龄',
        emailAddress: '电子邮箱',
        emailPlaceholder: 'your.email@example.com',
        yourMessage: '您的留言',
        messagePlaceholder: '告诉我们您的想法...',
        sending: '发送中...',
        sendMessage: '发送消息'
    },
    ja: {
        title: 'コミュニティに参加しよう',
        subtitle: 'あなたがスターだと知っています！',
        successTitle: 'メッセージを送信しました！',
        successText: 'お問い合わせありがとうございます。すぐにご連絡いたします！',
        yourName: 'お名前',
        namePlaceholder: 'お名前を入力してください',
        yourAge: '年齢',
        agePlaceholder: '年齢を入力してください',
        emailAddress: 'メールアドレス',
        emailPlaceholder: 'your.email@example.com',
        yourMessage: 'メッセージ',
        messagePlaceholder: 'ご意見をお聞かせください...',
        sending: '送信中...',
        sendMessage: 'メッセージを送信'
    },
    es: {
        title: 'Unete a nuestra comunidad',
        subtitle: '¡Sabemos que eres una estrella!',
        successTitle: '¡Mensaje enviado!',
        successText: 'Gracias por contactarnos. ¡Te responderemos pronto!',
        yourName: 'Tu nombre',
        namePlaceholder: 'Ingresa tu nombre',
        yourAge: 'Tu edad',
        agePlaceholder: 'Ingresa tu edad',
        emailAddress: 'Correo electronico',
        emailPlaceholder: 'tu.email@ejemplo.com',
        yourMessage: 'Tu mensaje',
        messagePlaceholder: 'Cuentanos lo que piensas...',
        sending: 'Enviando...',
        sendMessage: 'Enviar mensaje'
    }
};

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactModal = ({ isOpen, onClose }: ContactModalProps) => {
    const { language } = useLanguage();
    const t = translations[language] || translations.en;

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        email: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Check if form is valid (all fields filled correctly)
    const isFormValid = () => {
        const { name, age, email, message } = formData;
        if (!name.trim() || !age.trim() || !email.trim() || !message.trim()) return false;
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) return false;
        if (!/\S+@\S+\.\S+/.test(email)) return false;
        if (message.trim().length < 10) return false;
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const errors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!formData.age.trim()) {
            errors.age = 'Age is required';
        } else {
            const ageNum = parseInt(formData.age);
            if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
                errors.age = 'Please enter a valid age (1-120)';
            }
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.message.trim()) {
            errors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            errors.message = 'Message must be at least 10 characters';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            toast.error('Please fill in all required fields correctly');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await publicAPI.submitQuery(formData);

            setSuccess(true);
            setFormData({ name: '', age: '', email: '', message: '' });
            toast.success('Message sent successfully!');

            // Close modal after 2 seconds
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);

        } catch (err: any) {
            // Handle validation errors from backend
            if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                err.response.data.errors.forEach((error: any) => {
                    toast.error(error.msg || error.message || 'Validation error');
                });
            } else {
                const errorMessage = err.response?.data?.message || 'Failed to submit. Please try again.';
                toast.error(errorMessage);
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setFormData({ name: '', age: '', email: '', message: '' });
            setError('');
            setFieldErrors({});
            setSuccess(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="contact-modal-overlay" onClick={handleClose}>
            <div className="contact-modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="contact-modal-close" onClick={handleClose} disabled={loading}>
                    <X size={24} />
                </button>

                <div className="contact-modal-content">
                    {/* Header */}
                    <div className="contact-modal-header">
                        <div className="modal-icon-wrapper">
                            <div className="modal-icon-circle">
                                <img src={logo} alt="Idol Be Logo" className="modal-logo" />
                            </div>
                            <div className="modal-icon-glow"></div>
                        </div>
                        <h2 className="modal-title">{t.title}</h2>
                        <p className="modal-subtitle">{t.subtitle}</p>
                    </div>

                    {/* Success State */}
                    {success && (
                        <div className="success-animation">
                            <div className="success-checkmark">
                                <div className="check-icon">
                                    <span className="icon-line line-tip"></span>
                                    <span className="icon-line line-long"></span>
                                    <div className="icon-circle"></div>
                                    <div className="icon-fix"></div>
                                </div>
                            </div>
                            <h3 className="success-title">{t.successTitle}</h3>
                            <p className="success-text">{t.successText}</p>
                        </div>
                    )}

                    {/* Form */}
                    {!success && (
                        <form onSubmit={handleSubmit} className="contact-form">
                            {error && (
                                <div className="form-error">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            <div className="form-group-modal">
                                <label htmlFor="name">
                                    <User size={16} />
                                    {t.yourName} <span className="required-asterisk">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={t.namePlaceholder}
                                    disabled={loading}
                                    required
                                    className={fieldErrors.name ? 'field-error' : ''}
                                />
                                {fieldErrors.name && <span className="field-error-message">{fieldErrors.name}</span>}
                            </div>

                            <div className="form-group-modal">
                                <label htmlFor="age">
                                    <Calendar size={16} />
                                    {t.yourAge} <span className="required-asterisk">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    placeholder={t.agePlaceholder}
                                    disabled={loading}
                                    min="1"
                                    max="120"
                                    required
                                    className={fieldErrors.age ? 'field-error' : ''}
                                />
                                {fieldErrors.age && <span className="field-error-message">{fieldErrors.age}</span>}
                            </div>

                            <div className="form-group-modal">
                                <label htmlFor="email">
                                    <Mail size={16} />
                                    {t.emailAddress} <span className="required-asterisk">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={t.emailPlaceholder}
                                    disabled={loading}
                                    required
                                    className={fieldErrors.email ? 'field-error' : ''}
                                />
                                {fieldErrors.email && <span className="field-error-message">{fieldErrors.email}</span>}
                            </div>

                            <div className="form-group-modal">
                                <label htmlFor="message">
                                    <MessageSquare size={16} />
                                    {t.yourMessage} <span className="required-asterisk">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder={t.messagePlaceholder}
                                    rows={5}
                                    disabled={loading}
                                    required
                                    className={fieldErrors.message ? 'field-error' : ''}
                                />
                                {fieldErrors.message && <span className="field-error-message">{fieldErrors.message}</span>}
                            </div>

                            <button
                                type="submit"
                                className={`contact-submit-btn ${isFormValid() ? 'form-valid' : ''}`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="spinning" />
                                        {t.sending}
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        {t.sendMessage}
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Decorative Elements */}
                <div className="modal-particles">
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="modal-particle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${3 + Math.random() * 4}s`
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContactModal;
