"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DownloadButton } from "@/components/ui/download-button"
import { storage } from "@/lib/storage"
import type { TrendingTopic } from "@/app/api/actions"

export function TrendingNowView() {
  const [isLoading, setIsLoading] = useState(false)
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [preferences] = useState(storage.getPreferences())

  // Load any cached trending topics on mount
  useEffect(() => {
    const cached = localStorage.getItem('daily-briefing-trending-cache')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        // Check if cache is less than 1 hour old
        if (Date.now() - parsed.timestamp < 3600000) {
          setTrendingTopics(parsed.topics)
        }
      } catch (error) {
        console.error('Error loading cached trending topics:', error)
      }
    }
  }, [])

  const handleGenerateTrending = async () => {
    setIsLoading(true)
    try {
      // Import and call the server actions
      const { generateTrendingBriefing } = await import('@/app/api/actions')
      const results = await generateTrendingBriefing()

      setTrendingTopics(results)

      // Cache the results
      const cacheData = {
        topics: results,
        timestamp: Date.now()
      }
      localStorage.setItem('daily-briefing-trending-cache', JSON.stringify(cacheData))

    } catch (error) {
      console.error("Error generating trending topics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trending Now</CardTitle>
          <CardDescription>
            Discover the top 3 global news topics from the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateTrending}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Analyzing..." : "Generate Trending Briefings"}
            </Button>
            <DownloadButton
              trendingTopics={trendingTopics}
              variant="trending"
              disabled={trendingTopics.length === 0}
            />
          </div>

          {trendingTopics.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-medium">Trending Topics:</p>
              {trendingTopics.map((topic: TrendingTopic) => (
                <Card key={topic.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{topic.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      className="text-sm text-muted-foreground prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: topic.summary }}
                    />

                    <div className="space-y-2">
                      <p className="text-xs font-medium">Satirical Tweets:</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {topic.tweets.map((tweet, tweetIndex) => (
                          <p key={tweetIndex}>• {tweet}</p>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium">Sources:</p>
                      <div className="space-y-1">
                        {topic.sources.map((source, sourceIndex) => (
                          <Badge variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}