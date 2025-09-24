'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { providerManager } from '@/lib/provider-manager';
import { Loader2, CheckCircle, XCircle, Eye, EyeOff, Plus } from 'lucide-react';

interface AddCustomProviderProps {
  onProviderAdded: () => void;
}

export function AddCustomProvider({ onProviderAdded }: AddCustomProviderProps) {
  const [providerName, setProviderName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    if (!providerName.trim() || !baseUrl.trim() || !apiKey.trim()) {
      setTestResult({ success: false, message: 'Please fill in all fields' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Create a temporary provider config for testing
      const tempProvider = {
        id: `temp-${Date.now()}`,
        type: 'custom' as const,
        name: providerName.trim(),
        baseUrl: baseUrl.trim(),
        apiKey: apiKey.trim(),
        isActive: false,
        models: [],
        isConnected: false
      };

      const result = await providerManager.testProviderConnection(tempProvider.id);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleAddProvider = async () => {
    if (!providerName.trim() || !baseUrl.trim() || !apiKey.trim()) {
      setTestResult({ success: false, message: 'Please fill in all fields' });
      return;
    }

    if (!testResult?.success) {
      setTestResult({ success: false, message: 'Please test the connection first' });
      return;
    }

    setIsAdding(true);

    try {
      await providerManager.addProvider({
        type: 'custom',
        name: providerName.trim(),
        baseUrl: baseUrl.trim(),
        apiKey: apiKey.trim(),
        isActive: false
      });

      // Reset form
      setProviderName('');
      setBaseUrl('');
      setApiKey('');
      setTestResult(null);

      onProviderAdded();
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add provider'
      });
    } finally {
      setIsAdding(false);
    }
  };

  const isFormValid = providerName.trim() && baseUrl.trim() && apiKey.trim();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          <div>
            <CardTitle>Add Custom Provider</CardTitle>
            <CardDescription>
              Add a custom AI provider by specifying the name, base URL, and API key
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="providerName" className="text-sm font-medium">
            Provider Name *
          </label>
          <Input
            id="providerName"
            type="text"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            placeholder="My Custom Provider"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="baseUrl" className="text-sm font-medium">
            Base URL *
          </label>
          <Input
            id="baseUrl"
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.example.com/v1"
          />
          <p className="text-sm text-muted-foreground">
            The base URL for the API endpoint (e.g., https://api.example.com/v1)
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="apiKey" className="text-sm font-medium">
            API Key *
          </label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
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
            disabled={isTesting || !isFormValid}
            className="flex-1"
          >
            {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test Connection
          </Button>
          <Button
            onClick={handleAddProvider}
            disabled={isAdding || !isFormValid || !testResult?.success}
            className="flex-1"
          >
            {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Provider
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}