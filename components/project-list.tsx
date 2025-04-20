"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, ChevronRight, Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
  onSelectProject?: (project: Project) => void;
}

export function ProjectList({ type, onSelectProject }: ProjectListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [type]);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // トークンの取得
      let token = localStorage.getItem("token");

      // トークンがない場合は開発用ダミーデータを使用
      if (!token) {
        console.warn("認証トークンがありません - モックデータを使用します");
        setProjects(getMockProjects(type));
        setIsLoading(false);
        return;
      }

      // トークンに「Bearer」プレフィックスを追加（存在しない場合のみ）
      if (!token.startsWith("Bearer ")) {
        token = `Bearer ${token}`;
      }

      console.log("API認証トークン形式:", token.substring(0, 15) + "...");

      // APIエンドポイントの構築
      let endpoint = "http://localhost:8000/api/v1/projects";
      if (type === "favorite") {
        endpoint = "http://localhost:8000/api/v1/projects/favorites";
      }

      console.log(`APIリクエスト: ${endpoint}`);

      // APIからデータの取得
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      if (!response.ok) {
        console.error(
          `API接続エラー: ${response.status} - ${response.statusText}`
        );

        // エラーの詳細情報を取得
        let errorDetail = "";
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || "";
          console.error("エラー詳細:", errorData);
        } catch (e) {
          // JSONとして解析できない場合はスキップ
        }

        throw new Error(
          `APIエラー: ${response.status}${
            errorDetail ? ` - ${errorDetail}` : ""
          }`
        );
      }

      const data = await response.json();
      console.log(`${type} projects data:`, data);

      // データが配列でない場合の処理
      const projectsArray = Array.isArray(data)
        ? data
        : data.results && Array.isArray(data.results)
        ? data.results
        : data.projects && Array.isArray(data.projects)
        ? data.projects
        : [];

      // データの変換・整形
      const formattedProjects: Project[] = projectsArray.map((item: any) => ({
        id: item.project_id || item.id,
        title: item.title,
        description: item.description || item.summary || "",
        owner: item.creator_name || item.owner_name || "フクロウ", // バックエンド互換にする
        status: item.status || "active",
        category:
          (item.category && item.category.name) ||
          item.category_name ||
          "その他",
        createdAt:
          item.created_at || item.createdAt || new Date().toISOString(),
        isFavorite: type === "favorite" || item.is_favorite || item.isFavorite,
      }));

      setProjects(formattedProjects);
    } catch (err) {
      console.error(`プロジェクト取得エラー (${type}):`, err);
      setError(
        err instanceof Error ? err.message : "データの取得に失敗しました"
      );

      // エラー時はモックデータを使用
      setProjects(getMockProjects(type));
    } finally {
      setIsLoading(false);
    }
  };

  // プロジェクト選択時の処理
  const handleSelectProject = (project: Project) => {
    if (onSelectProject) {
      onSelectProject(project);
    }
  };

  // お気に入り登録/解除の処理
  const toggleFavorite = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      let token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "エラー",
          description: "認証情報がありません。再ログインしてください。",
          variant: "destructive",
        });
        return;
      }

      // トークンに「Bearer」プレフィックスを追加（存在しない場合のみ）
      if (!token.startsWith("Bearer ")) {
        token = `Bearer ${token}`;
      }

      const url = `http://localhost:8000/api/v1/projects/${project.id}/favorite`;
      const method = project.isFavorite ? "DELETE" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error("お気に入り操作に失敗しました");
      }

      // UIを先に更新
      setProjects(
        projects.map((p) => {
          if (p.id === project.id) {
            return { ...p, isFavorite: !p.isFavorite };
          }
          return p;
        })
      );

      toast({
        title: project.isFavorite
          ? "お気に入りから削除しました"
          : "お気に入りに追加しました",
        description: project.title,
      });

      // リストの再取得（必要な場合）
      if (type === "favorite" && project.isFavorite) {
        fetchProjects();
      }
    } catch (error) {
      console.error("お気に入り操作エラー:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error ? error.message : "操作に失敗しました",
        variant: "destructive",
      });
    }
  };

  // ロード中の表示
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="h-28 bg-lightgreen-100/50 rounded-xl animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  // エラーの表示
  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
        <p className="font-medium">データの取得に失敗しました</p>
        <p className="text-sm">{error}</p>
        <Button
          size="sm"
          variant="outline"
          className="mt-2"
          onClick={() => fetchProjects()}
        >
          再試行
        </Button>
      </div>
    );
  }

  // プロジェクトデータがない場合の表示
  if (projects.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed border-lightgreen-300 rounded-xl bg-lightgreen-50">
        <p className="text-lightgreen-700 mb-2">
          {type === "new"
            ? "新しいプロジェクトがありません"
            : "お気に入りのプロジェクトがありません"}
        </p>
        <Link href="/projects/create">
          <Button
            size="sm"
            className="bg-lightgreen-500 hover:bg-lightgreen-600"
          >
            プロジェクトを作成
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {projects.map((project) => (
        <Card
          key={project.id}
          className={cn(
            "overflow-hidden hover:shadow-md transition-all cursor-pointer border-lightgreen-200",
            project.isFavorite && "bg-lightgreen-50/50"
          )}
          onClick={() => handleSelectProject(project)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-lightgreen-800">
                {project.title}
              </h3>
              <button
                onClick={(e) => toggleFavorite(project, e)}
                className="text-lightgreen-400 hover:text-yellow-500 transition-colors"
              >
                <Star
                  className={cn(
                    "h-5 w-5",
                    project.isFavorite && "fill-yellow-400 text-yellow-400"
                  )}
                />
              </button>
            </div>
            <p className="text-xs text-lightgreen-600 mb-3 line-clamp-2">
              {project.description}
            </p>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center text-lightgreen-600">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  {project.owner}
                </span>
                <span className="flex items-center text-lightgreen-600">
                  <CalendarDays className="h-3.5 w-3.5 mr-1" />
                  {new Date(project.createdAt).toLocaleDateString("ja-JP")}
                </span>
              </div>
              <span className="flex items-center text-lightgreen-500 hover:text-lightgreen-600">
                詳細を見る
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
      <Link
        href={`/projects/${type}`}
        className="flex justify-center mt-2 text-sm text-lightgreen-600 hover:text-lightgreen-700"
      >
        すべて表示
      </Link>
    </div>
  );
}

// 開発用モックデータ
function getMockProjects(type: "new" | "favorite"): Project[] {
  const baseProjects = [
    {
      id: 1,
      title: "オンライン学習プラットフォーム",
      description:
        "誰でも簡単にオンラインで学べるプラットフォームを開発しています。特に教育格差の解消を目指しています。",
      owner: "フクロウ",
      status: "active",
      category: "教育",
      createdAt: "2025-04-15T10:00:00Z",
      isFavorite: true,
    },
    {
      id: 2,
      title: "地域防災アプリ",
      description:
        "自然災害時に地域住民が助け合えるよう、災害情報と支援ニーズをマッチングするアプリを開発します。",
      owner: "タヌキ",
      status: "active",
      category: "防災",
      createdAt: "2025-04-14T14:30:00Z",
      isFavorite: false,
    },
    {
      id: 3,
      title: "高齢者向けコミュニケーションツール",
      description:
        "デジタルデバイドを解消し、高齢者が簡単に家族と繋がれるコミュニケーションツールを構築します。",
      owner: "パンダ",
      status: "active",
      category: "福祉",
      createdAt: "2025-04-13T09:15:00Z",
      isFavorite: type === "favorite",
    },
    {
      id: 4,
      title: "地元商店応援マップ",
      description:
        "地域の小さな商店を応援するための、特徴や魅力を共有できるインタラクティブマップを作成します。",
      owner: "キツネ",
      status: "active",
      category: "地域活性",
      createdAt: "2025-04-12T16:45:00Z",
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
      createdAt: "2025-04-10T11:30:00Z",
      isFavorite: true,
    },
  ];

  if (type === "favorite") {
    return baseProjects.filter((project) => project.isFavorite);
  }

  return baseProjects;
}
