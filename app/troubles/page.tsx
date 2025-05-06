"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Bell, Check } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { useToast } from "@/hooks/use-toast";
// インポート名を変更して衝突を回避
import { TroubleList as TroubleListComponent } from "@/components/trouble-list";
import { cn } from "@/lib/utils"; // ← cn関数をインポート追加

interface ProjectInfo {
  id: string;
  title: string;
  description: string;
  owner: string; // <!-- 修正: ownerフィールドを追加 -->
  category: string; // <!-- 修正: categoryフィールドを追加 -->
}

interface UserInfo {
  id: string;
  name: string;
}

// 追加: お困りごと型定義
interface Trouble {
  id: number;
  description: string;
  status: string;
  categoryId: number;
  categoryName?: string; // カテゴリー名を追加
  projectId: number;
  creatorName: string;
  createdAt: string;
  commentCount: number;
}

export default function TroublesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    id: "",
    title: "",
    description: "",
    owner: "",
    category: "",
  });
  const [userInfo, setUserInfo] = useState({
    id: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  // 追加: 選択中のお困りごと状態
  const [selectedTrouble, setSelectedTrouble] = useState<Trouble | null>(null);

  // 追加: お困りごとが選択されたときのハンドラー
  const handleTroubleSelect = (trouble: Trouble) => {
    setSelectedTrouble(trouble);

    // ローカルストレージに選択されたお困りごとを保存
    localStorage.setItem("selectedTroubleId", trouble.id.toString());
    localStorage.setItem("selectedTroubleDescription", trouble.description);
    localStorage.setItem("selectedTroubleStatus", trouble.status);
    if (trouble.categoryName) {
      localStorage.setItem("selectedTroubleCategory", trouble.categoryName);
    }

    toast({
      title: "お困りごと選択",
      description: `お困りごとを選択しました`,
    });
  };

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== "undefined") {
      try {
        // <!-- 修正: ローカルストレージからプロジェクト情報を正しく取得 -->
        const projectId = localStorage.getItem("selectedProjectId");
        const projectTitle = localStorage.getItem("selectedProjectTitle");
        const projectDescription = localStorage.getItem(
          "selectedProjectDescription"
        );
        const projectOwner =
          localStorage.getItem("selectedProjectOwner") || "不明";
        const projectCategory =
          localStorage.getItem("selectedProjectCategory") || "その他";

        // デバッグ用ログ
        console.log("Troubles page - localStorage values:", {
          projectId,
          projectTitle,
          projectDescription,
          projectOwner, // <!-- 修正: ログにOwnerを追加 -->
          projectCategory, // <!-- 修正: ログにカテゴリを追加 -->
        });

        // <!-- 修正: プロジェクト情報の検証とセット -->
        if (!projectId || !projectTitle) {
          console.log("No project selected");
          toast({
            title: "プロジェクトが選択されていません",
            description: "先にプロジェクトを選択してください",
            variant: "destructive",
          });
          router.push("/"); // <!-- 修正: ホームページに戻る -->
          return;
        }

        // 取得した情報をステートに設定
        setProjectInfo({
          id: projectId,
          title: projectTitle,
          description: projectDescription || "詳細情報がありません",
          owner: projectOwner, // <!-- 修正: Owner情報をセット -->
          category: projectCategory, // <!-- 修正: カテゴリ情報をセット -->
        });

        // ユーザー情報の取得
        const userId =
          localStorage.getItem("currentUserId") ||
          localStorage.getItem("userId");
        const userName =
          localStorage.getItem("currentUserName") ||
          localStorage.getItem("userName");

        if (userId && userName) {
          setUserInfo({
            id: userId,
            name: userName,
          });
        }

        // 追加: ローカルストレージから選択中のお困りごとを復元
        const troubleId = localStorage.getItem("selectedTroubleId");
        if (troubleId) {
          const description =
            localStorage.getItem("selectedTroubleDescription") || "";
          const status =
            localStorage.getItem("selectedTroubleStatus") || "未解決";
          const categoryName =
            localStorage.getItem("selectedTroubleCategory") || "その他";

          setSelectedTrouble({
            id: parseInt(troubleId),
            description,
            status,
            categoryId: 1, // ダミー値
            categoryName,
            projectId: parseInt(projectId || "0"),
            creatorName: userName || "不明",
            createdAt: new Date().toISOString(),
            commentCount: 0,
          });
        }
      } catch (error) {
        console.error("Error retrieving data from localStorage:", error);
        toast({
          title: "データ取得エラー",
          description: "情報の取得に失敗しました。もう一度お試しください。",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [router, toast]);

  // 追加: お困りごとのステータスに応じた色を取得する関数
  const getTroubleStatusColor = (status: string) => {
    switch (status) {
      case "解決":
        return "bg-green-100 text-green-700";
      case "対応中":
        return "bg-blue-100 text-blue-700";
      case "未解決":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  // ここを追加: メッセージ確認ページへの遷移処理
  const handleMessagesClick = () => {
    // 選択中のお困りごとがない場合
    if (!selectedTrouble) {
      toast({
        title: "選択が必要です",
        description: "先にお困りごとを選択してください",
        variant: "destructive",
      });
      return;
    }

    try {
      // 選択中のお困りごと情報が確実に保存されていることを確認
      if (!localStorage.getItem("selectedTroubleId")) {
        localStorage.setItem(
          "selectedTroubleId",
          selectedTrouble.id.toString()
        );
        localStorage.setItem(
          "selectedTroubleDescription",
          selectedTrouble.description
        );
        localStorage.setItem("selectedTroubleStatus", selectedTrouble.status);
        if (selectedTrouble.categoryName) {
          localStorage.setItem(
            "selectedTroubleCategory",
            selectedTrouble.categoryName
          );
        }
      }

      // メッセージページに遷移
      router.push("/messages");
    } catch (error) {
      console.error("画面遷移エラー:", error);
      toast({
        title: "エラー",
        description: "画面遷移中にエラーが発生しました",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-lightgreen-50 to-white">
        <div className="text-lightgreen-700">読み込み中...</div>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold text-lightgreen-800">
              お困りごとリスト
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
                {userInfo.name.charAt(0) || "ユ"}{" "}
                {/* <!-- 修正: ユーザー名の頭文字を表示 --> */}
              </div>
            </Button>
          </div>
        </div>
      </header>

      {/* 追加: 選択中のお困りごと表示 */}
      {selectedTrouble && (
        <div className="sticky top-[57px] z-10 bg-lightgreen-50/95 backdrop-blur-sm border-b border-lightgreen-200 px-4 py-2 shadow-sm">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-lightgreen-700 mr-2" />
            <span className="text-sm text-lightgreen-800 font-semibold mr-2">
              選択中のお困りごと:
            </span>
            <div className="flex items-center flex-1 min-w-0">
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full mr-2 whitespace-nowrap",
                  getTroubleStatusColor(selectedTrouble.status)
                )}
              >
                {selectedTrouble.status}
              </span>
              <h3 className="text-sm font-medium text-lightgreen-800 truncate">
                {selectedTrouble.description}
              </h3>
              {selectedTrouble.categoryName && (
                <span className="text-xs px-2 py-0.5 rounded-full ml-2 whitespace-nowrap bg-white border text-lightgreen-700">
                  {selectedTrouble.categoryName}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="px-4 py-4">
        <div className="mb-6">
          <div className="rounded-2xl border border-lightgreen-200 bg-white p-4 shadow-sm mb-4">
            <h3 className="font-medium mb-2 text-lightgreen-800">
              プロジェクト情報
            </h3>
            <div className="space-y-2">
              <div>
                <h4 className="font-medium text-sm text-lightgreen-800">
                  {projectInfo.title}
                </h4>
                <p className="text-xs text-lightgreen-600">
                  {projectInfo.owner}
                </p>
              </div>
              <div>
                <h5 className="text-xs font-medium text-lightgreen-700">
                  プロジェクト概要
                </h5>
                <p className="text-xs text-lightgreen-600">
                  {projectInfo.description}
                </p>
              </div>
              {projectInfo.category && (
                <div>
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-lightgreen-100 text-lightgreen-700">
                    {projectInfo.category}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* コンポーネント名を変更して使用 */}
          <TroubleListComponent
            projectId={projectInfo.id}
            onTroubleSelect={handleTroubleSelect} // ← ハンドラーを追加
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-lightgreen-200 bg-white p-4 shadow-sm mb-6">
            <h3 className="font-medium mb-2 text-lightgreen-800">
              活動ステータス
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-lightgreen-700">
                  解決したお困りごと
                </span>
                <span className="font-medium text-sm text-lightgreen-700">
                  3件
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-lightgreen-700">
                  貢献ポイント
                </span>
                <span className="font-medium text-sm text-lightgreen-700">
                  120pt
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-lightgreen-700">
                  感謝された回数
                </span>
                <span className="font-medium text-sm text-lightgreen-700">
                  5回
                </span>
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
  );
}
