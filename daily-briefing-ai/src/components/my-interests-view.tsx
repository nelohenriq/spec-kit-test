"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DownloadButton } from "@/components/ui/download-button"
import { storage } from "@/lib/storage"
import { providerManager } from "@/lib/provider-manager"
import type { BriefingResult } from "@/app/api/actions"
import type { ProviderConfig } from "@/lib/providers"
import { Settings, AlertCircle } from "lucide-react"

export function MyInterestsView() {
  const [interests, setInterests] = useState<string[]>([])
  const [newInterest, setNewInterest] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [generatedBriefings, setGeneratedBriefings] = useState<BriefingResult[]>([])
  const [availableProviders, setAvailableProviders] = useState<ProviderConfig[]>([])
  const [selectedProviderId, setSelectedProviderId] = useState<string>("")

  // Load interests from localStorage on component mount
  useEffect(() => {
    const savedInterests = storage.getInterests()
    setInterests(savedInterests)
    loadAvailableProviders()
  }, [])

  // Listen for storage changes to refresh providers when they are updated in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'daily-briefing-providers' || e.key === null) {
        loadAvailableProviders()
      }
    }

    const handleFocus = () => {
      // Refresh providers when tab gains focus (user might have switched tabs)
      loadAvailableProviders()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loadAvailableProviders = async () => {
    try {
      const providers = await providerManager.getProviders()
      const connectedProviders = providers.filter(p => p.isConnected)
      setAvailableProviders(connectedProviders)

      // Auto-select the first available provider
      if (connectedProviders.length > 0 && !selectedProviderId) {
        setSelectedProviderId(connectedProviders[0].id)
      }
    } catch (error) {
      console.error("Error loading providers:", error)
    }
  }

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
    if (interests.length === 0 || !selectedProviderId) return

    setIsLoading(true)
    try {
      // Import and call the server action
      const { generateBriefing } = await import('@/app/api/actions')
      const results = await generateBriefing(interests, selectedProviderId)

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
          {/* Provider Selection */}
          {availableProviders.length > 0 ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Provider</label>
              <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an AI provider" />
                </SelectTrigger>
                <SelectContent>
                  {availableProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name} ({provider.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">No AI providers configured</p>
                  <p className="text-sm text-amber-700">
                    Go to the "AI Providers" tab to configure your API keys and test connections.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Enter an interest (e.g., artificial intelligence, climate change)"
              value={newInterest}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewInterest(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={availableProviders.length === 0}
            />
            <Button onClick={addInterest} disabled={availableProviders.length === 0}>Add</Button>
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