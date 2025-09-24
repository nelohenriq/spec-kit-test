// Provider types and interfaces for AI model management

export type ProviderType = 'gemini' | 'groq' | 'ollama' | 'anthropic' | 'grok' | 'custom';

export type PredefinedProviderType = 'gemini' | 'groq' | 'ollama' | 'anthropic' | 'grok';

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  contextLength?: number;
  maxTokens?: number;
}

export interface ProviderConfig {
  id: string;
  type: ProviderType;
  name: string;
  apiKey?: string; // For API-based providers
  baseUrl?: string; // For custom endpoints
  isActive: boolean;
  models: ModelInfo[];
  selectedModel?: string;
  lastTested?: Date;
  isConnected?: boolean;
  isCustom?: boolean; // For user-defined providers
  customName?: string; // Custom display name
}

export interface ProviderTestResult {
  success: boolean;
  message: string;
  models?: ModelInfo[];
  error?: string;
}

export interface ProviderManager {
  // Provider management
  getProviders(): Promise<ProviderConfig[]>;
  addProvider(config: Omit<ProviderConfig, 'id' | 'models' | 'lastTested' | 'isConnected'>): Promise<ProviderConfig>;
  updateProvider(id: string, config: Partial<ProviderConfig>): Promise<ProviderConfig>;
  removeProvider(id: string): Promise<void>;
  setActiveProvider(id: string): Promise<void>;

  // Model management
  getAvailableModels(providerId: string): Promise<ModelInfo[]>;
  setSelectedModel(providerId: string, modelId: string): Promise<void>;

  // Connection testing
  testProviderConnection(providerId: string): Promise<ProviderTestResult>;

  // API key management
  setApiKey(providerId: string, apiKey: string): Promise<void>;
  getApiKey(providerId: string): Promise<string | null>;
}

// Provider-specific configurations
export interface GeminiConfig extends ProviderConfig {
  type: 'gemini';
}

export interface GroqConfig extends ProviderConfig {
  type: 'groq';
  apiKey: string; // Required for Groq
}

export interface OllamaConfig extends ProviderConfig {
  type: 'ollama';
  baseUrl: string; // Default: http://localhost:11434
}

// Union type for all provider configs
export type AnyProviderConfig = GeminiConfig | GroqConfig | OllamaConfig;

// Default configurations
export const DEFAULT_PROVIDERS: Omit<ProviderConfig, 'id'>[] = [
  {
    type: 'gemini',
    name: 'Google Gemini',
    isActive: true,
    models: [
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Fast and efficient model for general tasks',
        contextLength: 1048576,
        maxTokens: 8192
      }
    ],
    selectedModel: 'gemini-2.5-flash'
  },
  {
    type: 'groq',
    name: 'Groq',
    isActive: false,
    models: [],
    apiKey: '',
    baseUrl: 'https://api.groq.com/openai/v1'
  },
  {
    type: 'anthropic',
    name: 'Anthropic Claude',
    isActive: false,
    models: [],
    apiKey: '',
    baseUrl: 'https://api.anthropic.com/v1'
  },
  {
    type: 'grok',
    name: 'Grok',
    isActive: false,
    models: [],
    apiKey: '',
    baseUrl: 'https://api.grok.com/v1'
  },
  {
    type: 'ollama',
    name: 'Ollama (Local)',
    isActive: false,
    models: [],
    baseUrl: 'http://localhost:11434'
  }
];