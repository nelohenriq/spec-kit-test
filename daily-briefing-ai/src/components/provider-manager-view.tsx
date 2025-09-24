"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddCustomProvider } from "@/components/add-custom-provider"
import { providerManager } from "@/lib/provider-manager"
import { ProviderConfig } from "@/lib/providers"
import { Loader2, CheckCircle, XCircle, Eye, EyeOff, Settings, Plus } from "lucide-react"

export function ProviderManagerView() {
  const [providers, setProviders] = useState<ProviderConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [activeProviderTab, setActiveProviderTab] = useState("manage")

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      const providerList = await providerManager.getProviders()
      setProviders(providerList)
    } catch (error) {
      console.error("Error loading providers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProviderAdded = () => {
    loadProviders()
    setActiveProviderTab("manage")
  }

  const handleTestConnection = async (providerId: string) => {
    try {
      const result = await providerManager.testProviderConnection(providerId)
      await loadProviders() // Reload to get updated status
      return result
    } catch (error) {
      console.error("Error testing connection:", error)
      return { success: false, message: "Test failed" }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading providers...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Provider Management
          </CardTitle>
          <CardDescription>
            Configure your AI providers and API keys to generate personalized briefings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeProviderTab} onValueChange={setActiveProviderTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manage">Manage Providers</TabsTrigger>
              <TabsTrigger value="add-custom">Add Custom Provider</TabsTrigger>
            </TabsList>

            <TabsContent value="manage" className="mt-6">
              <div className="space-y-4">
                {providers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No providers configured yet.</p>
                    <p className="text-sm">Add a custom provider or configure existing ones.</p>
                  </div>
                ) : (
                  providers.map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      onTestConnection={handleTestConnection}
                      onReload={loadProviders}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="add-custom" className="mt-6">
              <AddCustomProvider onProviderAdded={handleProviderAdded} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

interface ProviderCardProps {
  provider: ProviderConfig
  onTestConnection: (providerId: string) => Promise<{ success: boolean; message: string }>
  onReload: () => void
}

function ProviderCard({ provider, onTestConnection, onReload }: ProviderCardProps) {
  const [isTesting, setIsTesting] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)

    try {
      const result = await onTestConnection(provider.id)
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, message: "Test failed" })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return

    try {
      await providerManager.setApiKey(provider.id, apiKey.trim())
      setApiKey("")
      onReload()
    } catch (error) {
      console.error("Error saving API key:", error)
    }
  }

  const getProviderDisplayName = (type: string) => {
    const names: Record<string, string> = {
      'anthropic': 'Anthropic Claude',
      'groq': 'Groq',
      'grok': 'Grok',
      'ollama': 'Ollama',
      'gemini': 'Google Gemini',
      'custom': provider.name || 'Custom Provider'
    }
    return names[type] || provider.name || 'Unknown Provider'
  }

  const getProviderDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      'anthropic': 'Access to Claude models for high-quality text generation',
      'groq': 'Fast inference with open-source models',
      'grok': 'xAI\'s helpful and truthful AI model',
      'ollama': 'Run models locally on your machine',
      'gemini': 'Google\'s advanced multimodal AI',
      'custom': 'Custom AI provider with your own endpoint'
    }
    return descriptions[type] || 'Custom AI provider'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-lg">{getProviderDisplayName(provider.type)}</CardTitle>
              <CardDescription>{getProviderDescription(provider.type)}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {provider.isConnected ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="h-3 w-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(provider.type === 'groq' || provider.type === 'gemini' || provider.type === 'anthropic' || provider.type === 'grok') && (
          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter ${getProviderDisplayName(provider.type)} API key`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
                Save
              </Button>
            </div>
          </div>
        )}

        {provider.type === 'ollama' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Base URL</label>
            <Input
              defaultValue={provider.baseUrl || 'http://localhost:11434'}
              placeholder="http://localhost:11434"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Ollama typically runs on localhost:11434
            </p>
          </div>
        )}

        {provider.type === 'custom' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Base URL</label>
            <Input
              defaultValue={provider.baseUrl}
              placeholder="https://api.example.com/v1"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Custom endpoint URL
            </p>
          </div>
        )}

        {testResult && (
          <div className={`p-3 rounded-md ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {testResult.message}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex-1"
          >
            {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test Connection
          </Button>
        </div>

        {provider.models.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Available Models</label>
            <div className="flex flex-wrap gap-1">
              {provider.models.map((model) => (
                <Badge key={model.id} variant="outline" className="text-xs">
                  {model.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}