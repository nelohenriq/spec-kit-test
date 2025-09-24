'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProviderConfig, ProviderType } from '@/lib/providers';
import { providerManager } from '@/lib/provider-manager';
import { Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

interface ProviderConfigComponentProps {
  provider: ProviderConfig;
  onProviderChange: (provider: ProviderConfig) => void;
}

interface ProviderConfigProps {
  provider: ProviderConfig;
  onUpdate: (provider: ProviderConfig) => void;
  onTest: (providerId: string) => Promise<void>;
  isTesting: boolean;
}

export function ProviderConfigComponent({ provider, onUpdate, onTest, isTesting }: ProviderConfigProps) {
  const [apiKey, setApiKey] = useState(provider.apiKey || '');
  const [baseUrl, setBaseUrl] = useState(provider.baseUrl || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedProvider = { ...provider };

      if (provider.type === 'groq' || provider.type === 'gemini') {
        if (apiKey !== provider.apiKey) {
          await providerManager.setApiKey(provider.id, apiKey);
          updatedProvider.apiKey = apiKey;
        }
      }

      if (provider.type === 'ollama' && baseUrl !== provider.baseUrl) {
        updatedProvider.baseUrl = baseUrl;
        await providerManager.updateProvider(provider.id, { baseUrl });
      }

      onUpdate(updatedProvider);
    } catch (error) {
      console.error('Failed to save provider configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    await onTest(provider.id);
  };

  const getProviderIcon = (type: ProviderType) => {
    switch (type) {
      case 'gemini':
        return '🤖';
      case 'groq':
        return '⚡';
      case 'ollama':
        return '🏠';
      default:
        return '🔧';
    }
  };

  const getProviderName = (type: ProviderType) => {
    switch (type) {
      case 'gemini':
        return 'Google Gemini';
      case 'groq':
        return 'Groq';
      case 'ollama':
        return 'Ollama (Local)';
      default:
        return 'Unknown Provider';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getProviderIcon(provider.type)}</span>
            <div>
              <CardTitle>{provider.name}</CardTitle>
              <CardDescription>{getProviderName(provider.type)}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={provider.isActive ? 'default' : 'secondary'}>
              {provider.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {provider.isConnected && (
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value="config" onValueChange={() => {}} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            {(provider.type === 'groq' || provider.type === 'gemini') && (
              <div className="space-y-2">
                <div className="text-sm font-medium">API Key</div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={`Enter ${getProviderName(provider.type)} API key`}
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
                </div>
              </div>
            )}

            {provider.type === 'ollama' && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Base URL</div>
                <Input
                  id="baseUrl"
                  type="url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                />
                <p className="text-sm text-muted-foreground">
                  Default: http://localhost:11434 (Ollama's default port)
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Configuration
              </Button>
              <Button variant="outline" onClick={handleTest} disabled={isTesting}>
                {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Connection
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Available Models</div>
              {provider.models.length > 0 ? (
                <div className="space-y-2">
                  {provider.models.map((model) => (
                    <div key={model.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{model.name}</p>
                        {model.description && (
                          <p className="text-sm text-muted-foreground">{model.description}</p>
                        )}
                      </div>
                      {provider.selectedModel === model.id && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No models available. Test the connection to fetch available models.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}