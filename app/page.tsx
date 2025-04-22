"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  PlusCircle,
  Bell,
  MessageSquare,
  ChevronRight,
  Star,
  Users,
  CalendarDays,
  Heart, // Heartアイコンを追加
} from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// プロジェクト型定義
interface Project {
  id: number;
  project_id: number;
  title: string;
  description: string;
  owner: string;
  creator_name: string;
  status: string;
  category: string;
  createdAt: string;
  created_at: string;
  isFavorite: boolean;
  is_favorite: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedProjects, setLikedProjects] = useState<Project[]>([]);

  // 過去24時間のプロジェクト取得
  useEffect(() => {
    const fetchRecentProjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 過去24時間のプロジェクト取得

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("認証情報がありません。ログインしてください。");
        }

        const response = await fetch(
          //  `http://localhost:8000/api/v1/projects/recent`,
          `/api/v1/projects/recent`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          // エラーレスポンスの詳細情報を取得
          const errorText = await response.text();
          console.error("エラーレスポンス:", errorText);

          try {
            const errorJson = JSON.parse(errorText);
            console.error("エラー詳細:", errorJson);
          } catch (e) {
            // JSONとして解析できない場合はスキップ
          }

          throw new Error(`APIエラー: ${response.status}`);
        }

        const data = await response.json();
        console.log("取得した過去24時間のプロジェクト:", data);

        if (!Array.isArray(data)) {
          throw new Error("予期しないレスポンス形式: 配列が期待されていました");
        }

        // 修正: データ整形用の関数を追加し型変換を強化
        const formatProject = (item) => {
          // 修正: project_id が文字列の場合に整数変換を追加
          const projectId =
            typeof item.project_id === "string"
              ? parseInt(item.project_id, 10)
              : item.project_id;

          return {
            id: projectId, // 数値を保証
            project_id: projectId, // 数値を保証
            title: item.title || "",
            description: item.description || "",
            owner: item.creator_name || "",
            creator_name: item.creator_name || "",
            status: "active",
            category: item.category?.name || "その他",
            createdAt: item.created_at || new Date().toISOString(),
            created_at: item.created_at || new Date().toISOString(),
            isFavorite: Boolean(item.is_favorite),
            is_favorite: Boolean(item.is_favorite),
          };
        };

        // 新着プロジェクトの処理
        const recentProjects = data.map(formatProject);
        setProjects(recentProjects);

        // 修正: いいねプロジェクト取得のエラーハンドリングを強化
        try {
          const favoritesResponse = await fetch(`/api/v1/projects/favorites`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (favoritesResponse.ok) {
            const favoritesData = await favoritesResponse.json();
            console.log("取得したいいねプロジェクト:", favoritesData);

            if (Array.isArray(favoritesData)) {
              const formattedLikedProjects = favoritesData.map(formatProject);
              setLikedProjects(formattedLikedProjects);
            } else {
              console.warn(
                "いいねプロジェクトのレスポンス形式が予期しない形式です"
              );
              setLikedProjects([]);
            }
          } else {
            const errorText = await favoritesResponse.text();
            console.error("いいねプロジェクトエラー:", errorText);
            setLikedProjects([]);
          }
        } catch (favError) {
          console.error("いいねプロジェクト取得エラー:", favError);
          setLikedProjects([]);
          // メイン処理は継続するため、ここではエラーをスローしない
        }
      } catch (err) {
        console.error("プロジェクト取得エラー:", err);
        setError(
          err instanceof Error ? err.message : "データの取得に失敗しました"
        );
        setProjects([]);
        setLikedProjects([]); // 追加: エラー時は空配列をセット
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentProjects();
  }, []);

  // プロジェクト選択時の処理
  const handleProjectSelect = (project: Project) => {
    console.log("Project selected:", project);
    setSelectedProject(project);

    // ローカルストレージに保存
    try {
      localStorage.setItem("selectedProjectId", project.id.toString());
      localStorage.setItem("selectedProjectTitle", project.title);
      localStorage.setItem("selectedProjectDescription", project.description);
      localStorage.setItem("selectedProjectOwner", project.owner);

      // 選択通知
      toast({
        title: "プロジェクト選択",
        description: `「${project.title}」を選択しました`,
      });
    } catch (error) {
      console.error("プロジェクト情報の保存エラー:", error);
    }
  };

  // ロード中の表示
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-lightgreen-50 to-white">
        <div className="text-lightgreen-700">読み込み中...</div>
      </div>
    );
  }

  // プロジェクトカード表示コンポーネント
  const ProjectsList = ({
    title,
    projects,
    icon,
  }: {
    title: string;
    projects: Project[];
    icon?: React.ReactNode;
  }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-lightgreen-800 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h2>
        {title === "過去24時間の新着プロジェクト" && (
          <Link href="/projects/create">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-lightgreen-300 text-lightgreen-700 hover:bg-lightgreen-100"
            >
              <PlusCircle className="mr-1 h-4 w-4" />
              新規
            </Button>
          </Link>
        )}
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className={cn(
                "overflow-hidden hover:shadow-md transition-all cursor-pointer border-lightgreen-200",
                project.isFavorite && "bg-lightgreen-50/50"
              )}
              onClick={() => handleProjectSelect(project)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lightgreen-800">
                    {project.title}
                  </h3>
                  <button className="text-lightgreen-400 hover:text-yellow-500 transition-colors">
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
        </div>
      ) : (
        <div className="p-6 text-center border border-dashed border-lightgreen-300 rounded-xl bg-lightgreen-50">
          <p className="text-lightgreen-700 mb-2">
            {title === "過去24時間の新着プロジェクト"
              ? "過去24時間に作成されたプロジェクトはありません"
              : "いいねしたプロジェクトはありません"}
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
      )}
    </div>
  );

  return (
    <div className="pb-20 bg-gradient-to-b from-lightgreen-50 to-white">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-lightgreen-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-lightgreen-800">
            共創プラットフォーム（テスト版）
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
        {/* 選択中のプロジェクト情報表示エリア */}
        {selectedProject && (
          <div className="mb-6 bg-white rounded-2xl border border-lightgreen-200 p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-2 text-lightgreen-800">
              選択中のプロジェクト
            </h2>
            <div className="bg-lightgreen-50 rounded-lg p-3 border border-lightgreen-200">
              <h3 className="font-medium text-lightgreen-800">
                {selectedProject.title}
              </h3>
              <p className="text-sm text-lightgreen-600 mt-1">
                {selectedProject.description}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-lightgreen-500">
                  オーナー: {selectedProject.owner}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-lightgreen-300 text-lightgreen-700 hover:bg-lightgreen-100"
                  onClick={() => router.push("/troubles")}
                >
                  <MessageSquare className="mr-1 h-3 w-3" />
                  お困りごとを見る
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 新着プロジェクト一覧表示 */}
        <ProjectsList
          title="過去24時間の新着プロジェクト"
          projects={projects}
        />

        {/* いいねしたプロジェクト一覧表示 */}
        <ProjectsList
          title="いいねしたプロジェクト"
          projects={likedProjects}
          icon={<Heart className="h-5 w-5 text-red-500" />}
        />

        {/* エラー表示 */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 mt-4">
            <p className="font-medium">エラーが発生しました</p>
            <p className="text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => window.location.reload()}
            >
              再読み込み
            </Button>
          </div>
        )}

        <div className="space-y-6">
          <Link href="/troubles">
            <Button className="w-full bg-lightgreen-500 hover:bg-lightgreen-600 text-white rounded-full shadow-md hover:shadow-lg transition-all">
              <MessageSquare className="mr-2 h-4 w-4" />
              お困りごとリスト
            </Button>
          </Link>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
