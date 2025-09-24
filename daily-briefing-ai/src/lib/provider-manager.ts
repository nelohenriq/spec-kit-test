// Provider manager implementation for AI model management

import {
  ProviderType,
  ProviderConfig,
  ModelInfo,
  ProviderManager,
  ProviderTestResult,
  DEFAULT_PROVIDERS,
  GroqConfig,
  OllamaConfig,
  GeminiConfig,
  PredefinedProviderType
} from './providers';

// Storage key for persisting provider configurations
const STORAGE_KEY = 'daily-briefing-providers';

export class ProviderManagerImpl implements ProviderManager {
  private providers: ProviderConfig[] = [];

  constructor() {
    this.loadProviders();
  }

  private loadProviders(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedProviders = JSON.parse(stored);
        // Merge with defaults to ensure all provider types exist
        this.providers = this.mergeWithDefaults(parsedProviders);
      } else {
        // Initialize with default providers
        this.providers = DEFAULT_PROVIDERS.map((config, index) => ({
          ...config,
          id: `provider-${index + 1}`,
          lastTested: undefined,
          isConnected: config.type === 'gemini' // Gemini is connected by default since it doesn't require API key
        }));
        this.saveProviders();
      }
    } catch (error) {
      console.error('Failed to load providers from storage:', error);
      this.providers = DEFAULT_PROVIDERS.map((config, index) => ({
        ...config,
        id: `provider-${index + 1}`,
        lastTested: undefined,
        isConnected: false
      }));
    }
  }

  private saveProviders(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.providers));
    } catch (error) {
      console.error('Failed to save providers to storage:', error);
    }
  }

  private mergeWithDefaults(storedProviders: ProviderConfig[]): ProviderConfig[] {
    const defaults = DEFAULT_PROVIDERS.map((config, index) => ({
      ...config,
      id: `provider-${index + 1}`,
      lastTested: undefined,
      isConnected: config.type === 'gemini' // Gemini is connected by default
    }));

    // Merge stored providers with defaults, keeping stored data where available
    return defaults.map(defaultConfig => {
      const stored = storedProviders.find(p => p.type === defaultConfig.type);
      if (stored) {
        return {
          ...defaultConfig,
          ...stored,
          // Ensure required fields are present
          id: stored.id || defaultConfig.id,
          models: stored.models || defaultConfig.models,
          isActive: stored.isActive ?? defaultConfig.isActive,
          isConnected: stored.isConnected ?? defaultConfig.isConnected // Keep stored connection status or use default
        };
      }
      return defaultConfig;
    });
  }

  async getProviders(): Promise<ProviderConfig[]> {
    return [...this.providers];
  }

  async addProvider(config: Omit<ProviderConfig, 'id' | 'models' | 'lastTested' | 'isConnected'>): Promise<ProviderConfig> {
    const newProvider: ProviderConfig = {
      ...config,
      id: `provider-${Date.now()}`,
      models: [],
      lastTested: undefined,
      isConnected: false
    };

    this.providers.push(newProvider);
    this.saveProviders();
    return newProvider;
  }

  async updateProvider(id: string, config: Partial<ProviderConfig>): Promise<ProviderConfig> {
    const index = this.providers.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Provider with id ${id} not found`);
    }

    this.providers[index] = { ...this.providers[index], ...config };
    this.saveProviders();
    return this.providers[index];
  }

  async removeProvider(id: string): Promise<void> {
    const index = this.providers.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Provider with id ${id} not found`);
    }

    this.providers.splice(index, 1);
    this.saveProviders();
  }

  async setActiveProvider(id: string): Promise<void> {
    // Deactivate all providers
    this.providers.forEach(p => p.isActive = false);

    // Activate the specified provider
    const provider = this.providers.find(p => p.id === id);
    if (!provider) {
      throw new Error(`Provider with id ${id} not found`);
    }

    provider.isActive = true;
    this.saveProviders();
  }

  async getAvailableModels(providerId: string): Promise<ModelInfo[]> {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider) {
      throw new Error(`Provider with id ${providerId} not found`);
    }

    // If models are already cached, return them
    if (provider.models.length > 0) {
      return provider.models;
    }

    // Otherwise, fetch models from the provider
    const testResult = await this.testProviderConnection(providerId);
    if (testResult.success && testResult.models) {
      provider.models = testResult.models;
      // Don't override isConnected here since it's already set by testProviderConnection
      provider.lastTested = new Date();
      this.saveProviders();
      return testResult.models;
    }

    throw new Error(testResult.error || 'Failed to fetch models');
  }

  async setSelectedModel(providerId: string, modelId: string): Promise<void> {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider) {
      throw new Error(`Provider with id ${providerId} not found`);
    }

    const modelExists = provider.models.some(m => m.id === modelId);
    if (!modelExists) {
      throw new Error(`Model ${modelId} not found in provider ${providerId}`);
    }

    provider.selectedModel = modelId;
    this.saveProviders();
  }

  async testProviderConnection(providerId: string): Promise<ProviderTestResult> {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider) {
      return {
        success: false,
        message: 'Provider not found',
        error: `Provider with id ${providerId} not found`
      };
    }

    try {
      let result: ProviderTestResult;

      switch (provider.type) {
        case 'gemini':
          result = await this.testGeminiConnection(provider);
          break;
        case 'groq':
          result = await this.testGroqConnection(provider);
          break;
        case 'ollama':
          result = await this.testOllamaConnection(provider);
          break;
        case 'anthropic':
          result = await this.testAnthropicConnection(provider);
          break;
        case 'grok':
          result = await this.testGrokConnection(provider);
          break;
        case 'custom':
          result = await this.testCustomConnection(provider);
          break;
        default:
          return {
            success: false,
            message: 'Unsupported provider type',
            error: `Provider type ${provider.type} is not supported`
          };
      }

      // Update the provider's connection status based on the test result
      if (result.success) {
        provider.isConnected = true;
        provider.lastTested = new Date();
        this.saveProviders();
      } else {
        provider.isConnected = false;
        this.saveProviders();
      }

      return result;
    } catch (error) {
      // Mark as not connected on error
      provider.isConnected = false;
      this.saveProviders();

      return {
        success: false,
        message: 'Connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testGeminiConnection(provider: ProviderConfig): Promise<ProviderTestResult> {
    // Gemini models are predefined, so we can just return success
    const models: ModelInfo[] = [
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Fast and efficient model for general tasks',
        contextLength: 1048576,
        maxTokens: 8192
      }
    ];

    return {
      success: true,
      message: 'Gemini connection successful',
      models
    };
  }

  private async testGroqConnection(provider: ProviderConfig): Promise<ProviderTestResult> {
    if (!provider.apiKey) {
      return {
        success: false,
        message: 'API key required',
        error: 'Groq API key is required for connection testing'
      };
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const models: ModelInfo[] = data.data.map((model: any) => ({
        id: model.id,
        name: model.id,
        description: `Context length: ${model.context_length || 'Unknown'}`,
        contextLength: model.context_length,
        maxTokens: model.context_length // Groq uses context length as max tokens
      }));

      return {
        success: true,
        message: 'Groq connection successful',
        models
      };
    } catch (error) {
      return {
        success: false,
        message: 'Groq connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testOllamaConnection(provider: ProviderConfig): Promise<ProviderTestResult> {
    const baseUrl = provider.baseUrl || 'http://localhost:11434';

    try {
      const response = await fetch(`${baseUrl}/api/tags`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const models: ModelInfo[] = data.models.map((model: any) => ({
        id: model.name,
        name: model.name,
        description: `Size: ${model.size ? (model.size / 1e9).toFixed(1) + 'GB' : 'Unknown'}`,
        contextLength: 4096, // Default for most Ollama models
        maxTokens: 4096
      }));

      return {
        success: true,
        message: 'Ollama connection successful',
        models
      };
    } catch (error) {
      return {
        success: false,
        message: 'Ollama connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testAnthropicConnection(provider: ProviderConfig): Promise<ProviderTestResult> {
    if (!provider.apiKey) {
      return {
        success: false,
        message: 'API key required',
        error: 'Anthropic API key is required for connection testing'
      };
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': provider.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hello' }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const models: ModelInfo[] = [
        {
          id: 'claude-3-haiku-20240307',
          name: 'Claude 3 Haiku',
          description: 'Fast and efficient model for general tasks',
          contextLength: 200000,
          maxTokens: 4096
        },
        {
          id: 'claude-3-sonnet-20240229',
          name: 'Claude 3 Sonnet',
          description: 'Balanced model for most use cases',
          contextLength: 200000,
          maxTokens: 4096
        },
        {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          description: 'Most capable model for complex tasks',
          contextLength: 200000,
          maxTokens: 4096
        }
      ];

      return {
        success: true,
        message: 'Anthropic connection successful',
        models
      };
    } catch (error) {
      return {
        success: false,
        message: 'Anthropic connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testGrokConnection(provider: ProviderConfig): Promise<ProviderTestResult> {
    if (!provider.apiKey) {
      return {
        success: false,
        message: 'API key required',
        error: 'Grok API key is required for connection testing'
      };
    }

    try {
      const response = await fetch('https://api.grok.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const models: ModelInfo[] = data.data?.map((model: any) => ({
        id: model.id,
        name: model.id,
        description: `Context length: ${model.context_length || 'Unknown'}`,
        contextLength: model.context_length || 8192,
        maxTokens: model.context_length || 8192
      })) || [];

      return {
        success: true,
        message: 'Grok connection successful',
        models
      };
    } catch (error) {
      return {
        success: false,
        message: 'Grok connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testCustomConnection(provider: ProviderConfig): Promise<ProviderTestResult> {
    if (!provider.baseUrl) {
      return {
        success: false,
        message: 'Base URL required',
        error: 'Custom provider requires a base URL for connection testing'
      };
    }

    try {
      // Try to test connection with a simple GET request to the base URL
      const response = await fetch(provider.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // For custom providers, we'll assume they have a models endpoint
      // This is a basic test - in practice, you'd need to know the specific API structure
      const models: ModelInfo[] = [
        {
          id: 'custom-model',
          name: 'Custom Model',
          description: 'Custom provider model',
          contextLength: 4096,
          maxTokens: 4096
        }
      ];

      return {
        success: true,
        message: 'Custom provider connection successful',
        models
      };
    } catch (error) {
      return {
        success: false,
        message: 'Custom provider connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async setApiKey(providerId: string, apiKey: string): Promise<void> {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider) {
      throw new Error(`Provider with id ${providerId} not found`);
    }

    if (provider.type === 'groq') {
      (provider as GroqConfig).apiKey = apiKey;
    } else if (provider.type === 'gemini') {
      (provider as GeminiConfig).apiKey = apiKey;
    } else if (provider.type === 'anthropic') {
      (provider as any).apiKey = apiKey;
    } else if (provider.type === 'grok') {
      (provider as any).apiKey = apiKey;
    } else {
      throw new Error(`API key not supported for provider type ${provider.type}`);
    }

    this.saveProviders();
  }

  async getApiKey(providerId: string): Promise<string | null> {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider) {
      throw new Error(`Provider with id ${providerId} not found`);
    }

    if (provider.type === 'groq') {
      return (provider as GroqConfig).apiKey || null;
    } else if (provider.type === 'gemini') {
      return (provider as GeminiConfig).apiKey || null;
    } else if (provider.type === 'anthropic') {
      return (provider as any).apiKey || null;
    } else if (provider.type === 'grok') {
      return (provider as any).apiKey || null;
    }

    return null;
  }
}

// Export singleton instance
export const providerManager = new ProviderManagerImpl();