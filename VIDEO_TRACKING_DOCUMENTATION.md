# NYU Instagram Video Reel Study - Tracking Documentation

## 📊 Overview

This document explains the comprehensive video tracking system implemented for the NYU Instagram video advertisement study. The system captures detailed video engagement metrics using Google Analytics 4 (GA4) with millisecond precision timing and anti-skip detection.

## 🎯 Study Configuration

- **GA4 Property ID:** `G-XXXXXXXX` (Update with video study measurement ID)
- **Study Identifier:** `instagram_study` (tagged on all events)
- **Participant Identification:** PROLIFIC_ID as `user_id`
- **Session Independence:** No localStorage - each visit is a fresh session
- **Video Support:** HTML5 video and Vimeo iframe compatibility
- **Data Processing:** Real-time to DebugView, 24-48 hours to Reports

## 🆔 Participant Identification System

### **PROLIFIC_ID Collection:**
```javascript
Method 1: URL Parameter (Recommended)
https://your-site.com/?PROLIFIC_ID=PARTICIPANT_123
→ No prompt, direct identification

Method 2: Manual Entry  
https://your-site.com/
→ Prompts: "Please enter your Participant ID:"
→ No storage, fresh prompt every session
```

### **User ID Integration:**
- Every GA4 event includes `user_id: "PROLIFIC_ID_123"`
- Enables individual participant video engagement analysis
- Links all video interactions to specific study participant

## 📋 Complete Video Event Tracking System

### **1. Session Start - `page_view`**
**When:** User loads the video reel page
**Parameters:**
```javascript
{
  event: 'page_view',
  user_id: 'PROLIFIC_ID_123',
  page_title: 'Instagram Reels - NYU Video Study',
  page_location: 'https://site.com/?PROLIFIC_ID=123',
  page_path: '/index.html',
  study_id: 'instagram_study'
}
```
**Research Value:** Session initiation tracking

### **2. Video Start - `video_start`**
**When:** User begins watching the video (first play)
**Parameters:**
```javascript
{
  event: 'video_start',
  user_id: 'PROLIFIC_ID_123',
  video_type: 'html5',           // 'html5' or 'vimeo'
  duration_s: 30,                // Video length in seconds
  video_id: 'nyu_ad_1',         // Video identifier
  study_id: 'instagram_study'
}
```
**Research Value:** Measures actual video engagement initiation

### **3. Video Progress - `video_progress`** (KEY METRIC)
**When:** User reaches specific time milestones while watching
**Parameters:**
```javascript
{
  event: 'video_progress',
  user_id: 'PROLIFIC_ID_123',
  second: 15,                    // Milestone reached (5,10,15,30,45,60,75,90)
  duration_s: 30,                // Total video length
  video_type: 'html5',
  video_id: 'nyu_ad_1',
  study_id: 'instagram_study'
}
```

**Progress Milestones (Configurable):**
```javascript
const PROGRESS_SECONDS = [5, 10, 15, 30, 45, 60, 75, 90];
```

**Research Value:** Precise attention measurement at specific timepoints

### **4. Video Complete - `video_complete`** (COMPREHENSIVE METRIC)
**When:** User finishes video or leaves page
**Parameters:**
```javascript
{
  event: 'video_complete',
  user_id: 'PROLIFIC_ID_123',
  watched_ms: 25000,             // ACTUAL time spent watching (not duration)
  percent_watched: 85,           // How far through video they got
  max_watched_s: 25.5,           // Furthest point reached (anti-skip)
  duration_s: 30,                // Video length
  video_type: 'html5',
  video_id: 'nyu_ad_1',
  completed_naturally: true,     // Did they watch to end vs. leave page?
  study_id: 'instagram_study'
}
```

**Key Metrics Explained:**
- **`watched_ms`**: Total actual viewing time (excludes skipped portions)
- **`percent_watched`**: Highest percentage of video reached
- **`max_watched_s`**: Furthest timestamp reached (prevents skip inflation)
- **`completed_naturally`**: True if video ended normally, false if page left

**Research Value:** Complete video engagement summary with anti-skip protection

### **5. Mute Toggle - `video_mute_toggle`**
**When:** User clicks video to mute/unmute
**Parameters:**
```javascript
{
  event: 'video_mute_toggle',
  user_id: 'PROLIFIC_ID_123',
  muted: true,                   // Current mute state after toggle
  video_current_time: 12.5,      // When in video this occurred
  video_id: 'nyu_ad_1',
  study_id: 'instagram_study'
}
```
**Research Value:** Audio engagement preferences

### **6. CTA Interactions - `cta_click`**
**When:** User clicks like, comment, share, follow buttons
**Parameters:**
```javascript
{
  event: 'cta_click',
  user_id: 'PROLIFIC_ID_123',
  cta_type: 'like',              // 'like', 'comment', 'share', 'follow', 'more'
  video_id: 'nyu_ad_1',
  video_current_time: 18.2,      // When in video this occurred
  study_id: 'instagram_study'
}
```
**Research Value:** Action-driven engagement measurement

## 🎬 Video Content Details

### **NYU Advertisement Video:**
- **File:** `nyu ad 1.mp4`
- **Video ID:** `nyu_ad_1`
- **Content:** NYU Stern MBA promotional video
- **Format:** MP4, optimized for web playback
- **Interface:** Instagram Reels-style presentation

## ⏱️ Anti-Skip Detection System

### **How It Works:**
```javascript
// Traditional GA4: Reports 40s as "watched" even if user skipped from 10s to 40s
// Our system: Only counts continuously watched time

User watches 0-10s, skips to 30s, watches 30-35s:
- Traditional tracking: 35s "watched" 
- Our system: 15s actually watched (10s + 5s)
- max_watched_s: 35s (furthest point reached)
- watched_ms: 15000 (actual viewing time)
```

### **Research Benefits:**
- **Accurate attention measurement** - distinguishes actual viewing from skipping
- **Quality assessment** - identifies engaged vs. superficial viewing
- **Behavioral insights** - understanding of viewing patterns

## 📊 Video Engagement Analysis

### **Individual Participant Analysis:**
```
PROLIFIC_ID_123's Video Journey:
14:30:15 → page_view (session start)
14:30:18 → video_start (duration: 30s, type: html5)
14:30:23 → video_progress (5s milestone reached)
14:30:28 → video_progress (10s milestone reached)  
14:30:33 → video_progress (15s milestone reached)
14:30:35 → video_mute_toggle (muted: false, at 17s)
14:30:41 → cta_click (type: like, at 23s)
14:30:48 → video_complete (watched: 25000ms, percent: 83%, max: 25s)
```

### **Engagement Quality Metrics:**
```
High Engagement:
- watched_ms close to duration_s
- Multiple progress milestones reached
- CTA interactions during video
- completed_naturally: true

Low Engagement:  
- watched_ms much less than duration_s
- Few progress milestones
- No CTA interactions
- completed_naturally: false
```

## 🔬 Research Applications

### **Attention Measurement:**
- **Precise viewing time** - Actual seconds of attention (not estimates)
- **Engagement points** - When users interact during video
- **Drop-off analysis** - Where users stop watching
- **Quality assessment** - Deep vs. surface engagement

### **Behavioral Analysis:**
- **Viewing patterns** - Continuous vs. fragmented watching
- **Audio preferences** - Mute/unmute behavior timing
- **Action triggers** - What moments drive CTA clicks
- **Completion factors** - What predicts full video viewing

### **Advertisement Effectiveness:**
- **Attention capture** - How long video holds interest
- **Message delivery** - Which parts get watched most
- **Call-to-action success** - When and why users engage
- **Overall impact** - Complete engagement measurement

## 🛠️ Technical Implementation

### **Video Detection:**
```javascript
// Supports both HTML5 video and Vimeo iframe
const html5Video = document.querySelector('#adVideo');
const vimeoFrame = document.querySelector('#vimeoFrame');

// Automatically detects and sets up appropriate tracking
```

### **Progress Tracking:**
```javascript
// Configurable milestone array
const PROGRESS_SECONDS = [5, 10, 15, 30, 45, 60, 75, 90];

// Only fires once per milestone per session
if (currentTime >= 15 && !progressTracked.has(15)) {
    trackVideoProgress(15);
    progressTracked.add(15);
}
```

### **Anti-Skip Logic:**
```javascript
// Only counts forward progress for actual watch time
if (currentTime > maxWatched) {
    maxWatched = currentTime;
}

// Uses maxWatched for progress, not currentTime
trackVideoProgress(maxWatched);
```

## 📈 Data Export and Analysis

### **Required Custom Dimensions Setup:**
```
Admin → Custom Definitions → Create Custom Dimension:

Dimension 1:
- Name: "Video Progress Second"  
- Scope: "Event"
- Event parameter: "second"

Dimension 2:
- Name: "Watched MS"
- Scope: "Event" 
- Event parameter: "watched_ms"

Dimension 3:
- Name: "Percent Watched"
- Scope: "Event"
- Event parameter: "percent_watched"

Dimension 4:
- Name: "Max Watched Seconds"
- Scope: "Event"
- Event parameter: "max_watched_s"

Dimension 5:
- Name: "Video ID"
- Scope: "Event"
- Event parameter: "video_id"

Dimension 6:
- Name: "CTA Type"
- Scope: "Event"
- Event parameter: "cta_type"
```

### **Expected CSV Output:**
```csv
User ID,Event Name,Video ID,Second,Watched MS,Percent Watched,Max Watched S,CTA Type,Event Count
PROLIFIC_ID_123,video_start,nyu_ad_1,,,,,1
PROLIFIC_ID_123,video_progress,nyu_ad_1,5,,,,1  
PROLIFIC_ID_123,video_progress,nyu_ad_1,10,,,,1
PROLIFIC_ID_123,video_progress,nyu_ad_1,15,,,,1
PROLIFIC_ID_123,cta_click,nyu_ad_1,,,,like,1
PROLIFIC_ID_123,video_complete,nyu_ad_1,,25000,83,25,,1
PROLIFIC_ID_456,video_start,nyu_ad_1,,,,,1
PROLIFIC_ID_456,video_progress,nyu_ad_1,5,,,,1
PROLIFIC_ID_456,video_complete,nyu_ad_1,,8000,27,8,,1
```

### **Analysis Calculations:**
```excel
// Convert watched_ms to seconds
=B2/1000

// Calculate engagement rate  
=(watched_ms/1000)/(duration_s)

// Determine quality engagement
=IF(percent_watched>=75,"High",IF(percent_watched>=50,"Medium","Low"))
```

## 🎯 Study Insights Available

### **Individual Metrics:**
- **Exact viewing time** per participant (milliseconds)
- **Attention span** - how long each person watches
- **Engagement quality** - deep vs. surface viewing
- **Interaction timing** - when CTAs are clicked
- **Audio preferences** - mute/unmute patterns

### **Aggregate Analysis:**
- **Average viewing time** across all participants
- **Drop-off points** - where most people stop watching
- **Engagement distribution** - quality viewing patterns
- **CTA effectiveness** - which actions drive engagement
- **Completion predictors** - factors affecting full viewing

### **Behavioral Patterns:**
- **Viewing styles** - continuous vs. fragmented attention
- **Engagement triggers** - what moments drive interaction
- **Quality indicators** - markers of genuine interest
- **Attention sustainability** - how long video holds interest

## 🔍 Quality Assurance

### **Data Validation:**
- **DebugView verification** - Real-time event monitoring
- **Anti-skip confirmation** - Accurate time measurement
- **Participant linking** - PROLIFIC_ID consistency
- **Session integrity** - Independent tracking per participant

### **Research Standards:**
- **Millisecond precision** - Research-grade timing accuracy
- **No data contamination** - Fresh sessions every time
- **Complete coverage** - All video interactions captured
- **Individual tracking** - Every participant journey recorded

---

## 📞 Support and Troubleshooting

### **Common Issues:**
1. **Video not playing** - Check video file path and format
2. **Events in DebugView but not Reports** - Normal 24-48 hour processing delay
3. **Missing custom parameters** - Create Custom Dimensions first
4. **Autoplay blocked** - Users must click "Tap to Start"

### **Data Verification:**
- Check DebugView for real-time video event confirmation
- Verify Custom Dimensions are created for video parameters
- Confirm participant ID appears in all video events
- Test video playback and interaction tracking

**This video tracking system provides comprehensive, research-grade data for analyzing participant engagement with NYU video advertisements with unprecedented precision, anti-skip protection, and detailed behavioral insights.**
