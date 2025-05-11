"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageThread } from "@/components/message-thread";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Bell, Users, Crown } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Participant,
  getParticipantsByTroubleId,
} from "@/services/participants";

export default function MessagesPage() {
  // お困りごと情報のステート
  const [troubleInfo, setTroubleInfo] = useState({
    projectTitle: "",
    projectOwner: "",
    troubleDescription: "",
    userInitial: "キ", // デフォルト値
  });

  // 参加者リストのステート
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // コンポーネントマウント時にローカルストレージから情報を取得
  useEffect(() => {
    // ローカルストレージからお困りごと情報を取得
    const troubleId = localStorage.getItem("selectedTroubleId") || "";
    const projectTitle = localStorage.getItem("selectedProjectTitle") || "";
    const projectOwner = localStorage.getItem("selectedProjectOwner") || "";
    const troubleDescription =
      localStorage.getItem("selectedTroubleDescription") || "";

    // ユーザー名から頭文字を取得
    const userName = localStorage.getItem("userName") || "キツネ";
    const userInitial = userName.charAt(0);

    // ステートを更新
    setTroubleInfo({
      projectTitle,
      projectOwner,
      troubleDescription,
      userInitial,
    });

    // お困りごとIDが存在する場合は参加者を取得
    if (troubleId) {
      fetchParticipants(troubleId);
    } else {
      setIsLoading(false);
    }
  }, []);

  // 参加者を取得する関数
  const fetchParticipants = async (troubleId: string) => {
    try {
      setIsLoading(true);
      const data = await getParticipantsByTroubleId(troubleId);
      setParticipants(data);
    } catch (error) {
      console.error("参加者取得エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-xl font-bold text-lightgreen-800">
              メッセージ
            </h1>
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
              <div className="h-8 w-8 bg-orange-500 text-white font-semibold flex items-center justify-center">
                {troubleInfo.userInitial}
              </div>
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        <div className="rounded-2xl border border-lightgreen-200 bg-white p-3 shadow-sm mb-4">
          <h3 className="font-medium text-sm mb-2 text-lightgreen-800">
            お困りごと情報
          </h3>
          <div className="space-y-2">
            <div>
              <h4 className="font-medium text-sm text-lightgreen-800">
                {troubleInfo.projectTitle || "プロジェクトが選択されていません"}
              </h4>
              <p className="text-xs text-lightgreen-600">
                {troubleInfo.projectOwner
                  ? `${troubleInfo.projectOwner}`
                  : "オーナー不明"}
              </p>
            </div>
            <div>
              <h5 className="text-xs font-medium text-lightgreen-700">詳細</h5>
              <p className="text-xs text-lightgreen-600">
                {troubleInfo.troubleDescription ||
                  "お困りごとの詳細情報がありません。お困りごとを選択してください。"}
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

          {isLoading ? (
            <div className="flex justify-center py-2">
              <div className="text-lightgreen-600 text-sm">読み込み中...</div>
            </div>
          ) : participants.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 px-1">
              {participants.map((participant) => (
                <div
                  key={participant.user_id}
                  className="flex flex-col items-center min-w-[70px] bg-lightgreen-50 rounded-xl p-2 shadow-sm"
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 mb-2 border-2 border-lightgreen-200 shadow-sm ring-2 ring-white">
                      <AvatarFallback
                        className={
                          participant.role === "オーナー"
                            ? "bg-amber-700 text-white font-semibold"
                            : "bg-orange-500 text-white font-semibold"
                        }
                      >
                        {participant.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {participant.role === "オーナー" && (
                      <div className="absolute -bottom-1 -right-1 bg-lightgreen-500 text-white rounded-full p-1 shadow-sm">
                        <Crown className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-medium text-lightgreen-800">
                    {participant.name}
                  </div>
                  <div className="text-[10px] text-lightgreen-600 bg-lightgreen-200 px-2 py-0.5 rounded-full mt-1">
                    {participant.role}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-2 text-lightgreen-600 text-sm">
              参加者がいません
            </div>
          )}
        </div>

        <MessageThread />
      </main>

      <MobileNav />
    </div>
  );
}
