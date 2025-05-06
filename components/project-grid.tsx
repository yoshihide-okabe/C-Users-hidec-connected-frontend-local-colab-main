"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, MessageSquare, Star, Clock } from "lucide-react"
import { getProjects, toggleFavorite, Project } from "@/services/projects"
import { useToast } from "@/hooks/use-toast"

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

  return colors[animal.substring(0, 1)] || "bg-lightgreen-500"
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

  // 時間を「◯時間前」の形式で表示する関数
  function getTimeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "たった今";
    } else if (diffInHours < 24) {
      return `${diffInHours}時間前`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}日前`;
    }
  }

type ProjectType = "new" | "favorite"

interface ProjectGridProps {
  type: ProjectType
  limit?: number
}

export function ProjectGrid({ type }: ProjectGridProps) {
  const { toast } = useToast()
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // APIからプロジェクト一覧を取得
  useEffect(() => {
    async function fetchProjects() {
      setIsLoading(true)
        try {
          const data = await getProjects(type, limit)
          setProjects(data)
        } catch (err) {
          console.error("プロジェクト取得エラー:", err)
          setError(err instanceof Error ? err.message : "データの取得に失敗しました")
        } finally {
          setIsLoading(false)
        }
      }

      fetchProjects()
    }, [type, limit])

    // お気に入り機能
    const handleToggleFavorite = async (projectId: number, isFavorite: boolean, e: React.MouseEvent) => {
      e.stopPropagation() // プロジェクト選択イベントを防止

      try {
        // APIでお気に入り状態を更新
        const newFavoriteState = await toggleFavorite(projectId, isFavorite)

        // プロジェクトリストを更新
        setProjects((prev) =>
          prev.map((project) =>
            project.id === projectId
              ? { ...project, isFavorite: newFavoriteState }
              : project
          )
        )

        toast({
          title: isFavorite ? "お気に入りから削除" : "お気に入りに追加",
          description: `プロジェクトを${isFavorite ? "お気に入りから削除" : "お気に入りに追加"}しました`,
        })
      } catch (error) {
        console.error("お気に入り操作エラー:", error)
        toast({
          title: "エラー",
          description: error instanceof Error ? error.message : "お気に入り操作に失敗しました",
          variant: "destructive",
        })
      }
    }

    // プロジェクト選択時の処理
    const handleProjectSelect = (project: Project) => {
      setSelectedProject(project.id.toString())

      // ローカルストレージに保存
      try {
        localStorage.setItem("selectedProjectId", project.id.toString())
        localStorage.setItem("selectedProjectTitle", project.title)
        localStorage.setItem("selectedProjectDescription", project.description)
        localStorage.setItem("selectedProjectOwner", project.owner)
        localStorage.setItem("selectedProjectCategory", project.category)

        toast({
          title: "プロジェクト選択",
          description: `「${project.title}」を選択しました`,
        })
      } catch (error) {
        console.error("プロジェクト情報の保存エラー:", error)
        toast({
          title: "エラー",
          description: "プロジェクト情報の保存に失敗しました",
          variant: "destructive",
        })
      }
    }

    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-lightgreen-600">読み込み中...</div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
          <p className="font-medium">エラーが発生しました</p>
          <p className="text-sm">{error}</p>
          <button
            className="mt-2 px-3 py-1 text-sm border border-red-300 rounded text-red-600 hover:bg-red-50"
            onClick={() => window.location.reload()}
          >
            再読み込み
          </button>
        </div>
      )
    }





  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card
            key={project.id}
            className={`cursor-pointer transition-all rounded-2xl border-lightgreen-200 bg-white hover:shadow-md hover:-translate-y-1 overflow-hidden ${
              selectedProject === project.id ? "ring-2 ring-lightgreen-400 shadow-lg" : "shadow-sm"
            }`}
            onClick={() => handleProjectSelect(project)}
          >
            <div className={`h-1 w-full ${getCategoryColor(project.category)}`} />
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border-2 border-lightgreen-200 shadow-sm ring-2 ring-white">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt={project.owner} />
                    <AvatarFallback className={`text-white font-semibold ${getAnimalColor(project.owner)}`}>
                      {project.owner.substring(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base text-lightgreen-800">{project.title}</CardTitle>
                    <div className="text-xs text-lightgreen-600">{project.owner}</div>
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
                {project.description}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between pt-0 px-3 pb-3">
              <div className="flex items-center gap-3 text-xs text-lightgreen-600">
                <div className="flex items-center">
                  <ThumbsUp className="mr-1 h-3 w-3" />
                  {project.likesCount || 0}
                </div>
                <div className="flex items-center">
                  <MessageSquare className="mr-1 h-3 w-3" />
                  {{project.commentsCount || 0}
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {getTimeAgo(project.createdAt)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full h-8 w-8 p-0 border-lightgreen-300 bg-lightgreen-50 text-lightgreen-700 hover:bg-lightgreen-100 shadow-sm hover:shadow"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="sr-only">いいね</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full h-8 w-8 p-0 border-lightgreen-300 bg-lightgreen-50 text-lightgreen-700 hover:bg-lightgreen-100 shadow-sm hover:shadow"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span className="sr-only">よくないね</span>
                </Button>
                <Button
                  variant={project.isFavorite ? "default" : "outline"}
                  size="sm"
                  className={`rounded-full h-8 w-8 p-0 ${
                    project.isFavorite
                      ? "bg-lightgreen-500 text-white hover:bg-lightgreen-600 shadow-md"
                      : "border-lightgreen-300 bg-lightgreen-50 text-lightgreen-700 hover:bg-lightgreen-100 shadow-sm hover:shadow"
                  }`}
                  onClick={(e) => handleToggleFavorite(project.id, project.isFavorite, e)}
                >
                  <Star className="h-4 w-4" fill={project.isFavorite ? "currentColor" : "none"} />
                  <span className="sr-only">お気に入り</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

