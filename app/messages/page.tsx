import Link from "next/link"
import { MessageThread } from "@/components/message-thread"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Bell, Users, Crown } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function MessagesPage() {
  return (
    <div className="pb-20 bg-gradient-to-b from-lightgreen-50 to-white">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-lightgreen-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/troubles">
              <Button
                variant="ghost"
                size="icon"
                className="mr-1 h-8 w-8 text-lightgreen-600 hover:text-lightgreen-700 hover:bg-lightgreen-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-lightgreen-800">メッセージ</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-lightgreen-600 hover:text-lightgreen-700 hover:bg-lightgreen-100"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full overflow-hidden border-2 border-lightgreen-200 p-0"
            >
              <div className="h-8 w-8 bg-orange-500 text-white font-semibold flex items-center justify-center">キ</div>
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        <div className="rounded-2xl border border-lightgreen-200 bg-white p-3 shadow-sm mb-4">
          <h3 className="font-medium text-sm mb-2 text-lightgreen-800">お困りごと情報</h3>
          <div className="space-y-2">
            <div>
              <h4 className="font-medium text-sm text-lightgreen-800">ユーザー登録フローの改善</h4>
              <p className="text-xs text-lightgreen-600">オンライン学習プラットフォーム - フクロウ</p>
            </div>
            <div>
              <h5 className="text-xs font-medium text-lightgreen-700">詳細</h5>
              <p className="text-xs text-lightgreen-600">
                現在のユーザー登録フローが複雑で、ユーザーの離脱率が高いです。より簡単で直感的な登録フローにしたいと考えています。
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-sm mb-2 text-lightgreen-800 flex items-center">
            <div className="bg-lightgreen-100 p-1.5 rounded-full mr-2">
              <Users className="h-4 w-4 text-lightgreen-600" />
            </div>
            参加者
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 px-1">
            <div className="flex flex-col items-center min-w-[70px] bg-lightgreen-50 rounded-xl p-2 shadow-sm">
              <div className="relative">
                <Avatar className="h-12 w-12 mb-2 border-2 border-lightgreen-200 shadow-sm ring-2 ring-white">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="フクロウ" />
                  <AvatarFallback className="bg-amber-700 text-white font-semibold">フ</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-lightgreen-500 text-white rounded-full p-1 shadow-sm">
                  <Crown className="h-3 w-3" />
                </div>
              </div>
              <div className="text-xs font-medium text-lightgreen-800">フクロウ</div>
              <div className="text-[10px] text-lightgreen-600 bg-lightgreen-200 px-2 py-0.5 rounded-full mt-1">
                オーナー
              </div>
            </div>
            <div className="flex flex-col items-center min-w-[70px] bg-lightgreen-50 rounded-xl p-2 shadow-sm">
              <Avatar className="h-12 w-12 mb-2 border-2 border-lightgreen-200 shadow-sm ring-2 ring-white">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="キツネ" />
                <AvatarFallback className="bg-orange-500 text-white font-semibold">キ</AvatarFallback>
              </Avatar>
              <div className="text-xs font-medium text-lightgreen-800">キツネ</div>
              <div className="text-[10px] text-lightgreen-600 bg-lightgreen-200 px-2 py-0.5 rounded-full mt-1">
                応援者
              </div>
            </div>
            <div className="flex flex-col items-center min-w-[70px] bg-lightgreen-50 rounded-xl p-2 shadow-sm">
              <Avatar className="h-12 w-12 mb-2 border-2 border-lightgreen-200 shadow-sm ring-2 ring-white">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="パンダ" />
                <AvatarFallback className="bg-gray-800 text-white font-semibold">パ</AvatarFallback>
              </Avatar>
              <div className="text-xs font-medium text-lightgreen-800">パンダ</div>
              <div className="text-[10px] text-lightgreen-600 bg-lightgreen-200 px-2 py-0.5 rounded-full mt-1">
                応援者
              </div>
            </div>
          </div>
        </div>

        <MessageThread />
      </main>

      <MobileNav />
    </div>
  )
}

