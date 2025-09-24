"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MyInterestsView } from "@/components/my-interests-view"
import { TrendingNowView } from "@/components/trending-now-view"
import { ProviderManagerView } from "@/components/provider-manager-view"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useState } from "react"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("my-interests")

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-interests">My Interests</TabsTrigger>
          <TabsTrigger value="trending-now">Trending Now</TabsTrigger>
          <TabsTrigger value="providers">AI Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="my-interests" className="mt-6">
          <MyInterestsView />
        </TabsContent>

        <TabsContent value="trending-now" className="mt-6">
          <TrendingNowView />
        </TabsContent>

        <TabsContent value="providers" className="mt-6">
          <ProviderManagerView />
        </TabsContent>
      </Tabs>
    </div>
  )
}