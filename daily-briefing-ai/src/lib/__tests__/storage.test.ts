import { StorageService } from '../storage'

// Mock localStorage for testing
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) {
    return this.store[key] || null
  },
  setItem(key: string, value: string) {
    this.store[key] = value
  },
  removeItem(key: string) {
    delete this.store[key]
  },
  clear() {
    this.store = {}
  }
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('StorageService', () => {
  let storageService: StorageService

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear()
    // Get a fresh instance
    storageService = StorageService.getInstance()
  })

  describe('getPreferences', () => {
    it('should return default preferences when no data exists', () => {
      const preferences = storageService.getPreferences()

      expect(preferences).toEqual({
        interests: [],
        summaryLength: 'medium',
        exportFormat: 'markdown'
      })
    })

    it('should return saved preferences', () => {
      const testPreferences = {
        interests: ['AI', 'Technology'],
        summaryLength: 'short' as const,
        exportFormat: 'json' as const
      }

      localStorageMock.setItem('daily-briefing-preferences', JSON.stringify(testPreferences))

      const preferences = storageService.getPreferences()
      expect(preferences).toEqual(testPreferences)
    })
  })

  describe('setPreferences', () => {
    it('should update preferences', () => {
      const newPreferences = {
        interests: ['Machine Learning', 'Data Science'],
        summaryLength: 'detailed' as const
      }

      storageService.setPreferences(newPreferences)

      const saved = storageService.getPreferences()
      expect(saved.interests).toEqual(['Machine Learning', 'Data Science'])
      expect(saved.summaryLength).toBe('detailed')
      expect(saved.exportFormat).toBe('markdown') // Should keep existing value
    })
  })

  describe('getInterests', () => {
    it('should return empty array when no interests exist', () => {
      const interests = storageService.getInterests()
      expect(interests).toEqual([])
    })

    it('should return saved interests', () => {
      const testInterests = ['AI', 'Technology', 'Science']
      localStorageMock.setItem('daily-briefing-interests', JSON.stringify(testInterests))

      const interests = storageService.getInterests()
      expect(interests).toEqual(testInterests)
    })
  })

  describe('setInterests', () => {
    it('should save interests to localStorage', () => {
      const testInterests = ['Machine Learning', 'Deep Learning', 'Neural Networks']

      storageService.setInterests(testInterests)

      const saved = storageService.getInterests()
      expect(saved).toEqual(testInterests)
    })
  })

  describe('addInterest', () => {
    it('should add new interest to existing interests', () => {
      const existingInterests = ['AI', 'Technology']
      localStorageMock.setItem('daily-briefing-interests', JSON.stringify(existingInterests))

      storageService.addInterest('Machine Learning')

      const updated = storageService.getInterests()
      expect(updated).toEqual(['AI', 'Technology', 'Machine Learning'])
    })

    it('should not add duplicate interests', () => {
      const existingInterests = ['AI', 'Technology']
      localStorageMock.setItem('daily-briefing-interests', JSON.stringify(existingInterests))

      storageService.addInterest('AI') // Already exists

      const updated = storageService.getInterests()
      expect(updated).toEqual(['AI', 'Technology'])
    })
  })

  describe('removeInterest', () => {
    it('should remove interest from existing interests', () => {
      const existingInterests = ['AI', 'Technology', 'Machine Learning']
      localStorageMock.setItem('daily-briefing-interests', JSON.stringify(existingInterests))

      storageService.removeInterest('Technology')

      const updated = storageService.getInterests()
      expect(updated).toEqual(['AI', 'Machine Learning'])
    })

    it('should not fail when removing non-existent interest', () => {
      const existingInterests = ['AI', 'Technology']
      localStorageMock.setItem('daily-briefing-interests', JSON.stringify(existingInterests))

      storageService.removeInterest('Non-existent')

      const updated = storageService.getInterests()
      expect(updated).toEqual(['AI', 'Technology'])
    })
  })

  describe('clearAll', () => {
    it('should clear all stored data', () => {
      const testPreferences = { interests: ['AI'], summaryLength: 'short' as const }
      const testInterests = ['Technology', 'Science']

      localStorageMock.setItem('daily-briefing-preferences', JSON.stringify(testPreferences))
      localStorageMock.setItem('daily-briefing-interests', JSON.stringify(testInterests))

      storageService.clearAll()

      expect(storageService.getPreferences()).toEqual({
        interests: [],
        summaryLength: 'medium',
        exportFormat: 'markdown'
      })
      expect(storageService.getInterests()).toEqual([])
    })
  })

  describe('exportData', () => {
    it('should export current preferences', () => {
      const testPreferences = {
        interests: ['AI', 'Technology'],
        summaryLength: 'short' as const,
        exportFormat: 'json' as const
      }

      localStorageMock.setItem('daily-briefing-preferences', JSON.stringify(testPreferences))

      const exported = storageService.exportData()
      expect(exported).toEqual(testPreferences)
    })
  })

  describe('importData', () => {
    it('should import preferences data', () => {
      const importData = {
        interests: ['Machine Learning', 'Deep Learning'],
        summaryLength: 'detailed' as const,
        exportFormat: 'markdown' as const
      }

      storageService.importData(importData)

      const preferences = storageService.getPreferences()
      const interests = storageService.getInterests()

      expect(preferences).toEqual(importData)
      expect(interests).toEqual(['Machine Learning', 'Deep Learning'])
    })
  })
})