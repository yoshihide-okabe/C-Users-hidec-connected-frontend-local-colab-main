"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Send } from "lucide-react";
import { getTroublesByProject } from "@/services/trouble";

// <!-- 修正: ApiTroubleインターフェースを追加 -->
// APIから取得するトラブルの型
interface ApiTrouble {
  id: number;
  description: string;
  status: string;
  categoryId: number;
  projectId: number;
  creatorName: string;
  createdAt: string;
  commentCount: number;
}

interface Trouble {
  id: number;
  title: string;
  description: string;
  category: string;
  status: "解決済み" | "未解決" | "対応中";
  createdAt: string;
  commentCount: number;
  // 追加: カテゴリーIDとカテゴリー名を保持
  categoryId: number;
  categoryName?: string;
}

// 修正: props型にonTroubleSelectを追加
interface TroubleListProps {
  projectId?: string;
  // 追加: 選択ハンドラーのプロパティ
  onTroubleSelect?: (trouble: {
    id: number;
    description: string;
    status: string;
    categoryId: number;
    categoryName?: string;
    projectId: number;
    creatorName: string;
    createdAt: string;
    commentCount: number;
  }) => void;
}

// カテゴリに基づいた色を取得する関数
function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    "UI/UXデザイン": "bg-purple-500",
    コンテンツ制作: "bg-blue-500",
    モバイル開発: "bg-orange-500",
  };

  return colors[category] || "bg-lightgreen-500";
}

// カテゴリに基づいたバッジスタイルを取得する関数
function getCategoryBadgeStyle(category: string) {
  const styles: Record<string, string> = {
    "UI/UXデザイン": "bg-purple-50 text-purple-700 border-purple-200",
    コンテンツ制作: "bg-blue-50 text-blue-700 border-blue-200",
    モバイル開発: "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    styles[category] ||
    "bg-lightgreen-50 text-lightgreen-700 border-lightgreen-200"
  );
}

// <!-- 修正: カテゴリIDを名前に変換する関数を追加 -->
// カテゴリIDを名前に変換する関数
function getCategoryName(categoryId: number): string {
  // カテゴリIDと名前のマッピング
  const categoryMap: Record<number, string> = {
    1: "技術問題",
    2: "設計・企画",
    3: "UI/UXデザイン",
    4: "コンテンツ制作",
    5: "モバイル開発",
    // 他のカテゴリも追加
  };

  return categoryMap[categoryId] || "その他";
}

export function TroubleList({ projectId, onTroubleSelect }: TroubleListProps) {
  const [troubles, setTroubles] = useState<Trouble[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // <!-- 修正: エラー状態を追加 -->
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTroubles = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // ローカルストレージからプロジェクトIDを取得、またはpropsから受け取る
        const selectedProjectId =
          projectId || localStorage.getItem("selectedProjectId");

        if (!selectedProjectId) {
          console.warn("プロジェクトIDが見つかりません");
          setIsLoading(false);
          return;
        }

        console.log("TroubleList - プロジェクトID:", selectedProjectId);

        // 既に実装済みのgetTroublesByProject関数を使用
        const { troubles: fetchedTroubles } = await getTroublesByProject(
          selectedProjectId
        );

        if (!fetchedTroubles || fetchedTroubles.length === 0) {
          setTroubles([]);
          setIsLoading(false);
          return;
        }

        // 結果をUI用のTrouble型に変換
        const formattedTroubles: Trouble[] = fetchedTroubles.map((trouble) => {
          // カテゴリー名を先に定義
          const categoryName = getCategoryName(trouble.categoryId);

          return {
            id: trouble.id,
            title: trouble.description.split("\n")[0] || "無題のお困りごと",
            description: trouble.description,
            category: categoryName, // ここで定義済みの変数を使用
            categoryId: trouble.categoryId,
            categoryName, // ショートハンドプロパティ（ES6構文）
            status: trouble.status === "解決" ? "解決済み" : "未解決",
            createdAt: trouble.createdAt,
            commentCount: trouble.commentCount,
          };
        });

        setTroubles(formattedTroubles);
      } catch (error) {
        console.error("お困りごと取得エラー:", error);
        setError("お困りごとの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTroubles();
  }, [projectId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "解決済み":
        return "bg-green-100 text-green-700";
      case "対応中":
        return "bg-blue-100 text-blue-700";
      case "未解決":
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  // 追加: お困りごとのクリックハンドラー
  const handleTroubleClick = (event: React.MouseEvent, trouble: Trouble) => {
    if (onTroubleSelect) {
      // デフォルトのリンク遷移を防止
      event.preventDefault();
      // イベントの伝播も停止
      event.stopPropagation();

      // 親コンポーネントに選択されたお困りごとを通知
      onTroubleSelect({
        id: trouble.id,
        description: trouble.description,
        status: trouble.status === "解決済み" ? "解決" : "未解決",
        categoryId: trouble.categoryId,
        categoryName: trouble.categoryName,
        projectId: parseInt(projectId || "0"),
        creatorName: "ユーザー", // 実際の作成者名はAPIから取得する必要があります
        createdAt: trouble.createdAt,
        commentCount: trouble.commentCount,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-6 flex justify-center">
        <div className="text-lightgreen-600">読み込み中...</div>
      </div>
    );
  }

  // <!-- 修正: エラー表示を追加 -->
  if (error) {
    return (
      <div className="w-full py-6 bg-red-50 rounded-xl border border-red-200 flex flex-col items-center justify-center">
        <p className="text-red-700 mb-2">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="border-red-300 text-red-700 hover:bg-red-100"
          onClick={() => window.location.reload()}
        >
          再読み込み
        </Button>
      </div>
    );
  }

  if (troubles.length === 0) {
    return (
      <div className="w-full py-6 bg-lightgreen-50 rounded-xl border border-lightgreen-200 flex flex-col items-center justify-center">
        <p className="text-lightgreen-700 mb-2">お困りごとはありません</p>
        <Link href="/troubles/create">
          <Button
            variant="outline"
            size="sm"
            className="border-lightgreen-300 text-lightgreen-700 hover:bg-lightgreen-100"
          >
            お困りごとを登録する
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {troubles.map((trouble) => (
        <div
          key={trouble.id}
          onClick={(e) => handleTroubleClick(e, trouble)}
          className="cursor-pointer"
        >
          <div className="rounded-xl border border-lightgreen-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(
                      trouble.status
                    )}`}
                  >
                    {trouble.status}
                  </span>
                  <span className="bg-lightgreen-100 text-lightgreen-700 px-2 py-0.5 rounded-full text-xs">
                    {trouble.category}
                  </span>
                </div>
                <h3 className="font-medium text-lightgreen-800 mt-1">
                  {trouble.title}
                </h3>
                <p className="text-xs text-lightgreen-600 mt-1">
                  {trouble.description.length > 100
                    ? `${trouble.description.substring(0, 100)}...`
                    : trouble.description}
                </p>
              </div>
              <div className="text-lightgreen-500 ml-2">
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-lightgreen-500">
                {new Date(trouble.createdAt).toLocaleDateString("ja-JP")}
              </span>
              <div className="flex items-center text-xs text-lightgreen-600">
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                {trouble.commentCount}件のコメント
              </div>
            </div>
          </div>
        </div>
      ))}

      <Link href="/troubles" className="mt-1">
        <Button
          variant="ghost"
          className="w-full text-lightgreen-700 hover:bg-lightgreen-100"
        >
          すべてのお困りごとを見る
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
