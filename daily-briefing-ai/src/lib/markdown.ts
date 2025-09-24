import type { BriefingResult, TrendingTopic } from '@/app/api/actions'

export interface ExportableBriefing {
  title: string
  summary: string
  tweets: string[]
  sources: string[]
  generatedAt: string
  type: 'personal' | 'trending'
}

export class MarkdownExporter {
  private static formatTweet(tweet: string): string {
    // Remove any existing hashtags for cleaner formatting
    const cleanTweet = tweet.replace(/#\w+/g, '').trim()
    return `> ${cleanTweet}`
  }

  private static formatSources(sources: string[]): string {
    return sources.map(source => `- ${source}`).join('\n')
  }

  private static formatMetadata(briefing: ExportableBriefing): string {
    const metadata = [
      `Generated: ${briefing.generatedAt}`,
      `Type: ${briefing.type === 'personal' ? 'Personal Interest' : 'Trending Topic'}`,
      `Sources: ${briefing.sources.length}`,
      ''
    ].join('\n')

    return metadata
  }

  static exportSingleBriefing(briefing: ExportableBriefing): string {
    const sections = [
      '# ' + briefing.title,
      '',
      this.formatMetadata(briefing),
      '## Summary',
      '',
      briefing.summary,
      '',
      '## Satirical Tweets',
      '',
      ...briefing.tweets.map(tweet => this.formatTweet(tweet)),
      '',
      '## Sources',
      '',
      this.formatSources(briefing.sources)
    ]

    return sections.join('\n')
  }

  static exportMultipleBriefings(briefings: ExportableBriefing[]): string {
    const header = [
      '# Daily Briefing AI Report',
      '',
      `Generated: ${new Date().toISOString()}`,
      `Total Briefings: ${briefings.length}`,
      ''
    ].join('\n')

    const briefingSections = briefings
      .map((briefing, index) => {
        const sections = [
          `## ${index + 1}. ${briefing.title}`,
          '',
          this.formatMetadata(briefing),
          '### Summary',
          '',
          briefing.summary,
          '',
          '### Satirical Tweets',
          '',
          ...briefing.tweets.map(tweet => this.formatTweet(tweet)),
          '',
          '### Sources',
          '',
          this.formatSources(briefing.sources),
          '',
          '---',
          ''
        ]
        return sections.join('\n')
      })
      .join('\n')

    return header + briefingSections
  }

  static convertBriefingResultToExportable(
    result: BriefingResult,
    type: 'personal' | 'trending' = 'personal'
  ): ExportableBriefing {
    return {
      title: result.title,
      summary: result.summary,
      tweets: result.tweets,
      sources: result.sources,
      generatedAt: new Date().toISOString(),
      type
    }
  }

  static convertTrendingTopicToExportable(
    topic: TrendingTopic,
    type: 'personal' | 'trending' = 'trending'
  ): ExportableBriefing {
    return {
      title: topic.title,
      summary: topic.summary,
      tweets: topic.tweets,
      sources: topic.sources,
      generatedAt: new Date().toISOString(),
      type
    }
  }

  static downloadMarkdown(content: string, filename: string = 'briefing'): void {
    // Create blob with markdown content
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.md`

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  static exportToClipboard(content: string): Promise<void> {
    return navigator.clipboard.writeText(content)
  }

  static generateBriefingFilename(briefing: ExportableBriefing): string {
    const date = new Date().toISOString().split('T')[0]
    const sanitizedTitle = briefing.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    return `briefing-${sanitizedTitle}-${date}`
  }
}

// Utility functions for common export operations
export const exportUtils = {
  exportSingleBriefing: (briefing: BriefingResult, type: 'personal' | 'trending' = 'personal') => {
    const exportable = MarkdownExporter.convertBriefingResultToExportable(briefing, type)
    const markdown = MarkdownExporter.exportSingleBriefing(exportable)
    const filename = MarkdownExporter.generateBriefingFilename(exportable)

    MarkdownExporter.downloadMarkdown(markdown, filename)
  },

  exportMultipleBriefings: (briefings: BriefingResult[], type: 'personal' | 'trending' = 'personal') => {
    const exportableBriefings = briefings.map(b =>
      MarkdownExporter.convertBriefingResultToExportable(b, type)
    )
    const markdown = MarkdownExporter.exportMultipleBriefings(exportableBriefings)
    MarkdownExporter.downloadMarkdown(markdown, 'daily-briefings')
  },

  exportTrendingTopics: (topics: TrendingTopic[]) => {
    const exportableTopics = topics.map(t =>
      MarkdownExporter.convertTrendingTopicToExportable(t, 'trending')
    )
    const markdown = MarkdownExporter.exportMultipleBriefings(exportableTopics)
    MarkdownExporter.downloadMarkdown(markdown, 'trending-topics')
  }
}