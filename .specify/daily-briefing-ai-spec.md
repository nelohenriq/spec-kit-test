# Daily Briefing AI Specification

## Overview
Daily Briefing AI is a web application that leverages the Google Gemini API to deliver personalized news briefings and satirical tweets.

## Features

### Core Functionality
- **Personalized Briefings**: Generate briefings based on user-defined interests
- **Trending Now Tab**: Auto-identify top 3 global news topics from the last 24 hours
- **Adjustable Summary Length**: Support for Short, Medium, and Detailed summary formats
- **Google Search Grounding**: All summaries must be grounded in Google Search results with cited sources
- **Satirical Tweet Generation**: Automatically generate three witty, satirical tweets per topic

### Technical Requirements
- **Data Persistence**: User preferences stored in localStorage only
- **Export Functionality**: Downloadable briefings in Markdown format
- **API Integration**: Google Gemini API for content generation

## Implementation Notes
- Ensure all satirical content remains ethical and avoids sensitive topics
- Maintain source citations for all summaries
- Implement comprehensive test coverage for all features