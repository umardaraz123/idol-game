# Asset Setup Guide for Idol be Website

## 📸 Required Assets

### Images (place in `public/images/`)

1. **idol-gameplay.jpg**
   - Purpose: Main gameplay screenshot for About section
   - Recommended size: 1200x800px
   - Content: Gameplay screenshot showing the singing interface
   - You can use a placeholder from: https://placehold.co/1200x800/0b0b0f/00d4ff?text=Idol+Be+Gameplay

2. **songs.jpg**
   - Purpose: "20 Original Songs" slide
   - Recommended size: 800x600px
   - Content: Music notes, microphone, or audio waveforms
   - Placeholder: https://placehold.co/800x600/121218/b537f2?text=Original+Songs

3. **multiplayer.jpg**
   - Purpose: "Multiplayer Mode" slide
   - Recommended size: 800x600px
   - Content: Multiple players competing
   - Placeholder: https://placehold.co/800x600/121218/00d4ff?text=Multiplayer

4. **customize.jpg**
   - Purpose: "Customize Your Idol" slide
   - Recommended size: 800x600px
   - Content: Different character outfits/styles
   - Placeholder: https://placehold.co/800x600/121218/ff3366?text=Customize

5. **languages.jpg**
   - Purpose: "Global Languages" slide
   - Recommended size: 800x600px
   - Content: World map or language flags
   - Placeholder: https://placehold.co/800x600/121218/00d4ff?text=Languages

6. **fair-gaming.jpg**
   - Purpose: "Fair Gaming" slide
   - Recommended size: 800x600px
   - Content: Trophy, checkmark, or gaming controller
   - Placeholder: https://placehold.co/800x600/121218/b537f2?text=Fair+Gaming

### Video (place in `public/videos/`)

1. **hero-background.mp4**
   - Purpose: Hero section background video
   - Recommended specs:
     - Resolution: 1920x1080
     - Duration: 10-30 seconds (looping)
     - Format: MP4
     - Codec: H.264
     - Bitrate: 3-5 Mbps
   - Content: Gameplay footage, singing gameplay, or abstract gaming visuals
   - Alternative: You can use a static gradient background by commenting out the video element

## 🔧 Quick Setup with Placeholders

### Option 1: Using PowerShell to download placeholders

Run these commands in PowerShell from the project root:

```powershell
# Download placeholder images
Invoke-WebRequest -Uri "https://placehold.co/1200x800/0b0b0f/00d4ff/png?text=Idol+Be+Gameplay" -OutFile "public\images\idol-gameplay.jpg"
Invoke-WebRequest -Uri "https://placehold.co/800x600/121218/b537f2/png?text=Original+Songs" -OutFile "public\images\songs.jpg"
Invoke-WebRequest -Uri "https://placehold.co/800x600/121218/00d4ff/png?text=Multiplayer" -OutFile "public\images\multiplayer.jpg"
Invoke-WebRequest -Uri "https://placehold.co/800x600/121218/ff3366/png?text=Customize" -OutFile "public\images\customize.jpg"
Invoke-WebRequest -Uri "https://placehold.co/800x600/121218/00d4ff/png?text=Languages" -OutFile "public\images\languages.jpg"
Invoke-WebRequest -Uri "https://placehold.co/800x600/121218/b537f2/png?text=Fair+Gaming" -OutFile "public\images\fair-gaming.jpg"
```

### Option 2: Manually download and place

1. Visit https://placehold.co
2. Use the URLs mentioned above for each image
3. Download and save with the correct filenames in `public/images/`

### Option 3: Use your own images

Simply place your actual game screenshots with the correct filenames in `public/images/`

## 🎥 Video Setup

### Option 1: Find a free stock video
- Visit https://www.pexels.com/videos/ or https://pixabay.com/videos/
- Search for "gaming", "esports", or "neon abstract"
- Download and rename to `hero-background.mp4`
- Place in `public/videos/`

### Option 2: Use a static gradient (no video needed)
Comment out the video element in `src/components/Hero.tsx`:
```typescript
{/* <video autoPlay loop muted playsInline className="hero-video">
  <source src="/videos/hero-background.mp4" type="video/mp4" />
</video> */}
```

The gradient overlay will still provide a beautiful background!

## ✅ Verification

After adding assets, verify they load correctly:

1. Start the dev server: `npm run dev`
2. Open browser and check:
   - Hero section has video (or gradient if commented out)
   - About section shows gameplay image
   - Game Highlights slider shows all 5 images
3. Open browser console (F12) - you should see no 404 errors

## 🎨 Customization

All images can be replaced at any time. The website is structured to automatically:
- Scale images responsively
- Apply hover effects
- Maintain aspect ratios
- Add glowing borders and animations

Just replace the files with the same names!

---

**Need help?** The website will still work without images (they'll show broken image icons), but it's recommended to add at least placeholder images for the full experience.
