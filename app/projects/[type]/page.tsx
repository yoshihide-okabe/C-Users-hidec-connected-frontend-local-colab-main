"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Bell, Star, ThumbsUp, MessageCircle } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getProjects, toggleFavorite, Project } from "@/services/projects";
// 修正/追加: ログアウト関数をインポート
import { logout } from "@/services/auth";

export default function ProjectsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState("ユ");

  // URLパラメータからタイプを取得
  const type =
    typeof params.type === "string"
      ? (params.type as "new" | "favorite")
      : "new";
  const title = type === "new" ? "新着プロジェクト" : "お気に入りプロジェクト";

  // 修正: ユーザー情報取得用のuseEffect追加
  useEffect(() => {
    const userName = localStorage.getItem("userName");
    if (userName && userName.length > 0) {
      setUserInitial(userName.charAt(0));
    }
  }, []);

  // 修正/追加: ログアウト処理のハンドラー関数
  const handleLogout = () => {
    logout();
    toast({
      title: "ログアウト成功",
      description: "ログアウトしました",
      variant: "default",
    });
    router.push("/login");
  };

  // プロジェクト一覧を取得
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // APIからプロジェクト一覧を取得
        const data = await getProjects(type as "new" | "favorite");
        setProjects(data);
      } catch (error) {
        console.error("プロジェクト取得エラー:", error);
        setError(
          error instanceof Error ? error.message : "データの取得に失敗しました"
        );
        toast({
          title: "エラー",
          description: "プロジェクト一覧の取得に失敗しました",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [type, toast]);

  // 修正: お気に入りトグル処理関数を追加
  const handleToggleFavorite = async (
    projectId: number,
    isFavorite: boolean,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // プロジェクト選択イベントを防止

    try {
      // APIを通じてお気に入り状態を切り替え
      await toggleFavorite(projectId, isFavorite);

      // プロジェクトリストの状態を更新
      setProjects(
        projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                isFavorite: !isFavorite,
                // 修正: いいね数も更新
                likesCount: !isFavorite
                  ? project.likesCount + 1
                  : Math.max(0, project.likesCount - 1),
              }
            : project
        )
      );

      toast({
        title: isFavorite ? "お気に入りから削除" : "お気に入りに追加",
        description: `プロジェクトを${
          isFavorite ? "お気に入りから削除" : "お気に入りに追加"
        }しました`,
      });
    } catch (error) {
      console.error("お気に入り操作エラー:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error
            ? error.message
            : "お気に入り操作に失敗しました",
        variant: "destructive",
      });
    }
  };

  // 修正: プロジェクト選択処理関数を追加
  const handleProjectSelect = (project: Project) => {
    // ローカルストレージに保存
    try {
      localStorage.setItem("selectedProjectId", project.id.toString());
      localStorage.setItem("selectedProjectTitle", project.title);
      localStorage.setItem("selectedProjectDescription", project.description);
      localStorage.setItem("selectedProjectOwner", project.owner);
      localStorage.setItem("selectedProjectCategory", project.category);

      toast({
        title: "プロジェクト選択",
        description: `「${project.title}」を選択しました`,
      });

      // ホーム画面に戻る
      router.push("/");
    } catch (error) {
      console.error("プロジェクト情報の保存エラー:", error);
      toast({
        title: "エラー",
        description: "プロジェクト情報の保存に失敗しました",
        variant: "destructive",
      });
    }
  };

  // 修正: カテゴリーに基づいた色とアイコンを取得する関数を追加
  function getCategoryStyle(category: string) {
    const styles: Record<
      string,
      { bgColor: string; textColor: string; icon: React.ReactNode }
    > = {
      テクノロジー: {
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
        icon: (
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
            テ
          </div>
        ),
      },
      環境: {
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        icon: (
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
            環
          </div>
        ),
      },
      ビジネス: {
        bgColor: "bg-amber-100",
        textColor: "text-amber-700",
        icon: (
          <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs">
            ビ
          </div>
        ),
      },
      教育: {
        bgColor: "bg-orange-100",
        textColor: "text-orange-700",
        icon: (
          <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">
            教
          </div>
        ),
      },
      医療: {
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        icon: (
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
            医
          </div>
        ),
      },
      コミュニティ: {
        bgColor: "bg-purple-100",
        textColor: "text-purple-700",
        icon: (
          <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
            コ
          </div>
        ),
      },
      ヘルスケア: {
        bgColor: "bg-pink-100",
        textColor: "text-pink-700",
        icon: (
          <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs">
            ヘ
          </div>
        ),
      },
      その他: {
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
        icon: (
          <div className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs">
            他
          </div>
        ),
      },
    };

    return styles[category] || styles["その他"];
  }

  // 修正: 時間を「◯時間前」の形式で表示する関数を追加
  function getTimeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "たった今";
    } else if (diffInHours < 24) {
      return `約${diffInHours}時間前`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `約${diffInDays}日前`;
    }
  }

  // 修正: ProjectCardコンポーネントを実装
  const ProjectCard = ({ project }: { project: Project }) => {
    const categoryStyle = getCategoryStyle(project.category);

    return (
      <Card
        className={cn(
          "overflow-hidden hover:shadow-md transition-all cursor-pointer",
          project.isFavorite
            ? "border-l-4 border-l-yellow-400 border-t border-r border-b border-lightgreen-200"
            : "border border-lightgreen-200",
          // カテゴリーカラーをカードの上部に適用
          categoryStyle.bgColor
        )}
        onClick={() => handleProjectSelect(project)}
      >
        <div className="h-2 w-full"></div>
        <CardContent className="p-3 bg-white">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs mr-2">
                {project.owner.charAt(0)}
              </div>
              <h3 className="font-medium text-lightgreen-800">
                {project.title}
              </h3>
            </div>
            <button
              className="text-lightgreen-400 hover:text-yellow-500 transition-colors"
              onClick={(e) =>
                handleToggleFavorite(project.id, project.isFavorite, e)
              }
            >
              <Star
                className={cn(
                  "h-5 w-5",
                  project.isFavorite && "fill-yellow-400 text-yellow-400"
                )}
              />
            </button>
          </div>

          <p className="text-xs text-lightgreen-600 mb-2 line-clamp-2">
            {project.description}
          </p>

          <div className="flex items-center mb-2">
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full mr-2",
                "bg-white border",
                categoryStyle.textColor
              )}
            >
              {project.category}
            </span>
            <span className="text-xs text-gray-500">
              {getTimeAgo(project.createdAt)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex gap-3">
              <span className="flex items-center text-lightgreen-600">
                <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                {/* 修正: 実際のいいね数を表示 */}
                {project.likesCount}
              </span>
              <span className="flex items-center text-lightgreen-600">
                <MessageCircle className="h-3.5 w-3.5 mr-1" />
                {/* 修正: 実際のコメント数を表示 */}
                {project.commentsCount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
            <h1 className="text-xl font-bold text-lightgreen-800">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-lightgreen-600 hover:text-lightgreen-700 hover:bg-lightgreen-100"
            >
              <Bell className="h-5 w-5" />
            </Button>
            {/* 修正: ログアウトボタン */}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-red-600 border-red-200 hover:bg-red-50"
              size="sm"
            >
              ログアウト
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full overflow-hidden border-2 border-lightgreen-200 p-0"
            >
              <div className="h-8 w-8 bg-orange-500 text-white font-semibold flex items-center justify-center">
                {userInitial}
              </div>
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-lightgreen-600">
              読み込み中...
            </div>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
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
        ) : projects.length > 0 ? (
          // 修正: ProjectGrid を削除し、直接 ProjectCard コンポーネントを使用
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          // 修正: プロジェクトが0件の場合の表示を追加
          <div className="p-6 text-center border border-dashed border-lightgreen-300 rounded-xl bg-lightgreen-50">
            <p className="text-lightgreen-700 mb-2">
              {type === "new"
                ? "新着プロジェクトはありません"
                : "お気に入りプロジェクトはありません"}
            </p>
            <p className="text-sm text-lightgreen-600 mb-3">
              {type === "new"
                ? "最近追加されたプロジェクトがないようです"
                : "興味のあるプロジェクトの★マークをクリックして、お気に入りに追加しましょう"}
            </p>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
