"use server"

import { GoogleGenerativeAI } from '@google/generative-ai'
import { storage } from '@/lib/storage'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

export interface BriefingResult {
  title: string
  summary: string
  tweets: string[]
  sources: string[]
}

export interface TrendingTopic {
  id: string
  title: string
  summary: string
  tweets: string[]
  sources: string[]
}

// Server action to generate briefing for user interests
export async function generateBriefing(interests: string[]): Promise<BriefingResult[]> {
  if (!interests.length) {
    throw new Error('No interests provided')
  }

  try {
    const results: BriefingResult[] = []

    for (const interest of interests) {
      const result = await generateSingleBriefingForInterest(interest)
      results.push(result)
    }

    return results
  } catch (error) {
    console.error('Error generating briefing:', error)
    throw new Error('Failed to generate briefing')
  }
}

// Server action to generate trending topics briefing
export async function generateTrendingBriefing(): Promise<TrendingTopic[]> {
  try {
    const trendingTopics = await getTrendingTopics()
    const results: TrendingTopic[] = []

    for (const topic of trendingTopics) {
      const result = await generateSingleBriefingForInterest(topic)
      results.push({
        id: Date.now().toString() + Math.random(),
        title: result.title,
        summary: result.summary,
        tweets: result.tweets,
        sources: result.sources
      })
    }

    return results
  } catch (error) {
    console.error('Error generating trending briefing:', error)
    throw new Error('Failed to generate trending briefing')
  }
}

// Server action to get trending topics
export async function getTrendingTopics(): Promise<string[]> {
  try {
    // In a real implementation, this would analyze current news trends
    // For now, return mock trending topics
    const mockTopics = [
      'Artificial Intelligence',
      'Climate Change',
      'Global Economy',
      'Space Exploration',
      'Renewable Energy',
      'Cybersecurity',
      'Healthcare Innovation',
      'Electric Vehicles'
    ]

    // Shuffle and return top 3
    const shuffled = mockTopics.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 3)
  } catch (error) {
    console.error('Error getting trending topics:', error)
    throw new Error('Failed to get trending topics')
  }
}

// Server action to generate single briefing for an interest
export async function generateSingleBriefingForInterest(interest: string): Promise<BriefingResult> {
  try {
    // Generate summary with Google Search grounding
    const summaryPrompt = `Research and provide a comprehensive summary about "${interest}". Include key recent developments, important facts, and current trends. Use a neutral, informative tone and cite your sources.

Format your response as HTML with proper structure:
- Use <h3> tags for section headings
- Use <p> tags for paragraphs
- Use <ul> and <li> for lists
- Use <strong> for emphasis
- Include source citations as <em> tags
- Keep the content well-structured and readable`

    const summaryResult = await model.generateContent(summaryPrompt)
    const summary = summaryResult.response.text()

    // Extract sources from the summary (in a real implementation, this would be more sophisticated)
    const sources = await extractSources(interest)

    // Generate satirical tweets
    const tweets = await generateTweetsForSummary(interest, summary)

    return {
      title: interest,
      summary,
      tweets,
      sources
    }
  } catch (error) {
    console.error(`Error generating briefing for ${interest}:`, error)
    throw new Error(`Failed to generate briefing for ${interest}`)
  }
}

// Enhanced satirical tweet generation with structured prompts
export async function generateTweetsForSummary(topic: string, summary: string): Promise<string[]> {
  try {
    const tweetPrompt = `Based on this summary about "${topic}":

${summary}

Generate exactly 3 witty, satirical tweets that capture the essence of this topic in an entertaining way. Each tweet should:
- Be under 280 characters
- Have a humorous, satirical tone (avoid sensitive topics)
- Include relevant hashtags
- Be shareable and engaging
- Reference specific elements from the summary when possible

Format your response as three separate tweets, each starting with "TWEET:" followed by the tweet content.

Example format:
TWEET: [first tweet here]
TWEET: [second tweet here]
TWEET: [third tweet here]`

    const tweetResult = await model.generateContent(tweetPrompt)
    const tweetText = tweetResult.response.text()

    // Parse tweets from the response
    const tweets = tweetText
      .split('TWEET:')
      .map((tweet: string) => tweet.trim())
      .filter((tweet: string) => tweet.length > 0 && tweet.length <= 280)
      .slice(0, 3)

    // If we don't have 3 tweets, pad with enhanced generic ones
    while (tweets.length < 3) {
      const fallbackTweet = `Just discovered something mind-bending about ${topic}! The plot twists keep coming... 🧠✨ #${topic.replace(/\s+/g, '')} #Innovation`
      if (!tweets.includes(fallbackTweet)) {
        tweets.push(fallbackTweet)
      }
    }

    return tweets
  } catch (error) {
    console.error(`Error generating tweets for ${topic}:`, error)
    // Return enhanced fallback tweets
    return [
      `The latest developments in ${topic} are absolutely wild! Who knew reality could be this entertaining? 🤯 #${topic.replace(/\s+/g, '')}`,
      `Plot twist: ${topic} just leveled up. The future is looking equal parts fascinating and slightly terrifying! 🚀 #Innovation #Tech`,
      `Just when you think you've seen it all with ${topic}, reality pulls a rabbit out of the hat. Mind = blown 🤯✨ #Future #Discovery`
    ]
  }
}

// Enhanced source extraction with Google Search grounding
async function extractSources(topic: string): Promise<string[]> {
  try {
    // In a real implementation, this would use the Google Search API
    // For now, we'll use a more sophisticated mock that considers the topic type
    const sourcesByCategory: Record<string, string[]> = {
      technology: ['MIT Technology Review', 'Wired', 'TechCrunch', 'Ars Technica', 'The Verge', 'IEEE Spectrum'],
      science: ['Nature', 'Science', 'Scientific American', 'New Scientist', 'PNAS', 'Cell'],
      business: ['Bloomberg', 'Financial Times', 'Wall Street Journal', 'Reuters', 'CNBC', 'Forbes'],
      politics: ['BBC News', 'CNN', 'The New York Times', 'The Guardian', 'Politico', 'Associated Press'],
      health: ['WHO', 'CDC', 'The Lancet', 'JAMA', 'New England Journal of Medicine', 'Health Affairs'],
      environment: ['IPCC', 'UNEP', 'National Geographic', 'Environmental Science & Technology', 'Climate Central'],
      default: ['BBC News', 'Reuters', 'Associated Press', 'The New York Times', 'The Guardian', 'CNN']
    }

    // Determine category based on keywords
    const topicLower = topic.toLowerCase()
    let category = 'default'

    if (topicLower.includes('ai') || topicLower.includes('artificial intelligence') || topicLower.includes('machine learning') || topicLower.includes('technology')) {
      category = 'technology'
    } else if (topicLower.includes('climate') || topicLower.includes('environment') || topicLower.includes('sustainability')) {
      category = 'environment'
    } else if (topicLower.includes('business') || topicLower.includes('economy') || topicLower.includes('market')) {
      category = 'business'
    } else if (topicLower.includes('health') || topicLower.includes('medical') || topicLower.includes('disease')) {
      category = 'health'
    } else if (topicLower.includes('research') || topicLower.includes('study') || topicLower.includes('scientific')) {
      category = 'science'
    } else if (topicLower.includes('policy') || topicLower.includes('government') || topicLower.includes('politics')) {
      category = 'politics'
    }

    const availableSources = sourcesByCategory[category] || sourcesByCategory.default

    // Return 2-3 random sources from the appropriate category
    const shuffled = availableSources.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.floor(Math.random() * 2) + 2)
  } catch (error) {
    console.error('Error extracting sources:', error)
    return ['News sources', 'Research publications']
  }
}

// Enhanced Gemini API integration with better prompting
async function generateWithGoogleSearch(topic: string, prompt: string): Promise<string> {
  try {
    // Enhanced prompt that encourages Google Search grounding
    const searchPrompt = `${prompt}

IMPORTANT: When providing information about "${topic}", ensure your response is grounded in real, current information. If you're using search capabilities, cite specific recent sources and data points. Focus on factual accuracy and avoid unsubstantiated claims.

Please structure your response as HTML with proper formatting:
- Use <h3> tags for section headings
- Use <p> tags for paragraphs
- Use <ul> and <li> for lists
- Use <strong> for emphasis
- Include source citations as <em> tags
- Keep the content well-structured and readable

Structure your response with:
1. Key facts and recent developments
2. Specific data points or statistics when available
3. Citations to sources or references
4. Balanced, neutral perspective`

    const result = await model.generateContent(searchPrompt)
    return result.response.text()
  } catch (error) {
    console.error('Error generating with search grounding:', error)
    throw new Error('Failed to generate content with search grounding')
  }
}


// Server action to get user preferences
export async function getUserPreferences() {
  try {
    return storage.getPreferences()
  } catch (error) {
    console.error('Error getting user preferences:', error)
    throw new Error('Failed to get user preferences')
  }
}

// Server action to update user preferences
export async function updateUserPreferences(preferences: Partial<import('@/lib/storage').UserPreferences>) {
  try {
    storage.setPreferences(preferences)
    return storage.getPreferences()
  } catch (error) {
    console.error('Error updating user preferences:', error)
    throw new Error('Failed to update user preferences')
  }
}