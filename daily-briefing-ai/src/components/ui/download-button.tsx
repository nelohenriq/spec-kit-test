"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { exportUtils } from "@/lib/markdown"
import type { BriefingResult, TrendingTopic } from "@/app/api/actions"

interface DownloadButtonProps {
  briefings?: BriefingResult[]
  trendingTopics?: TrendingTopic[]
  variant?: "single" | "multiple" | "trending"
  disabled?: boolean
  className?: string
}

export function DownloadButton({
  briefings = [],
  trendingTopics = [],
  variant = "single",
  disabled = false,
  className
}: DownloadButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false)

  const handleDownload = async () => {
    if (disabled) return

    setIsExporting(true)
    try {
      switch (variant) {
        case "single":
          if (briefings.length === 1) {
            exportUtils.exportSingleBriefing(briefings[0], 'personal')
          } else if (briefings.length > 1) {
            exportUtils.exportMultipleBriefings(briefings, 'personal')
          }
          break

        case "multiple":
          if (briefings.length > 0) {
            exportUtils.exportMultipleBriefings(briefings, 'personal')
          }
          break

        case "trending":
          if (trendingTopics.length > 0) {
            exportUtils.exportTrendingTopics(trendingTopics)
          }
          break
      }
    } catch (error) {
      console.error('Error exporting briefings:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const getButtonText = () => {
    if (isExporting) {
      return "Exporting..."
    }

    switch (variant) {
      case "single":
        return "Download Markdown"
      case "multiple":
        return "Download All Briefings"
      case "trending":
        return "Download Trending Topics"
      default:
        return "Download"
    }
  }

  const hasContent = () => {
    switch (variant) {
      case "single":
      case "multiple":
        return briefings.length > 0
      case "trending":
        return trendingTopics.length > 0
      default:
        return false
    }
  }

  if (!hasContent()) {
    return null
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || isExporting}
      variant="outline"
      className={className}
    >
      <svg
        className="mr-2 h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {getButtonText()}
    </Button>
  )
}