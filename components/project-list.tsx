"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, MessageSquare, Star, Clock, ChevronRight } from "lucide-react"

// 動物の種類に基づいた背景色を取得する関数
function getAnimalColor(animal: string) {
  const colors: Record<string, string> = {
    キツネ: "bg-orange-500",
    パンダ: "bg-gray-800",
    ウサギ: "bg-pink-400",
    カメ: "bg-green-600",
    ペンギン: "bg-blue-900",
    フクロウ: "bg-amber-700",
    クマ: "bg-brown-600",
    ゾウ: "bg-gray-500",
    シカ: "bg-amber-500",
    タヌキ: "bg-gray-700",
    コアラ: "bg-gray-400",
    イヌ: "bg-yellow-700",
    ネコ: "bg-gray-600",
    ライオン: "bg-yellow-600",
  }

  return colors[animal] || "bg-lightgreen-500"
}

// カテゴリに基づいた色を取得する関数
function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    テクノロジー: "bg-blue-500",
    ビジネス: "bg-purple-500",
    医療: "bg-red-500",
    環境: "bg-green-500",
    教育: "bg-yellow-500",
    コミュニティ: "bg-pink-500",
    農業: "bg-lime-500",
    ワークスタイル: "bg-cyan-500",
    スポーツ: "bg-orange-500",
    文化: "bg-indigo-500",
    子育て: "bg-rose-500",
  }

  return colors[category] || "bg-lightgreen-500"
}

// カテゴリに基づいたバッジスタイルを取得する関数
function getCategoryBadgeStyle(category: string) {
  const styles: Record<string, string> = {
    テクノロジー: "bg-blue-50 text-blue-700 border-blue-200",
    ビジネス: "bg-purple-50 text-purple-700 border-purple-200",
    医療: "bg-red-50 text-red-700 border-red-200",
    環境: "bg-green-50 text-green-700 border-green-200",
    教育: "bg-yellow-50 text-yellow-700 border-yellow-200",
    コミュニティ: "bg-pink-50 text-pink-700 border-pink-200",
    農業: "bg-lime-50 text-lime-700 border-lime-200",
    ワークスタイル: "bg-cyan-50 text-cyan-700 border-cyan-200",
    スポーツ: "bg-orange-50 text-orange-700 border-orange-200",
    文化: "bg-indigo-50 text-indigo-700 border-indigo-200",
    子育て: "bg-rose-50 text-rose-700 border-rose-200",
  }

  return styles[category] || "bg-lightgreen-50 text-lightgreen-700 border-lightgreen-200"
}

type ProjectType = "new" | "favorite"

interface ProjectListProps {
  type: ProjectType
}

export function ProjectList({ type }: ProjectListProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  // プロジェクトデータ内の名前を動物の名前に変更します

  const projects =
    type === "new"
      ? [
          {
            id: "1",
            title: "地域コミュニティアプリの開発",
            author: "キツネ",
            avatar: "/placeholder.svg?height=40&width=40",
            category: "テクノロジー",
            likes: 24,
            comments: 8,
            createdAt: "2時間前",
            isFavorite: false,
          },
          {
            id: "2",
            title: "サステナブルファッションブランドの立ち上げ",
            author: "パンダ",
            avatar: "/placeholder.svg?height=40&width=40",
            category: "ビジネス",
            likes: 18,
            comments: 5,
            createdAt: "3時間前",
            isFavorite: false,
          },
          {
            id: "3",
            title: "高齢者向け健康管理アプリ",
            author: "ウサギ",
            avatar: "/placeholder.svg?height=40&width=40",
            category: "医療",
            likes: 32,
            comments: 12,
            createdAt: "5時間前",
            isFavorite: false,
          },
          {
            id: "4",
            title: "環境に優しい配送サービス",
            author: "カメ",
            avatar: "/placeholder.svg?height=40&width=40",
            category: "環境",
            likes: 15,
            comments: 3,
            createdAt: "8時間前",
            isFavorite: false,
          },
          {
            id: "5",
            title: "子ども向けプログラミング教室",
            author: "ペンギン",
            avatar: "/placeholder.svg?height=40&width=40",
            category: "教育",
            likes: 27,
            comments: 9,
            createdAt: "10時間前",
            isFavorite: false,
          },
        ]
      : [
          {
            id: "6",
            title: "オンライン学習プラットフォーム",
            author: "フクロウ",
            avatar: "/placeholder.svg?height=40&width=40",
            category: "教育",
            likes: 45,
            comments: 17,
            createdAt: "1日前",
            isFavorite: true,
          },
          {
            id: "7",
            title: "フードロス削減アプリ",
            author: "クマ",
            avatar: "/placeholder.svg?height=40&width=40",
            category: "環境",
            likes: 38,
            comments: 9,
            createdAt: "2日前",
            isFavorite: true,
          },
          {
            id: "8",
            title: "シニア向けSNSサービス",
            author: "ゾウ",
            avatar: "/placeholder.svg?height=40&width=40",
            category: "コミュニティ",
            likes: 29,
            comments: 14,
            createdAt: "3日前",
            isFavorite: true,
          },
          {
            id: "9",
            title: "地域特産品マーケットプレイス",
            author: "シカ",
            avatar: "/placeholder.svg?height=40&width=40",
            category: "ビジネス",
            likes: 33,
            comments: 7,
            createdAt: "4日前",
            isFavorite: true,
          },
        ]

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-2">
        <div className="flex-1"></div>
        <Link
          href={`/projects/${type}`}
          className="text-xs text-lightgreen-600 hover:text-lightgreen-800 flex items-center bg-white px-2 py-1 rounded-full shadow-sm"
        >
          もっと見る
          <ChevronRight className="h-3 w-3 ml-1" />
        </Link>
      </div>

      <div className="flex overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-lightgreen-200 scrollbar-track-transparent -mx-1 px-1">
        <div className="flex gap-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className={`cursor-pointer transition-all rounded-2xl border-lightgreen-200 bg-white hover:shadow-md hover:-translate-y-1 flex-shrink-0 w-[260px] overflow-hidden ${
                selectedProject === project.id ? "ring-2 ring-lightgreen-400 shadow-lg" : "shadow-sm"
              }`}
              onClick={() => setSelectedProject(project.id)}
            >
              <div className={`h-1 w-full ${getCategoryColor(project.category)}`} />
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border-2 border-lightgreen-200 shadow-sm ring-2 ring-white">
                      <AvatarImage src={project.avatar} alt={project.author} />
                      <AvatarFallback className={`text-white font-semibold ${getAnimalColor(project.author)}`}>
                        {project.author.substring(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base text-lightgreen-800 line-clamp-1">{project.title}</CardTitle>
                      <div className="text-xs text-lightgreen-600">{project.author}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2 px-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant="outline"
                    className={`text-xs border-lightgreen-200 ${getCategoryBadgeStyle(project.category)}`}
                  >
                    {project.category}
                  </Badge>
                </div>
                <p className="text-xs text-lightgreen-600 line-clamp-2">
                  プロジェクトの詳細説明がここに表示されます。参加者を募集中です。
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-0 px-3 pb-3">
                <div className="flex items-center gap-3 text-xs text-lightgreen-600">
                  <div className="flex items-center">
                    <ThumbsUp className="mr-1 h-3 w-3" />
                    {project.likes}
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="mr-1 h-3 w-3" />
                    {project.comments}
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {project.createdAt}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full h-7 w-7 p-0 border-lightgreen-300 bg-lightgreen-50 text-lightgreen-700 hover:bg-lightgreen-100 shadow-sm hover:shadow"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span className="sr-only">いいね</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full h-7 w-7 p-0 border-lightgreen-300 bg-lightgreen-50 text-lightgreen-700 hover:bg-lightgreen-100 shadow-sm hover:shadow"
                  >
                    <ThumbsDown className="h-3 w-3" />
                    <span className="sr-only">よくないね</span>
                  </Button>
                  <Button
                    variant={project.isFavorite ? "default" : "outline"}
                    size="sm"
                    className={`rounded-full h-7 w-7 p-0 ${
                      project.isFavorite
                        ? "bg-lightgreen-500 text-white hover:bg-lightgreen-600 shadow-md"
                        : "border-lightgreen-300 bg-lightgreen-50 text-lightgreen-700 hover:bg-lightgreen-100"
                    }`}
                  >
                    <Star className="h-3 w-3" fill={project.isFavorite ? "currentColor" : "none"} />
                    <span className="sr-only">お気に入り</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

