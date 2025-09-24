// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Mock localStorage for tests
const localStorageMock = {
  store: {},
  getItem(key) {
    return this.store[key] || null
  },
  setItem(key, value) {
    this.store[key] = value.toString()
  },
  removeItem(key) {
    delete this.store[key]
  },
  clear() {
    this.store = {}
  }
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock URL for tests
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn().mockImplementation(() => 'mock-url')
})

Object.defineProperty(window.URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn()
})

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve())
  }
})

// Mock document methods for download tests
const mockElement = {
  href: '',
  download: '',
  click: jest.fn(),
  style: {},
  setAttribute: jest.fn(),
  getAttribute: jest.fn()
}

Object.defineProperty(document, 'createElement', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockElement)
})

Object.defineProperty(document.body, 'appendChild', {
  writable: true,
  value: jest.fn()
})

Object.defineProperty(document.body, 'removeChild', {
  writable: true,
  value: jest.fn()
})