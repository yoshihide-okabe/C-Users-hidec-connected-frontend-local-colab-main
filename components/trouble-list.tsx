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
// ====== 修正: getTroubleCategories をインポート ======
import {
  getTroublesByProject,
  getTroubleCategories,
  TroubleCategory,
} from "@/services/trouble";

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
    // ====== 追加: 他のカテゴリーの色も定義 ======
    技術問題: "bg-red-500",
    "設計・企画": "bg-green-500",
  };

  return colors[category] || "bg-lightgreen-500";
}

// カテゴリに基づいたバッジスタイルを取得する関数
function getCategoryBadgeStyle(category: string) {
  const styles: Record<string, string> = {
    "UI/UXデザイン": "bg-purple-50 text-purple-700 border-purple-200",
    コンテンツ制作: "bg-blue-50 text-blue-700 border-blue-200",
    モバイル開発: "bg-orange-50 text-orange-700 border-orange-200",
    // ====== 追加: 他のカテゴリーのスタイルも定義 ======
    技術問題: "bg-red-50 text-red-700 border-red-200",
    "設計・企画": "bg-green-50 text-green-700 border-green-200",
  };

  return (
    styles[category] ||
    "bg-lightgreen-50 text-lightgreen-700 border-lightgreen-200"
  );
}

export function TroubleList({ projectId, onTroubleSelect }: TroubleListProps) {
  const [troubles, setTroubles] = useState<Trouble[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ====== 追加: カテゴリー関連のステート ======
  const [categories, setCategories] = useState<TroubleCategory[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  // ====== カテゴリー関連のステート追加ここまで ======

  // ====== 追加: カテゴリー情報をAPIから取得する処理 ======
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getTroubleCategories();
        setCategories(categoriesData);

        // カテゴリーIDと名前のマッピングを作成
        const catMap: Record<number, string> = {};
        categoriesData.forEach((cat) => {
          catMap[cat.category_id] = cat.name;
        });
        setCategoryMap(catMap);
      } catch (error) {
        console.error("カテゴリー取得エラー:", error);
        // エラー時もデフォルトカテゴリーを設定
        setCategoryMap({
          1: "技術問題",
          2: "設計・企画",
          3: "UI/UXデザイン",
          4: "コンテンツ制作",
          5: "モバイル開発",
        });
      }
    };

    fetchCategories();
  }, []);
  // ====== カテゴリー取得処理追加ここまで ======

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
          const categoryName = categoryMap[trouble.categoryId] || "その他";
          // ====== カテゴリー名取得方法の修正ここまで ======

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

    // ====== 修正: カテゴリーマップが準備できたらトラブルを取得するように変更 ======
    if (Object.keys(categoryMap).length > 0) {
      fetchTroubles();
    }
  }, [projectId, categoryMap]); // ====== 修正: 依存配列にcategoryMapを追加 ======

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

  // ====== 追加: フィルター適用したトラブル一覧を取得する関数 ======
  const getFilteredTroubles = () => {
    let filtered = troubles;

    // カテゴリーフィルター
    if (selectedCategory !== null) {
      filtered = filtered.filter((t) => t.categoryId === selectedCategory);
    }

    // ステータスフィルター
    if (selectedStatus !== null) {
      filtered = filtered.filter((t) => t.status === selectedStatus);
    }

    return filtered;
  };
  // ====== フィルター関数追加ここまで ======

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

  // ====== 修正: フィルタリングされたトラブルリストを取得 ======
  const filteredTroubles = getFilteredTroubles();
  // ====== フィルター適用ここまで ======

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

  // ====== 追加: カテゴリーフィルターUI ======
  const renderCategoryFilters = () => {
    return (
      <div className="flex flex-wrap gap-2 pb-3 overflow-x-auto scrollbar-thin">
        {categories.map((category) => (
          <Button
            key={category.category_id}
            variant={
              selectedCategory === category.category_id ? "default" : "outline"
            }
            size="sm"
            className={`rounded-full text-xs ${
              selectedCategory === category.category_id
                ? "bg-lightgreen-500 text-white"
                : "border-lightgreen-300 bg-white text-lightgreen-700 hover:bg-lightgreen-50"
            }`}
            onClick={() =>
              setSelectedCategory(
                selectedCategory === category.category_id
                  ? null
                  : category.category_id
              )
            }
          >
            {category.name}
          </Button>
        ))}
      </div>
    );
  };
  // ====== カテゴリーフィルターUI追加ここまで ======

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
      {/* ====== 追加: カテゴリーフィルターを表示 ====== */}
      {categories.length > 0 && renderCategoryFilters()}

      {/* ====== 修正: filteredTroublesを使用 ====== */}
      {filteredTroubles.map((trouble) => (
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
                  {/* ====== 修正: 動的に取得したカテゴリー名を表示 ====== */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${getCategoryBadgeStyle(
                      trouble.categoryName || ""
                    )}`}
                  >
                    {trouble.categoryName || "その他"}
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
