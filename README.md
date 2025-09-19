# NYU Video Reel Study - Instagram Research

This repository contains a standalone HTML page for displaying NYU video advertisements in an Instagram Reels format for behavioral research purposes.

## 🎬 Features

- **Instagram Reels UI**: Authentic Instagram video interface
- **NYU Video Ad**: High-quality video advertisement for NYU Stern MBA
- **Google Analytics 4**: Comprehensive video tracking with custom measurement ID
- **Advanced Video Analytics**: Tracks watch time, progress milestones, and user interactions
- **Anti-Skip Detection**: Distinguishes actual viewing time from skipped content
- **Research-Grade Precision**: Millisecond-level timing accuracy

## 📊 Analytics Tracked

### Video Engagement:
- **Video start/complete events**
- **Progress milestones** at 5, 10, 15, 30, 45, 60, 75, 90 seconds
- **Actual watch time** (with anti-skip detection)
- **Viewing completion percentage**
- **Mute/unmute interactions**

### User Interactions:
- **CTA clicks** (like, comment, share, follow)
- **Video tap interactions**
- **Session duration and quality**

### Participant Tracking:
- **PROLIFIC_ID integration** as user_id
- **Individual participant journeys**
- **Session independence** (no cross-contamination)

## 🚀 Usage

### For Participants:
1. **With PROLIFIC_ID**: Access via `https://your-site.com/?PROLIFIC_ID=PARTICIPANT_123`
2. **Manual Entry**: Visit `https://your-site.com/` and enter participant ID when prompted
3. **Click "Tap to Start"** to begin video experience
4. **Watch and interact** - all engagement is automatically tracked

### For Researchers:
1. **Update GA4 Measurement ID** in `js/ga-lite.js`
2. **Deploy** to web hosting platform (Vercel, Netlify, etc.)
3. **Monitor** real-time data in GA4 DebugView
4. **Export** detailed CSV reports after 24-48 hours

## 📁 Files Structure

```
nyu-video-reel-repo/
├── index.html                          # Main video reel page
├── js/
│   ├── ga-lite.js                      # Core GA4 tracking system
│   └── ga-video.js                     # Video-specific tracking
├── assets/
│   ├── videos/
│   │   └── nyu ad 1.mp4               # NYU video advertisement
│   └── images/
│       └── nyupfp.png                 # NYU profile picture
├── VIDEO_TRACKING_DOCUMENTATION.md    # Complete tracking documentation
└── README.md                          # This file
```

## ⚙️ Configuration

### GA4 Setup:
1. **Update Measurement ID** in `js/ga-lite.js`:
   ```javascript
   const GA_MEASUREMENT_ID = 'G-YOUR-ID-HERE';
   ```

2. **Create Custom Dimensions** in GA4:
   - Video Progress Second (`second`)
   - Watched MS (`watched_ms`)
   - Percent Watched (`percent_watched`)
   - Max Watched Seconds (`max_watched_s`)
   - Video ID (`video_id`)
   - CTA Type (`cta_type`)

### Video Configuration:
- **Progress milestones** can be customized in `js/ga-video.js`
- **Minimum engagement threshold** adjustable
- **Video file** easily replaceable in `assets/videos/`

## 📈 Data Analysis

### Key Metrics:
- **Actual viewing time** (anti-skip protected)
- **Engagement quality** (completion percentage)
- **Interaction timing** (when users click CTAs)
- **Drop-off points** (where users stop watching)

### Export Options:
- **GA4 Free Form Reports** for detailed analysis
- **CSV export** for statistical analysis
- **Individual participant tracking** via PROLIFIC_ID
- **Real-time monitoring** via DebugView

## 🔬 Research Applications

Perfect for studying:
- **Video advertisement effectiveness**
- **Attention span measurement** 
- **User engagement patterns**
- **Call-to-action optimization**
- **Behavioral response analysis**

## 🛠️ Technical Details

- **HTML5 video support** with fallback options
- **Vimeo compatibility** for hosted videos
- **Mobile-responsive design** 
- **Cross-browser compatibility**
- **No backend required** - pure client-side tracking

## 📊 Sample Data Output

```csv
User ID,Event,Video ID,Watched MS,Percent Watched,CTA Type
PROLIFIC_ID_123,video_start,nyu_ad_1,,,
PROLIFIC_ID_123,video_progress,nyu_ad_1,,,
PROLIFIC_ID_123,cta_click,nyu_ad_1,,,like
PROLIFIC_ID_123,video_complete,nyu_ad_1,25000,83,
```

## 🎯 Study Information

- **Study ID**: `instagram_study`
- **Content Type**: Video advertisement
- **Target**: NYU Stern MBA program  
- **Platform**: Instagram Reels interface
- **Data Collection**: Google Analytics 4

---

**Ready for deployment and comprehensive video engagement research!** 🚀
