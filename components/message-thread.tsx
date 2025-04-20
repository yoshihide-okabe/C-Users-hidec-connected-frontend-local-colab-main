"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Send } from "lucide-react"

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

export function MessageThread() {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  // メッセージスレッドの名前を動物の名前に変更します

  const messages = [
    {
      id: "1",
      author: "フクロウ",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "プロジェクトオーナー",
      content:
        "ユーザー登録フローの改善について、アイデアやアドバイスをいただけると嬉しいです。特に、SNSログインの導入や、必須項目の削減などを検討しています。",
      timestamp: "2日前",
      isOwner: true,
    },
    {
      id: "2",
      author: "キツネ",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "応援者",
      content:
        "SNSログインは良いアイデアですね。Googleアカウントとの連携が特に効果的だと思います。また、登録フォームは1ページにまとめて、進捗バーを表示するとユーザーの離脱を防げるかもしれません。",
      timestamp: "1日前",
      isOwner: false,
      thanked: false,
    },
    {
      id: "3",
      author: "パンダ",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "応援者",
      content:
        "私の経験では、登録時に必要な情報を最小限にして、後から徐々にプロフィールを充実させる方法が効果的でした。また、メールアドレスの確認ステップをスキップできるオプションも検討してみてはいかがでしょうか。",
      timestamp: "12時間前",
      isOwner: false,
      thanked: true,
    },
    {
      id: "4",
      author: "フクロウ",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "プロジェクトオーナー",
      content:
        "キツネさん、パンダさん、貴重なアドバイスありがとうございます！SNSログインと最小限の情報入力から始める方法を採用してみようと思います。プロトタイプができたらまたご意見をいただけると嬉しいです。",
      timestamp: "3時間前",
      isOwner: true,
    },
  ]

  const handleSendMessage = () => {
    if (message.trim()) {
      // メッセージ送信のロジックをここに実装
      alert("メッセージを送信しました。")
      setMessage("")
    }
  }

  const handleThankMessage = (messageId: string) => {
    // 感謝ボタンのロジックをここに実装
    alert(`メッセージ ${messageId} に感謝しました。`)
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3 mb-4">
        {messages.map((msg) => (
          <Card
            key={msg.id}
            className={`cursor-pointer transition-all rounded-2xl border-lightgreen-200 ${
              selectedMessage === msg.id ? "ring-2 ring-lightgreen-400 shadow-lg" : "shadow-sm"
            } ${msg.isOwner ? "bg-lightgreen-50" : "bg-white"} hover:shadow-md`}
            onClick={() => !msg.isOwner && setSelectedMessage(msg.id)}
          >
            <CardContent className="p-3">
              <div className="flex gap-2">
                <Avatar className="h-9 w-9 border-2 border-lightgreen-200 shadow-sm ring-2 ring-white">
                  <AvatarImage src={msg.avatar} alt={msg.author} />
                  <AvatarFallback className={`text-white font-semibold ${getAnimalColor(msg.author)}`}>
                    {msg.author.substring(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-medium text-sm text-lightgreen-800">{msg.author}</span>
                      <span className="text-[10px] text-lightgreen-600 ml-1">{msg.role}</span>
                    </div>
                    <span className="text-[10px] text-lightgreen-600">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs text-lightgreen-700">{msg.content}</p>
                  {!msg.isOwner && (
                    <div className="flex justify-end mt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-xs rounded-full ${
                          msg.thanked
                            ? "text-lightgreen-600 bg-lightgreen-100"
                            : "text-lightgreen-500 hover:text-lightgreen-600 hover:bg-lightgreen-50"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleThankMessage(msg.id)
                        }}
                        disabled={msg.thanked}
                      >
                        <Heart className="h-3 w-3 mr-1" fill={msg.thanked ? "currentColor" : "none"} />
                        {msg.thanked ? "感謝済み" : "感謝する"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2 text-lightgreen-800">メッセージを送信</h3>
        <div className="space-y-3">
          <Textarea
            placeholder="メッセージを入力してください..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[80px] text-sm rounded-xl border-lightgreen-200 focus:border-lightgreen-400 focus:ring-lightgreen-400"
          />
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={!selectedMessage}
              onClick={() => setSelectedMessage(null)}
              className="border-lightgreen-300 text-lightgreen-700 hover:bg-lightgreen-100"
            >
              選択解除
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              size="sm"
              className="bg-lightgreen-500 hover:bg-lightgreen-600 text-white rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <Send className="mr-2 h-4 w-4" />
              送信
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

