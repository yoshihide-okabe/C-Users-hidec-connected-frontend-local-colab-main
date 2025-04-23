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

interface Trouble {
  id: number;
  title: string;
  description: string;
  category: string;
  status: "解決済み" | "未解決" | "対応中";
  createdAt: string;
  commentCount: number;
}

interface TroubleListProps {
  projectId?: string;
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

export function TroubleList({ projectId }: TroubleListProps) {
  const [troubles, setTroubles] = useState<Trouble[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 通常はAPIからお困りごと一覧を取得するが、
    // ここではダミーデータを使用する
    const fetchTroubles = async () => {
      try {
        // APIコール（実装時にコメントアウトを解除）
        // const response = await fetch(`/api/troubles?projectId=${projectId}`);
        // const data = await response.json();
        // setTroubles(data);

        console.log("TroubleList - projectId:", projectId);

        // ダミーデータ（実際の実装時は削除）
        setTimeout(() => {
          const dummyTroubles: Trouble[] = [
            {
              id: 1,
              title: "ユーザー登録フローの改善",
              description:
                "現在のユーザー登録フローが複雑で、ユーザーの離脱率が高いです。より簡単で直感的な登録フローにしたいと考えています。",
              category: "UX/UI",
              status: "未解決",
              createdAt: "2024-04-10T12:00:00Z",
              commentCount: 5,
            },
            {
              id: 2,
              title: "学習コンテンツの多言語対応",
              description:
                "現在は日本語のみのコンテンツですが、英語、中国語、スペイン語への対応が必要です。翻訳リソースが不足しています。",
              category: "コンテンツ",
              status: "対応中",
              createdAt: "2024-04-12T09:30:00Z",
              commentCount: 8,
            },
            {
              id: 3,
              title: "モバイル版のパフォーマンス改善",
              description:
                "モバイルデバイスでの読み込み速度が遅く、特に通信環境が悪い場所ではアプリが使いづらいという声があります。",
              category: "技術",
              status: "解決済み",
              createdAt: "2024-04-05T14:20:00Z",
              commentCount: 12,
            },
          ];

          // プロジェクトIDがある場合、そのIDに関連するお困りごとのみをフィルタリング
          // 実際のアプリでは適切なAPI呼び出しに置き換える
          if (projectId) {
            // このサンプルではプロジェクトIDによるフィルタリングを模倣していない
            setTroubles(dummyTroubles);
          } else {
            setTroubles(dummyTroubles);
          }

          setIsLoading(false);
        }, 500); // 読み込み時間をシミュレート
      } catch (error) {
        console.error("Error fetching troubles:", error);
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

  if (isLoading) {
    return (
      <div className="w-full py-6 flex justify-center">
        <div className="text-lightgreen-600">読み込み中...</div>
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
        <Link href={`/troubles/${trouble.id}`} key={trouble.id}>
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
        </Link>
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
