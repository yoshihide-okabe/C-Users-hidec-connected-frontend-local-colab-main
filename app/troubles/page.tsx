import Link from "next/link"
import { TroubleList } from "@/components/trouble-list"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Bell } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"

export default function TroublesPage() {
  return (
    <div className="pb-20 bg-gradient-to-b from-lightgreen-50 to-white">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-lightgreen-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="mr-1 h-8 w-8 text-lightgreen-600 hover:text-lightgreen-700 hover:bg-lightgreen-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-lightgreen-800">お困りごとリスト</h1>
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
        <div className="mb-6">
          <div className="rounded-2xl border border-lightgreen-200 bg-white p-4 shadow-sm mb-4">
            <h3 className="font-medium mb-2 text-lightgreen-800">プロジェクト情報</h3>
            <div className="space-y-2">
              <div>
                <h4 className="font-medium text-sm text-lightgreen-800">オンライン学習プラットフォーム</h4>
                <p className="text-xs text-lightgreen-600">フクロウ</p>
              </div>
              <div>
                <h5 className="text-xs font-medium text-lightgreen-700">プロジェクト概要</h5>
                <p className="text-xs text-lightgreen-600">
                  誰でも簡単にオンラインで学べるプラットフォームを開発しています。特に教育格差の解消を目指しています。
                </p>
              </div>
            </div>
          </div>

          <TroubleList />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-lightgreen-200 bg-white p-4 shadow-sm mb-6">
            <h3 className="font-medium mb-2 text-lightgreen-800">活動ステータス</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-lightgreen-700">解決したお困りごと</span>
                <span className="font-medium text-sm text-lightgreen-700">3件</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-lightgreen-700">貢献ポイント</span>
                <span className="font-medium text-sm text-lightgreen-700">120pt</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-lightgreen-700">感謝された回数</span>
                <span className="font-medium text-sm text-lightgreen-700">5回</span>
              </div>
            </div>
          </div>

          <Link href="/messages">
            <Button className="w-full bg-lightgreen-500 hover:bg-lightgreen-600 text-white rounded-full shadow-md hover:shadow-lg transition-all">
              メッセージを確認する
            </Button>
          </Link>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}

