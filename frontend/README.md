# Idol be - Modern Gaming Website

A world-class, futuristic gaming website built with React, TypeScript, Bootstrap, and custom CSS. Features a dark theme with neon accents, smooth animations, and a cinematic design inspired by top-tier gaming websites.

## 🎨 Design Features

- **Dark Futuristic Theme**: Deep blacks (#0b0b0f) with neon blue, purple, and red accents
- **Modern Typography**: Orbitron, Rajdhani, and Exo 2 fonts for a bold, gaming aesthetic
- **Smooth Animations**: GSAP and AOS for fade-ins, scroll reveals, and interactive effects
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile devices
- **Interactive Elements**: Glowing buttons, hover effects, and particle animations
- **Professional Layout**: Hero section, About, Game Highlights slider, Features grid, and Footer

## 🚀 Technologies Used

- **React 18** with TypeScript
- **Vite** - Fast build tool
- **Bootstrap 5** - Grid system and responsive utilities
- **React Slick** - Advanced carousel/slider
- **GSAP** - Professional animations
- **AOS** - Scroll animations
- **React Icons** - Icon library
- **Custom CSS** - Futuristic styling with CSS variables

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Add placeholder assets:
   
   Place the following files in the `public` directory:
   
   **Images** (place in `public/images/`):
   - `idol-gameplay.jpg` - Main gameplay screenshot for About section
   - `songs.jpg` - Image for "20 Original Songs" slide
   - `multiplayer.jpg` - Image for "Multiplayer Mode" slide
   - `customize.jpg` - Image for "Customize Your Idol" slide
   - `languages.jpg` - Image for "Global Languages" slide
   - `fair-gaming.jpg` - Image for "Fair Gaming" slide

   **Video** (place in `public/videos/`):
   - `hero-background.mp4` - Hero section background video (gaming-related, e.g., gameplay footage)

   **Recommended sizes:**
   - Hero video: 1920x1080, 10-30 seconds, looping
   - Gameplay images: 1200x800 or similar 3:2 ratio
   - Slider images: 800x600 or similar 4:3 ratio

3. Start the development server:
```bash
npm run dev
```

## 🎯 Project Structure

```
src/
├── components/
│   ├── Hero.tsx / Hero.css          # Full-screen video hero
│   ├── About.tsx / About.css        # About Idol be section
│   ├── GameHighlights.tsx / .css    # React Slick carousel
│   ├── Features.tsx / Features.css  # Features grid
│   └── Footer.tsx / Footer.css      # Footer with social links
├── App.tsx                          # Main app component
├── App.css                          # App-level styles
├── index.css                        # Global styles & CSS variables
└── main.tsx                         # Entry point
```

## 🎨 CSS Custom Properties

The design uses CSS variables for consistent theming:

```css
--bg-primary: #0b0b0f;      /* Main background */
--bg-secondary: #121218;    /* Secondary background */
--neon-blue: #00d4ff;       /* Primary accent */
--neon-purple: #b537f2;     /* Secondary accent */
--neon-red: #ff3366;        /* Tertiary accent */
```

## 🌟 Key Components

### Hero Section
- Full-screen video background with overlay
- Animated title with glow effect
- Particle background effect
- Scroll indicator
- Smooth fade-in animations using GSAP

### About Section
- Bootstrap grid layout (2 columns)
- Image with glowing border effect on hover
- Content about the game
- Highlight boxes with gradient backgrounds

### Game Highlights Slider
- React Slick carousel
- 3 slides on desktop, 2 on tablet, 1 on mobile
- Autoplay with pause on hover
- Cards with image, title, and description
- Glow effects on hover

### Features Section
- 4-column responsive grid
- Animated icons with rotation on hover
- Gradient backgrounds
- Special "No Hidden Costs" card

### Footer
- Dark minimal design
- Social media icons with hover effects
- Contact information
- Copyright and links

## 📱 Responsive Breakpoints

- **Desktop**: 1200px+
- **Laptop**: 992px - 1199px
- **Tablet**: 768px - 991px
- **Mobile**: < 768px
- **Small Mobile**: < 480px

## 🎭 Animation Details

- **AOS**: Scroll-triggered animations (fade-up, fade-left, fade-right, zoom-in)
- **GSAP**: Hero section entrance animations with timeline
- **CSS**: Hover effects, glows, gradients, and transitions
- **Particles**: Floating particle effect in hero section

## 🔄 API Integration (Future)

The components are structured to easily switch from static data to API integration:

1. Create a `services` folder for API calls
2. Use React hooks (useState, useEffect) to fetch data
3. Update component interfaces to accept dynamic data
4. Add loading states and error handling

Example structure:
```typescript
// services/api.ts
export const fetchGameHighlights = async () => {
  const response = await fetch('/api/highlights');
  return response.json();
};

// In component
const [slides, setSlides] = useState([]);
useEffect(() => {
  fetchGameHighlights().then(setSlides);
}, []);
```

## 🎮 Content Information

Based on the Idol be game created by **Jacinto Jiménez**:

- 20 original pop songs
- Multilingual support (7 languages)
- Online multiplayer mode
- 20+ customizable looks
- No ads, loot boxes, or pay-to-win
- Fair gaming philosophy

## 🛠️ Build for Production

```bash
npm run build
```

The optimized build will be in the `dist` folder.

## 📄 License

Created for the Idol be game by Jacinto Jiménez.

## 🙏 Credits

- **Game Creator**: Jacinto Jiménez
- **Design Inspiration**: Top 1% gaming websites (playgoals.com aesthetic)
- **Fonts**: Google Fonts (Orbitron, Rajdhani, Exo 2)
- **Icons**: React Icons (Font Awesome)

---

**Note**: This website uses placeholder assets. Replace them with actual game footage and screenshots for the final version.

For questions or suggestions, contact the Idol be team!
