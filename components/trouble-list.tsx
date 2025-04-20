"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Clock, Send } from "lucide-react"

// カテゴリに基づいた色を取得する関数
function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    "UI/UXデザイン": "bg-purple-500",
    コンテンツ制作: "bg-blue-500",
    モバイル開発: "bg-orange-500",
  }

  return colors[category] || "bg-lightgreen-500"
}

// カテゴリに基づいたバッジスタイルを取得する関数
function getCategoryBadgeStyle(category: string) {
  const styles: Record<string, string> = {
    "UI/UXデザイン": "bg-purple-50 text-purple-700 border-purple-200",
    コンテンツ制作: "bg-blue-50 text-blue-700 border-blue-200",
    モバイル開発: "bg-orange-50 text-orange-700 border-orange-200",
  }

  return styles[category] || "bg-lightgreen-50 text-lightgreen-700 border-lightgreen-200"
}

export function TroubleList() {
  const [selectedTrouble, setSelectedTrouble] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  // お困りごとリストの名前を動物の名前に変更します

  const troubles = [
    {
      id: "1",
      title: "ユーザー登録フローの改善",
      project: "オンライン学習プラットフォーム",
      author: "フクロウ",
      avatar: "/placeholder.svg?height=40&width=40",
      category: "UI/UXデザイン",
      description:
        "現在のユーザー登録フローが複雑で、ユーザーの離脱率が高いです。より簡単で直感的な登録フローにしたいと考えています。",
      comments: 3,
      createdAt: "2日前",
    },
    {
      id: "2",
      title: "学習コンテンツの多言語対応",
      project: "オンライン学習プラットフォーム",
      author: "フクロウ",
      avatar: "/placeholder.svg?height=40&width=40",
      category: "コンテンツ制作",
      description:
        "現在は日本語のコンテンツのみですが、英語や中国語など他言語にも対応させたいと考えています。翻訳や監修をお願いできる方を探しています。",
      comments: 1,
      createdAt: "3日前",
    },
    {
      id: "3",
      title: "モバイルアプリのパフォーマンス改善",
      project: "オンライン学習プラットフォーム",
      author: "フクロウ",
      avatar: "/placeholder.svg?height=40&width=40",
      category: "モバイル開発",
      description:
        "現在のモバイルアプリが重く、特に動画コンテンツの読み込みに時間がかかっています。パフォーマンスを改善する方法についてアドバイスをいただきたいです。",
      comments: 5,
      createdAt: "4日前",
    },
  ]

  const handleSendMessage = () => {
    if (message.trim() && selectedTrouble) {
      // メッセージ送信のロジックをここに実装
      alert(`お困りごと「${troubles.find((t) => t.id === selectedTrouble)?.title}」にメッセージを送信しました。`)
      setMessage("")
    }
  }

  return (
    <div className="space-y-3">
      {troubles.map((trouble) => (
        <Card
          key={trouble.id}
          className={`cursor-pointer transition-all rounded-2xl border-lightgreen-200 bg-white hover:shadow-md hover:-translate-y-1 overflow-hidden ${
            selectedTrouble === trouble.id ? "ring-2 ring-lightgreen-400 shadow-lg" : "shadow-sm"
          }`}
          onClick={() => setSelectedTrouble(trouble.id)}
        >
          <div className={`h-1 w-full ${getCategoryColor(trouble.category)}`} />
          <CardHeader className="pb-2 pt-3 px-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base text-lightgreen-800">{trouble.title}</CardTitle>
                <div className="text-xs text-lightgreen-600">{trouble.author}</div>
              </div>
              <Badge
                variant="outline"
                className={`text-xs border-lightgreen-200 ${getCategoryBadgeStyle(trouble.category)}`}
              >
                {trouble.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2 px-3">
            <p className="text-xs text-lightgreen-700">{trouble.description}</p>
          </CardContent>
          <CardFooter className="flex justify-between pt-0 px-3 pb-3">
            <div className="flex items-center gap-3 text-xs text-lightgreen-600">
              <div className="flex items-center">
                <MessageSquare className="mr-1 h-3 w-3" />
                {trouble.comments}
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                {trouble.createdAt}
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}

      {selectedTrouble && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2 text-lightgreen-800">メッセージを送信</h3>
          <div className="space-y-3">
            <Textarea
              placeholder="このお困りごとについてメッセージを入力してください..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[80px] text-sm rounded-xl border-lightgreen-200 focus:border-lightgreen-400 focus:ring-lightgreen-400"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="w-full bg-lightgreen-500 hover:bg-lightgreen-600 text-white rounded-full shadow-md hover:shadow-lg transition-all"
              size="sm"
            >
              <Send className="mr-2 h-4 w-4" />
              メッセージを送信
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

