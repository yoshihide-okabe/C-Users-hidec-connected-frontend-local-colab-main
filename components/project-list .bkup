"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Bookmark, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

// 開発用フラグ
// APIが実装されたらfalseに変更する
const USE_DUMMY_DATA = true;
const ENABLE_DEBUG_LOGS = true; // デバッグログを有効化

// カテゴリによって色を変える関数
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    テクノロジー: "bg-blue-500",
    デザイン: "bg-purple-500",
    マーケティング: "bg-yellow-500",
    ビジネス: "bg-indigo-500",
    教育: "bg-orange-500",
    ヘルスケア: "bg-red-500",
    環境: "bg-green-500",
    コミュニティ: "bg-blue-400",
    その他: "bg-gray-500",
    医療: "bg-red-500",
    農業: "bg-green-500",
  };

  return colors[category] || "bg-lightgreen-500";
};

export interface Project {
  id: number;
  title: string;
  description: string;
  owner: string;
  status: string;
  category: string;
  createdAt: string;
  isFavorite?: boolean;
}

interface ProjectListProps {
  type: "new" | "favorite";
  onSelectProject: (project: Project) => void;
}

export function ProjectList({ type, onSelectProject }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);

      // ダミーデータを取得する関数
      const getDummyProjects = () => {
        if (ENABLE_DEBUG_LOGS) console.log("ダミーデータを使用します");
        const now = new Date();

        return [
          {
            id: 1,
            title: "地域コミュニティアプリの開発",
            description:
              "地域の交流を活性化するためのアプリを開発しています。お祭りや地域活動の告知、参加者募集などができます。",
            owner: "キツネ",
            status: "active",
            category: "テクノロジー",
            createdAt: new Date(
              now.getTime() - 2 * 60 * 60 * 1000
            ).toISOString(), // 2時間前
            isFavorite: type === "favorite",
          },
          {
            id: 2,
            title: "サステナブルファッションブランドの立ち上げ",
            description:
              "環境に配慮した素材を使用し、エシカルな製造プロセスによるファッションブランドを立ち上げます。",
            owner: "パンダ",
            status: "active",
            category: "ビジネス",
            createdAt: new Date(
              now.getTime() - 3 * 60 * 60 * 1000
            ).toISOString(), // 3時間前
            isFavorite: type === "favorite",
          },
          {
            id: 3,
            title: "高齢者向け健康管理アプリ",
            description:
              "高齢者の健康状態を簡単に記録・管理できるアプリを開発。家族や医療機関との情報共有も可能。",
            owner: "ウサギ",
            status: "active",
            category: "医療",
            createdAt: new Date(
              now.getTime() - 5 * 60 * 60 * 1000
            ).toISOString(), // 5時間前
            isFavorite: type === "favorite",
          },
          {
            id: 4,
            title: "環境に優しい配送サービス",
            description:
              "電気自動車やカーゴバイクを活用した、CO2排出量を抑えた都市部向け配送サービスを展開します。",
            owner: "カメ",
            status: "active",
            category: "環境",
            createdAt: new Date(
              now.getTime() - 8 * 60 * 60 * 1000
            ).toISOString(), // 8時間前
            isFavorite: type === "favorite",
          },
          {
            id: 5,
            title: "子ども向けプログラミング教室",
            description:
              "小学生を対象に、楽しみながらプログラミングの基礎を学べる教室を運営。創造力と論理的思考を育みます。",
            owner: "ペンギン",
            status: "active",
            category: "教育",
            createdAt: new Date(
              now.getTime() - 10 * 60 * 60 * 1000
            ).toISOString(), // 10時間前
            isFavorite: type === "favorite",
          },
          {
            id: 6,
            title: "地域農産物直売所アプリ",
            description:
              "地元農家の新鮮な農産物を直接消費者に届けるマッチングアプリ。地産地消を促進します。",
            owner: "イヌ",
            status: "active",
            category: "農業",
            createdAt: new Date(
              now.getTime() - 12 * 60 * 60 * 1000
            ).toISOString(), // 12時間前
            isFavorite: type === "favorite",
          },
        ];
      };

      try {
        // 開発用フラグを使用
        if (USE_DUMMY_DATA) {
          // 開発中はダミーデータを使用
          const dummyProjects = getDummyProjects();
          setProjects(dummyProjects);
          return;
        }

        // APIが実装された後の処理
        // トークンの取得
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("認証情報がありません");
          setError("認証情報がありません。再ログインしてください。");
          setProjects(getDummyProjects());
          return;
        }

        // APIエンドポイントの設定
        const endpoint =
          type === "new"
            ? "http://localhost:8000/api/v1/projects/recent"
            : "http://localhost:8000/api/v1/projects/favorites";

        if (ENABLE_DEBUG_LOGS) console.log(`APIリクエスト送信: ${endpoint}`);

        // APIリクエスト
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (ENABLE_DEBUG_LOGS)
          console.log(`APIレスポンス: status=${response.status}`);

        if (!response.ok) {
          if (ENABLE_DEBUG_LOGS)
            console.error(
              `APIエラー: ${response.status} ${response.statusText}`
            );
          // エラーをスローするが、ダミーデータを使用するフラグを設定
          throw new Error("use_dummy_data");
        }

        const data = await response.json();
        if (ENABLE_DEBUG_LOGS) console.log("APIデータ取得成功:", data);

        // データが配列でない場合のハンドリング
        if (!Array.isArray(data)) {
          if (ENABLE_DEBUG_LOGS)
            console.error("APIレスポンスが配列ではありません:", data);
          throw new Error("use_dummy_data");
        }

        // 日付を整形してプロジェクトリストを設定
        const formattedProjects = data.map((project: any) => ({
          id: project.project_id,
          title: project.title,
          description: project.description || "説明はありません",
          owner: project.owner_name || "不明",
          status: project.status || "active",
          category: project.category_name || "その他",
          createdAt: project.created_at,
          isFavorite: project.is_favorite || false,
        }));

        setProjects(formattedProjects);
      } catch (err) {
        console.error("プロジェクト取得エラー:", err);

        // エラーメッセージを設定
        if (err instanceof Error && err.message !== "use_dummy_data") {
          setError(err.message);
        } else {
          // エラーメッセージを表示しない（ダミーデータを使用するため）
          setError(null);
        }

        // ダミーデータを設定
        setProjects(getDummyProjects());
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [type]);

  const toggleFavorite = async (projectId: number, event: React.MouseEvent) => {
    // バブリングを停止してプロジェクト選択イベントが発火しないようにする
    event.stopPropagation();

    try {
      // 開発用フラグを使用
      if (USE_DUMMY_DATA) {
        if (ENABLE_DEBUG_LOGS)
          console.log("ダミーモード: お気に入り状態をトグルします");

        // 現在のお気に入り状態を取得
        const project = projects.find((p) => p.id === projectId);
        if (!project) return;

        // フロントエンドの状態だけを更新
        setProjects((prevProjects) =>
          prevProjects.map((p) =>
            p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p
          )
        );

        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("認証情報がありません");
        // ユーザーに通知せずに、UIの状態のみ更新
        const project = projects.find((p) => p.id === projectId);
        if (!project) return;

        setProjects((prevProjects) =>
          prevProjects.map((p) =>
            p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p
          )
        );
        return;
      }

      // 現在のお気に入り状態を取得
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      const isFavorite = project.isFavorite;

      // APIエンドポイントとメソッドを設定
      const endpoint = `http://localhost:8000/api/v1/projects/${projectId}/favorite`;
      const method = isFavorite ? "DELETE" : "POST";

      if (ENABLE_DEBUG_LOGS)
        console.log(`お気に入り操作: ${method} ${endpoint}`);

      // 先にUIを更新（オプティミスティックUI更新）
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === projectId ? { ...p, isFavorite: !isFavorite } : p
        )
      );

      // APIリクエスト
      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (ENABLE_DEBUG_LOGS)
        console.log(`お気に入り操作レスポンス: status=${response.status}`);

      if (!response.ok) {
        if (ENABLE_DEBUG_LOGS)
          console.error(
            `お気に入り操作エラー: ${response.status} ${response.statusText}`
          );

        // APIエラーの場合は元の状態に戻す（ロールバック）
        setProjects((prevProjects) =>
          prevProjects.map((p) =>
            p.id === projectId ? { ...p, isFavorite: isFavorite } : p
          )
        );

        // エラーをスローしない（UIは既に更新済み）
        return;
      }

      // 成功の場合は既にUIが更新されているので何もしない
    } catch (err) {
      console.error("お気に入り操作エラー:", err);

      // エラー発生時も、UIの状態を適切に更新
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      // オプティミスティックUI更新
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse text-lightgreen-700">読み込み中...</div>
      </div>
    );
  }

  if (error && projects.length === 0) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 my-4">
        <p>{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-lightgreen-50 text-lightgreen-700 p-4 rounded-lg border border-lightgreen-200 my-4">
        <p>
          {type === "new"
            ? "新着プロジェクトはありません"
            : "お気に入りのプロジェクトはありません"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-xl border border-lightgreen-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
            onClick={() => onSelectProject(project)}
          >
            {/* カラーバー（カテゴリによって色を変える） */}
            <div
              className={`h-1 w-full ${getCategoryColor(project.category)}`}
            />

            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <div className="h-8 w-8 rounded-full bg-amber-700 text-white text-xs flex items-center justify-center">
                      {project.owner.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lightgreen-800 text-lg line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-lightgreen-600">
                      {project.owner}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {type === "new" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-lightgreen-500 hover:text-lightgreen-700 hover:bg-lightgreen-100"
                      onClick={(e) => toggleFavorite(project.id, e)}
                      aria-label="お気に入りに追加"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 10v12" />
                        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                      </svg>
                    </Button>
                  )}
                  {type === "favorite" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-lightgreen-100"
                      onClick={(e) => toggleFavorite(project.id, e)}
                      aria-label="お気に入りから削除"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 14V2" />
                        <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
                      </svg>
                    </Button>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <span className="inline-block px-2 py-1 text-xs rounded-full text-lightgreen-700 bg-lightgreen-100 mb-2">
                  {project.category}
                </span>
              </div>

              <p className="text-sm text-lightgreen-600 mb-3 line-clamp-2">
                {project.description}
              </p>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-lightgreen-500 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                    <span className="text-xs text-lightgreen-700">
                      {Math.floor(Math.random() * 30) + 10}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-lightgreen-500 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <span className="text-xs text-lightgreen-700">
                      {Math.floor(Math.random() * 12) + 3}
                    </span>
                  </div>
                </div>
                <div className="flex items-center text-xs text-lightgreen-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {formatDistanceToNow(new Date(project.createdAt), {
                    addSuffix: true,
                    locale: ja,
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-4 mt-2">
        <Link href={`/projects/${type}`}>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-lightgreen-600 hover:text-lightgreen-700 hover:bg-lightgreen-100"
          >
            {type === "new"
              ? "新着プロジェクトをもっと見る"
              : "お気に入りをもっと見る"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
