"use client";

import Link from "next/link";
import { ProjectList } from "@/components/project-list";
import { Button } from "@/components/ui/button";
import { PlusCircle, Bell } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { Trophy, MessageSquare, TagIcon } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// ランキングに基づいた色を取得する関数
function getRankColor(rank: number) {
  const colors: Record<number, string> = {
    1: "bg-yellow-500",
    2: "bg-gray-400",
    3: "bg-amber-600",
  };

  return colors[rank] || "bg-lightgreen-500";
}

export default function HomePage() {
  const router = useRouter();

  // ログイン状態をチェックして未ログインの場合にログインページに遷移
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      router.push("/login"); // ログインしていない場合はログインページにリダイレクト
    }
  }, [router]);

  return (
    <div className="pb-20 bg-gradient-to-b from-lightgreen-50 to-white">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-lightgreen-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-lightgreen-800">
            共創プラットフォーム
          </h1>
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
              <div className="h-8 w-8 bg-orange-500 text-white font-semibold flex items-center justify-center">
                キ
              </div>
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-lightgreen-800">
              新着プロジェクト
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-lightgreen-300 text-lightgreen-700 hover:bg-lightgreen-100"
            >
              <PlusCircle className="mr-1 h-4 w-4" />
              新規
            </Button>
          </div>
          <ProjectList type="new" />
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-lightgreen-800">
            お気に入りプロジェクト
          </h2>
          <ProjectList type="favorite" />
        </div>

        <div className="space-y-6">
          <Link href="/troubles">
            <Button className="w-full bg-lightgreen-500 hover:bg-lightgreen-600 text-white rounded-full shadow-md hover:shadow-lg transition-all">
              <MessageSquare className="mr-2 h-4 w-4" />
              お困りごとリスト
            </Button>
          </Link>

          <div className="rounded-2xl border border-lightgreen-200 bg-white p-4 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-lightgreen-800 flex items-center">
                <div className="bg-lightgreen-100 p-1.5 rounded-full mr-2">
                  <Trophy className="h-4 w-4 text-lightgreen-600" />
                </div>
                アクティビティランキング
              </h3>
              <span className="text-xs text-lightgreen-600 bg-lightgreen-50 px-2 py-1 rounded-full">
                今週
              </span>
            </div>
            <div className="space-y-3">
              {[
                { name: "キツネ", points: 1250, rank: 1 },
                { name: "パンダ", points: 980, rank: 2 },
                { name: "ウサギ", points: 875, rank: 3 },
              ].map((user) => (
                <div
                  key={user.name}
                  className="flex items-center justify-between bg-gradient-to-r from-lightgreen-50 to-transparent p-2 rounded-lg hover:shadow-sm transition-all"
                >
                  <div className="flex items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-white font-medium mr-2 text-xs ${getRankColor(
                        user.rank
                      )}`}
                    >
                      {user.rank}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-lightgreen-500 h-1.5 rounded-full"
                          style={{ width: `${(user.points / 1250) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <span className="font-medium text-sm text-lightgreen-700">
                    {user.points}pt
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-lightgreen-200 bg-white p-4 shadow-sm">
            <h3 className="font-medium mb-3 text-lightgreen-800 flex items-center">
              <div className="bg-lightgreen-100 p-1.5 rounded-full mr-2">
                <TagIcon className="h-4 w-4 text-lightgreen-600" />
              </div>
              カテゴリー
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "テクノロジー",
                "デザイン",
                "マーケティング",
                "ビジネス",
                "教育",
              ].map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs h-8 border-lightgreen-300 bg-lightgreen-50 text-lightgreen-700 hover:bg-lightgreen-100 shadow-sm hover:shadow"
                >
                  {category}
                </Button>
              ))}
            </div>
            <div className="mb-6"></div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
