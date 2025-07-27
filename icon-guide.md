# Na Maane! App Icon Guide

## Current Icon Configuration

The app uses the following icon files (as configured in `app.json`):

- **Main Icon**: `./assets/icon.png` (1024x1024px)
- **Splash Screen**: `./assets/splash-icon.png` 
- **Android Adaptive**: `./assets/adaptive-icon.png`
- **Web Favicon**: `./assets/favicon.png`

## Icon Design Requirements

### **Design Concept for Na Maane!**
The icon should represent:
- ✅ **Productivity tracking** (checkmarks, progress indicators)
- 📊 **Daily habits** (calendar elements, charts)
- 🎯 **Goal achievement** (target, completion symbols)
- 📱 **Modern, clean design** (iOS/Android appropriate)

### **Recommended Design Elements**
1. **Central Symbol**: Circular progress ring or checkmark
2. **Color Scheme**: 
   - Primary: Orange (#e67e22) - matches the app's theme
   - Secondary: Dark blue (#2c3e50) or white
   - Background: Clean gradient or solid color
3. **Style**: Minimalist, modern, professional

## Technical Specifications

### **1. Main App Icon (`icon.png`)**
- **Size**: 1024 × 1024 pixels
- **Format**: PNG with transparency
- **Purpose**: Used for app store, iOS home screen (auto-resized)
- **Design**: Full icon with background

### **2. Android Adaptive Icon (`adaptive-icon.png`)**
- **Size**: 1024 × 1024 pixels
- **Format**: PNG with transparency
- **Purpose**: Android adaptive icon foreground layer
- **Design**: Icon elements only (no background - uses backgroundColor from app.json)
- **Safe Area**: Center 768 × 768 pixels (66% of total)

### **3. Splash Screen Icon (`splash-icon.png`)**
- **Size**: 1024 × 1024 pixels (or larger for high-res displays)
- **Format**: PNG with transparency
- **Purpose**: Displayed during app launch
- **Design**: Can be simpler version of main icon

### **4. Web Favicon (`favicon.png`)**
- **Size**: 48 × 48 pixels (or 32×32)
- **Format**: PNG
- **Purpose**: Browser tab icon for web version

## Where to Update Icon Paths

All icon paths are configured in `app.json`:

```json
{
  "expo": {
    "icon": "./assets/icon.png",           // Main app icon
    "splash": {
      "image": "./assets/splash-icon.png"  // Splash screen icon
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png"  // Android adaptive
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"    // Web favicon
    }
  }
}
```

## Design Tools & Resources

### **Free Design Options**:
1. **Figma** (free) - Professional icon design
2. **Canva** (free tier) - Template-based design
3. **GIMP** (free) - Advanced image editing
4. **Sketch** (Mac only, paid) - Professional design tool

### **Icon Generation Tools**:
1. **App Icon Generator** (online) - Auto-generates all sizes
2. **Expo Icon Generator** - Built into Expo ecosystem
3. **Icons8** - Free icons with customization

## Suggested Icon Concept

### **Design Description**:
```
🎯 Central Element: Circular progress ring (75% complete)
✅ Inside Ring: Stylized checkmark or tick
📊 Background: Subtle gradient (orange to darker orange)
🔢 Optional: Small "N" for Na Maane! branding
🎨 Style: Clean, minimal, iOS/Android appropriate
```

### **Color Palette**:
- **Primary Orange**: #e67e22
- **Accent Orange**: #d35400  
- **White/Light**: #ffffff
- **Dark Accent**: #2c3e50

## Implementation Steps

1. **Design the icon** using one of the tools above
2. **Export in required sizes** (1024×1024 for main files)
3. **Replace files** in `/assets/` directory:
   - `icon.png`
   - `adaptive-icon.png` 
   - `splash-icon.png`
   - `favicon.png`
4. **Test the icon** by rebuilding the app
5. **Generate IPA** with new icon using the build script

## Next Steps

Would you like me to:
1. Create a simple programmatic icon design?
2. Help you find specific design tools?
3. Generate the exact specifications for a designer?
4. Create a template design concept?
