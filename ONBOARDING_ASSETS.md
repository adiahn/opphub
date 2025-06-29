# Onboarding Assets Guide

This guide explains how to add beautiful background images and videos to your onboarding screens.

## 📁 Recommended Folder Structure

Create the following folder structure for your assets:

```
assets/
├── images/
│   └── onboarding/
│       ├── community-collaboration.jpg
│       ├── skills-portfolio.jpg
│       ├── collaboration-networking.jpg
│       └── success-future.jpg
└── videos/
    └── onboarding/
        ├── community-intro.mp4
        ├── skills-showcase.mp4
        ├── collaboration-demo.mp4
        └── success-story.mp4
```

## 🖼️ Background Images

### Recommended Image Specifications:
- **Resolution**: 1920x1080 or higher (16:9 aspect ratio)
- **Format**: JPG or PNG
- **File Size**: Keep under 2MB for optimal performance
- **Content**: High-quality, relevant to each slide's theme

### Image Suggestions for Each Slide:

1. **Welcome to Q** (Slide 1)
   - People collaborating in a modern workspace
   - Diverse group of professionals networking
   - Community gathering or team meeting

2. **Share Your Skills** (Slide 2)
   - Professional portfolio or resume
   - Achievement certificates or awards
   - Skills demonstration or presentation

3. **Connect & Collaborate** (Slide 3)
   - Team collaboration or brainstorming
   - Networking event or conference
   - Remote team working together

4. **Ready to Start?** (Slide 4)
   - Success celebration or achievement
   - Future vision or growth concept
   - Inspiring motivational imagery

## 🎥 Background Videos

### Recommended Video Specifications:
- **Resolution**: 1920x1080 (Full HD)
- **Format**: MP4 with H.264 encoding
- **Duration**: 10-15 seconds (looping)
- **File Size**: Keep under 10MB for optimal performance
- **Content**: Subtle, non-distracting movements

### Video Suggestions for Each Slide:

1. **Welcome to Q** (Slide 1)
   - Slow pan across a collaborative workspace
   - People walking and interacting in a modern office
   - Gentle zoom on community gathering

2. **Share Your Skills** (Slide 2)
   - Portfolio pages turning or scrolling
   - Achievement badges or certificates appearing
   - Skills being demonstrated (coding, design, etc.)

3. **Connect & Collaborate** (Slide 3)
   - Team members working together
   - Network connections forming
   - Collaboration tools in action

4. **Ready to Start?** (Slide 4)
   - Success celebration or achievement moment
   - Growth or progress visualization
   - Inspiring forward movement

## 🔧 How to Add Your Assets

### For Images:
1. Place your image files in `assets/images/onboarding/`
2. Update the `backgroundImage` property in `app/onboarding.tsx`:

```typescript
backgroundImage: require('../assets/images/onboarding/your-image.jpg'),
```

### For Videos:
1. Place your video files in `assets/videos/onboarding/`
2. Uncomment and update the `backgroundVideo` property in `app/onboarding.tsx`:

```typescript
backgroundVideo: require('../assets/videos/onboarding/your-video.mp4'),
```

3. Comment out the `backgroundImage` property for that slide.

## 🎨 Overlay Customization

You can adjust the overlay opacity for each slide to ensure text readability:

```typescript
overlayOpacity: 0.4 // Values between 0.1 and 0.8
```

- **Lower values (0.1-0.3)**: More visible background, less text contrast
- **Higher values (0.6-0.8)**: Less visible background, better text contrast

## 📱 Performance Tips

1. **Optimize Images**: Compress images without losing quality
2. **Optimize Videos**: Use efficient encoding and reasonable file sizes
3. **Test on Devices**: Ensure smooth performance on lower-end devices
4. **Fallback**: Always provide a `backgroundColor` as fallback

## 🎯 Content Guidelines

### Do's:
- ✅ Use high-quality, professional imagery
- ✅ Ensure content aligns with your app's purpose
- ✅ Maintain consistent visual style across slides
- ✅ Test readability with overlay effects
- ✅ Keep file sizes optimized

### Don'ts:
- ❌ Use low-resolution or blurry images
- ❌ Include distracting or irrelevant content
- ❌ Use copyrighted material without permission
- ❌ Make videos too fast or distracting
- ❌ Ignore performance considerations

## 🔄 Updating the Onboarding

After adding your assets, the onboarding will automatically use them. The system supports:
- **Images**: Static background images with overlay effects
- **Videos**: Looping background videos with overlay effects
- **Fallbacks**: Background colors if assets fail to load

Remember to test the onboarding flow after adding new assets to ensure everything works smoothly! 