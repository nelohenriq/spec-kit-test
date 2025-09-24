import { MarkdownExporter, exportUtils } from '../markdown'
import type { BriefingResult, TrendingTopic } from '@/app/api/actions'

// Mock data for testing
const mockBriefingResult: BriefingResult = {
  title: 'Artificial Intelligence',
  summary: 'AI is transforming technology with machine learning and neural networks.',
  tweets: [
    '🤖 AI is getting smarter every day! #AI #Technology',
    'The future is here with artificial intelligence! 🚀 #Innovation',
    'Machine learning is revolutionizing everything! 🧠 #AI'
  ],
  sources: ['MIT Technology Review', 'Nature', 'Science Magazine']
}

const mockTrendingTopic: TrendingTopic = {
  id: '1',
  title: 'Climate Change',
  summary: 'Global climate change is affecting weather patterns worldwide.',
  tweets: [
    '🌍 Climate change is real and happening now! #ClimateAction',
    'We need to act fast on climate change! 🌱 #Environment',
    'The planet needs our help against climate change! 🌍 #Sustainability'
  ],
  sources: ['IPCC', 'NASA', 'NOAA']
}

describe('MarkdownExporter', () => {
  describe('exportSingleBriefing', () => {
    it('should export a single briefing to markdown format', () => {
      const exportableBriefing = MarkdownExporter.convertBriefingResultToExportable(
        mockBriefingResult,
        'personal'
      )

      const markdown = MarkdownExporter.exportSingleBriefing(exportableBriefing)

      // Check that markdown contains expected sections
      expect(markdown).toContain('# Artificial Intelligence')
      expect(markdown).toContain('## Summary')
      expect(markdown).toContain('AI is transforming technology')
      expect(markdown).toContain('## Satirical Tweets')
      expect(markdown).toContain('🤖 AI is getting smarter every day!')
      expect(markdown).toContain('## Sources')
      expect(markdown).toContain('MIT Technology Review')
    })

    it('should include metadata in export', () => {
      const exportableBriefing = MarkdownExporter.convertBriefingResultToExportable(
        mockBriefingResult,
        'personal'
      )

      const markdown = MarkdownExporter.exportSingleBriefing(exportableBriefing)

      expect(markdown).toContain('Generated:')
      expect(markdown).toContain('Type: Personal Interest')
      expect(markdown).toContain('Sources: 3')
    })
  })

  describe('exportMultipleBriefings', () => {
    it('should export multiple briefings to markdown format', () => {
      const briefings = [mockBriefingResult, mockBriefingResult]
      const exportableBriefings = briefings.map(b =>
        MarkdownExporter.convertBriefingResultToExportable(b, 'personal')
      )

      const markdown = MarkdownExporter.exportMultipleBriefings(exportableBriefings)

      // Check header
      expect(markdown).toContain('# Daily Briefing AI Report')
      expect(markdown).toContain('Total Briefings: 2')

      // Check that both briefings are included
      expect(markdown).toContain('## 1. Artificial Intelligence')
      expect(markdown).toContain('## 2. Artificial Intelligence')
    })
  })

  describe('convertBriefingResultToExportable', () => {
    it('should convert briefing result to exportable format', () => {
      const exportable = MarkdownExporter.convertBriefingResultToExportable(
        mockBriefingResult,
        'personal'
      )

      expect(exportable.title).toBe('Artificial Intelligence')
      expect(exportable.summary).toBe('AI is transforming technology with machine learning and neural networks.')
      expect(exportable.tweets).toEqual(mockBriefingResult.tweets)
      expect(exportable.sources).toEqual(mockBriefingResult.sources)
      expect(exportable.type).toBe('personal')
      expect(exportable.generatedAt).toBeDefined()
    })
  })

  describe('convertTrendingTopicToExportable', () => {
    it('should convert trending topic to exportable format', () => {
      const exportable = MarkdownExporter.convertTrendingTopicToExportable(
        mockTrendingTopic,
        'trending'
      )

      expect(exportable.title).toBe('Climate Change')
      expect(exportable.summary).toBe('Global climate change is affecting weather patterns worldwide.')
      expect(exportable.tweets).toEqual(mockTrendingTopic.tweets)
      expect(exportable.sources).toEqual(mockTrendingTopic.sources)
      expect(exportable.type).toBe('trending')
      expect(exportable.generatedAt).toBeDefined()
    })
  })

  describe('generateBriefingFilename', () => {
    it('should generate appropriate filename for briefing', () => {
      const exportableBriefing = MarkdownExporter.convertBriefingResultToExportable(
        mockBriefingResult,
        'personal'
      )

      const filename = MarkdownExporter.generateBriefingFilename(exportableBriefing)

      expect(filename).toContain('briefing-artificial-intelligence')
      expect(filename).toContain(new Date().toISOString().split('T')[0])
    })

    it('should sanitize special characters in title', () => {
      const specialBriefing: BriefingResult = {
        ...mockBriefingResult,
        title: 'AI & Machine Learning: Future Tech!'
      }

      const exportableBriefing = MarkdownExporter.convertBriefingResultToExportable(
        specialBriefing,
        'personal'
      )

      const filename = MarkdownExporter.generateBriefingFilename(exportableBriefing)

      expect(filename).toContain('briefing-ai-machine-learning-future-tech')
      expect(filename).not.toContain('&')
      expect(filename).not.toContain(':')
      expect(filename).not.toContain('!')
    })
  })
})

describe('exportUtils', () => {
  // Mock the download function to avoid actual file downloads in tests
  const originalCreateElement = document.createElement
  const mockLink = {
    href: '',
    download: '',
    click: jest.fn(),
    style: {},
    setAttribute: jest.fn(),
    getAttribute: jest.fn()
  }

  beforeAll(() => {
    // Mock document.createElement to return our mock link
    document.createElement = jest.fn().mockReturnValue(mockLink)
    // Mock URL methods
    global.URL.createObjectURL = jest.fn().mockReturnValue('mock-url')
    global.URL.revokeObjectURL = jest.fn()
  })

  afterAll(() => {
    document.createElement = originalCreateElement
  })

  describe('exportSingleBriefing', () => {
    it('should trigger download for single briefing', () => {
      exportUtils.exportSingleBriefing(mockBriefingResult, 'personal')

      expect(mockLink.download).toContain('briefing-artificial-intelligence')
      expect(mockLink.download).toContain('.md')
      expect(mockLink.click).toHaveBeenCalled()
    })
  })

  describe('exportMultipleBriefings', () => {
    it('should trigger download for multiple briefings', () => {
      const briefings = [mockBriefingResult, mockBriefingResult]

      exportUtils.exportMultipleBriefings(briefings, 'personal')

      expect(mockLink.download).toContain('daily-briefings')
      expect(mockLink.download).toContain('.md')
      expect(mockLink.click).toHaveBeenCalled()
    })
  })

  describe('exportTrendingTopics', () => {
    it('should trigger download for trending topics', () => {
      const topics = [mockTrendingTopic]

      exportUtils.exportTrendingTopics(topics)

      expect(mockLink.download).toContain('trending-topics')
      expect(mockLink.download).toContain('.md')
      expect(mockLink.click).toHaveBeenCalled()
    })
  })
})