"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DownloadButton } from "@/components/ui/download-button"
import { storage } from "@/lib/storage"
import type { BriefingResult } from "@/app/api/actions"

export function MyInterestsView() {
  const [interests, setInterests] = useState<string[]>([])
  const [newInterest, setNewInterest] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [generatedBriefings, setGeneratedBriefings] = useState<BriefingResult[]>([])

  // Load interests from localStorage on component mount
  useEffect(() => {
    const savedInterests = storage.getInterests()
    setInterests(savedInterests)
  }, [])

  const addInterest = () => {
    const trimmedInterest = newInterest.trim()
    if (trimmedInterest && !interests.includes(trimmedInterest)) {
      const updatedInterests = [...interests, trimmedInterest]
      setInterests(updatedInterests)
      storage.addInterest(trimmedInterest)
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    const updatedInterests = interests.filter((i: string) => i !== interest)
    setInterests(updatedInterests)
    storage.removeInterest(interest)
  }

  const handleGenerate = async () => {
    if (interests.length === 0) return

    setIsLoading(true)
    try {
      // Import and call the server action
      const { generateBriefing } = await import('@/app/api/actions')
      const results = await generateBriefing(interests)

      console.log("Generated briefings:", results)
      setGeneratedBriefings(results)
    } catch (error) {
      console.error("Error generating briefing:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addInterest()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Interests</CardTitle>
          <CardDescription>
            Add your interests to get personalized news briefings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter an interest (e.g., artificial intelligence, climate change)"
              value={newInterest}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewInterest(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={addInterest}>Add</Button>
          </div>

          {interests.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Your interests:</p>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest: string) => (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeInterest(interest)}
                  >
                    {interest} ×
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={interests.length === 0 || isLoading}
              className="flex-1"
            >
              {isLoading ? "Generating..." : "Generate Briefing"}
            </Button>
            <DownloadButton
              briefings={generatedBriefings}
              variant={generatedBriefings.length === 1 ? "single" : "multiple"}
              disabled={generatedBriefings.length === 0}
            />
          </div>
        </CardContent>
      </Card>

      {/* Generated Briefings Display */}
      {generatedBriefings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Briefings</CardTitle>
            <CardDescription>
              Your personalized briefings are ready
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedBriefings.map((briefing: BriefingResult, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-lg">{briefing.title}</h3>
                <div
                  className="text-sm text-muted-foreground prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: briefing.summary }}
                />
                <div className="space-y-2">
                  <p className="text-xs font-medium">Satirical Tweets:</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {briefing.tweets.map((tweet: string, tweetIndex: number) => (
                      <p key={tweetIndex}>• {tweet}</p>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium">Sources:</p>
                  <div className="flex flex-wrap gap-1">
                    {briefing.sources.map((source: string, sourceIndex: number) => (
                      <Badge variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}