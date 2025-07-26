# Track View Feature

## Overview
The track view page (`/view/[id]`) displays detailed information about a music track, including artwork, metadata, and controls for playback.

## Features

### Track Information Display
- **Artwork**: High-resolution track artwork with fallback to music icon
- **Title & Artist**: Primary track information
- **Album**: Album information (if available)
- **Duration**: Track length in MM:SS format
- **Source**: Platform/service information
- **Type**: Track vs Live Stream indicator
- **Statistics**: Views, likes, upload date (if available)
- **Description**: Track description/notes
- **Tags**: Genre and category tags

### Controls
- **Play/Pause**: Direct playback control
- **Add to Queue**: Add track to current playlist
- **Like**: Save track to user's liked songs
- **Share**: Share track link
- **Open Source**: Navigate to original source URL

### Navigation
Tracks can be accessed from:
- Search results (click on track info)
- Recently played tracks (homepage)
- Any track list component

## Usage

### From Search Results
1. Search for a track in `/search`
2. Click on the track title/artist area
3. View detailed track information

### From Homepage
1. View recently played tracks on homepage
2. Click on any track card
3. View detailed track information

### Direct URL
```
/view/[trackId]
```
Where `trackId` is a URL-encoded track identifier (URI, URL, or title+artist)

## Technical Implementation

### API Integration
- Uses `/api/music/search` to fetch track details
- Searches by track ID, URI, or title+artist combination
- Falls back gracefully if track not found

### Track ID Generation
Track IDs are generated using this priority:
1. `track.uri` (primary identifier)
2. `track.url` (secondary identifier)  
3. `track.id` (fallback identifier)
4. `"${title} ${artist}"` (search fallback)

### Accessibility
- Full keyboard navigation support
- ARIA labels for screen readers
- Semantic HTML structure
- Focus management

## Error Handling
- Loading states with skeleton UI
- Error messages for failed requests
- Graceful fallbacks for missing data
- Back navigation support

## Future Enhancements
- Track recommendations
- Related tracks from same artist/album
- Lyrics display
- Audio preview
- Social sharing options
- Track history/analytics
