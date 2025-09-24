export interface UserPreferences {
  interests: string[]
  summaryLength: 'short' | 'medium' | 'detailed'
  exportFormat: 'markdown' | 'json'
}

const STORAGE_KEYS = {
  PREFERENCES: 'daily-briefing-preferences',
  INTERESTS: 'daily-briefing-interests',
} as const

export class StorageService {
  private static instance: StorageService

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  // Generic storage methods
  private getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue

    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error)
      return defaultValue
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error)
    }
  }

  // User preferences methods
  getPreferences(): UserPreferences {
    return this.getItem(STORAGE_KEYS.PREFERENCES, {
      interests: [],
      summaryLength: 'medium',
      exportFormat: 'markdown',
    })
  }

  setPreferences(preferences: Partial<UserPreferences>): void {
    const current = this.getPreferences()
    const updated = { ...current, ...preferences }
    this.setItem(STORAGE_KEYS.PREFERENCES, updated)
  }

  // Interests methods
  getInterests(): string[] {
    return this.getItem(STORAGE_KEYS.INTERESTS, [])
  }

  setInterests(interests: string[]): void {
    this.setItem(STORAGE_KEYS.INTERESTS, interests)
    // Also update preferences
    this.setPreferences({ interests })
  }

  addInterest(interest: string): void {
    const current = this.getInterests()
    if (!current.includes(interest)) {
      const updated = [...current, interest]
      this.setInterests(updated)
    }
  }

  removeInterest(interest: string): void {
    const current = this.getInterests()
    const updated = current.filter(i => i !== interest)
    this.setInterests(updated)
  }

  // Utility methods
  clearAll(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES)
      localStorage.removeItem(STORAGE_KEYS.INTERESTS)
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  exportData(): UserPreferences {
    return this.getPreferences()
  }

  importData(data: UserPreferences): void {
    this.setItem(STORAGE_KEYS.PREFERENCES, data)
    this.setItem(STORAGE_KEYS.INTERESTS, data.interests)
  }
}

// Export singleton instance
export const storage = StorageService.getInstance()