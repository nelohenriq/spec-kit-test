"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MyInterestsView } from "@/components/my-interests-view"
import { TrendingNowView } from "@/components/trending-now-view"
import { useState } from "react"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("my-interests")

  return (
    <div className="max-w-6xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-interests">My Interests</TabsTrigger>
          <TabsTrigger value="trending-now">Trending Now</TabsTrigger>
        </TabsList>

        <TabsContent value="my-interests" className="mt-6">
          <MyInterestsView />
        </TabsContent>

        <TabsContent value="trending-now" className="mt-6">
          <TrendingNowView />
        </TabsContent>
      </Tabs>
    </div>
  )
}