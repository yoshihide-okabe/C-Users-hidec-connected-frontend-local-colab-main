// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  MessageSquare,
  ChevronRight,
  Star,
  ThumbsUp,
  MessageCircle,
  Heart,
  Check,
  Clock,
  LogOut,
} from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/services/auth";
// 修正: プロジェクトサービス関数をインポート
import { getProjects, toggleFavorite } from "@/services/projects";

// プロジェクト型定義
interface Project {
  id: number;
  project_id?: number;
  title: string;
  description: string;
  owner: string;
  creator_name?: string;
  status: string;
  category: string;
  category_name?: string;
  createdAt: string;
  created_at?: string;
  isFavorite: boolean;
  is_favorite?: boolean;
  likesCount?: number;
  commentsCount?: number;
}

// カテゴリーに基づいた色とアイコンを取得する関数
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
    グローバル: {
      bgColor: "bg-lime-100",
      textColor: "text-lime-700",
      icon: (
        <div className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center text-white text-xs">
          農
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

// 時間を「◯時間前」の形式で表示する関数
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

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedProjects, setLikedProjects] = useState<Project[]>([]);
  // ここにユーザーアイコン用の状態変数を追加
  const [userInitial, setUserInitial] = useState("ゲ"); // デフォルト値は「ゲ」(ゲスト)

  // 修正/追加: 表示するプロジェクトの最大数
  const MAX_DISPLAY_PROJECTS = 6;

  // 修正/追加: ログアウト関数を追加
  const handleLogout = () => {
    logout();
    toast({
      title: "ログアウト成功",
      description: "ログアウトしました",
      variant: "default",
    });
    router.push("/login");
  };

  // ログイン状態をチェックして未ログインならログインページへリダイレクト
  useEffect(() => {
    const checkAuthAndRestoreProject = async () => {
      setIsLoading(true);

      try {
        // ログイン状態チェック
        const isLoggedIn =
          localStorage.getItem("isLoggedIn") === "true" ||
          localStorage.getItem("token") !== null;

        if (!isLoggedIn) {
          console.log("未ログイン状態のため、ログインページへリダイレクト");
          router.push("/login");
          return;
        }

        // ユーザー名の頭文字を取得して設定 (追加)
        const userName = localStorage.getItem("userName");
        if (userName && userName.length > 0) {
          setUserInitial(userName.charAt(0));
        }

        // ローカルストレージから選択済みプロジェクトを復元
        const savedProjectId = localStorage.getItem("selectedProjectId");
        if (savedProjectId) {
          try {
            const projectId = parseInt(savedProjectId);
            const projectTitle =
              localStorage.getItem("selectedProjectTitle") || "";
            const projectDescription =
              localStorage.getItem("selectedProjectDescription") || "";
            const projectOwner =
              localStorage.getItem("selectedProjectOwner") || "不明";
            const projectCategory =
              localStorage.getItem("selectedProjectCategory") || "その他";

            setSelectedProject({
              id: projectId,
              title: projectTitle,
              description: projectDescription,
              owner: projectOwner,
              status: "active",
              category: projectCategory,
              createdAt: new Date().toISOString(),
              isFavorite: false,
            });
          } catch (error) {
            console.error("プロジェクト情報の復元エラー:", error);
          }
        }
      } catch (error) {
        console.error("認証チェックエラー:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRestoreProject();
  }, [router]);

  // 過去24時間のプロジェクト取得
  useEffect(() => {
    const fetchRecentProjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 修正: プロジェクトサービスを使用して過去24時間のプロジェクト取得
        const recentProjects = await getProjects("new");
        console.log("取得した過去24時間のプロジェクト:", recentProjects);
        setProjects(recentProjects);

        // 修正: プロジェクトサービスを使用していいね済みプロジェクト取得
        const favoriteProjects = await getProjects("favorite");
        console.log("取得したいいねプロジェクト:", favoriteProjects);
        setLikedProjects(favoriteProjects);
      } catch (err) {
        console.error("プロジェクト取得エラー:", err);
        setError(
          err instanceof Error ? err.message : "データの取得に失敗しました"
        );

        // エラー時はダミーデータをセット（本番環境では削除）
        const now = new Date();
        const mockProjects: Project[] = [
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
            ).toISOString(),
            isFavorite: false,
            likesCount: 16,
            commentsCount: 10,
          },
          // 他のダミープロジェクト（省略）...
        ];

        const mockLikedProjects: Project[] = [
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
            ).toISOString(),
            isFavorite: true,
            likesCount: 32,
            commentsCount: 3,
          },
          // 他のダミーいいねプロジェクト（省略）...
        ];

        setProjects(mockProjects);
        setLikedProjects(mockLikedProjects);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentProjects();
  }, []);

  // プロジェクト選択時の処理
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);

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
    } catch (error) {
      console.error("プロジェクト情報の保存エラー:", error);
      toast({
        title: "エラー",
        description: "プロジェクト情報の保存に失敗しました",
        variant: "destructive",
      });
    }
  };

  // お気に入りトグル処理
  const handleToggleFavorite = async (
    projectId: number,
    isFavorite: boolean,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // プロジェクト選択イベントを防止

    try {
      // 修正: プロジェクトサービスのtoggleFavorite関数を使用
      await toggleFavorite(projectId, isFavorite);

      // プロジェクトのいいね状態を更新
      const updateProjects = (projectList: Project[]) => {
        return projectList.map((project) =>
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
        );
      };

      setProjects(updateProjects(projects));

      // いいね追加時はリストに追加、削除時はリストから削除
      if (!isFavorite) {
        const projectToAdd = projects.find((p) => p.id === projectId);
        if (projectToAdd && !likedProjects.some((p) => p.id === projectId)) {
          setLikedProjects((prev) => [
            ...prev,
            { ...projectToAdd, isFavorite: true },
          ]);
        }
      } else {
        setLikedProjects((prev) => prev.filter((p) => p.id !== projectId));
      }

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

  // お困りごとリストへの遷移
  const handleTroublesClick = () => {
    if (!selectedProject) {
      toast({
        title: "選択が必要です",
        description: "先にプロジェクトを選択してください",
        variant: "destructive",
      });
      return;
    }

    // 現在のユーザー情報を取得
    const userId = localStorage.getItem("userId") || "";
    const userName = localStorage.getItem("userName") || "";

    // プロジェクト情報が確実に保存されていることを確認
    try {
      if (!localStorage.getItem("selectedProjectId")) {
        // 再保存（冗長だが確実に）
        localStorage.setItem(
          "selectedProjectId",
          selectedProject.id.toString()
        );
        localStorage.setItem("selectedProjectTitle", selectedProject.title);
        localStorage.setItem(
          "selectedProjectDescription",
          selectedProject.description
        );
        localStorage.setItem(
          "selectedProjectCategory",
          selectedProject.category
        );
      }

      // ユーザー情報をローカルストレージに保存
      localStorage.setItem("currentUserId", userId);
      localStorage.setItem("currentUserName", userName);

      // お困りごとリスト画面に遷移
      router.push("/troubles");
    } catch (error) {
      console.error("画面遷移エラー:", error);
      toast({
        title: "エラー",
        description: "画面遷移中にエラーが発生しました",
        variant: "destructive",
      });
    }
  };

  // プロジェクトカードコンポーネント
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
              onClick={(e) => toggleFavorite(project.id, project.isFavorite, e)}
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
                {project.likesCount}
              </span>
              <span className="flex items-center text-lightgreen-600">
                <MessageCircle className="h-3.5 w-3.5 mr-1" />
                {project.commentsCount}
              </span>
            </div>
            <span className="flex items-center text-lightgreen-500 hover:text-lightgreen-600">
              詳細を見る
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ロード中表示
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-lightgreen-50 to-white">
        <div className="text-lightgreen-700">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-gradient-to-b from-lightgreen-50 to-white">
      {/* ヘッダー */}
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

            {/* 修正: ログアウトボタンをより明確にする */}
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

      {/* 選択中のプロジェクト */}
      {selectedProject && (
        <div className="sticky top-[57px] z-10 bg-lightgreen-50/95 backdrop-blur-sm border-b border-lightgreen-200 px-4 py-2 shadow-sm">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-lightgreen-700 mr-2" />
            <span className="text-sm text-lightgreen-800 font-semibold mr-2">
              選択中のプロジェクト:
            </span>
            <div
              className={cn(
                "h-2 w-2 rounded-full mr-2",
                getCategoryStyle(selectedProject.category).bgColor
              )}
            ></div>
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs mr-2">
                {selectedProject.owner.charAt(0)}
              </div>
              <h3 className="text-sm font-medium text-lightgreen-800 truncate">
                {selectedProject.title}
              </h3>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full ml-2 whitespace-nowrap",
                  "bg-white border",
                  getCategoryStyle(selectedProject.category).textColor
                )}
              >
                {selectedProject.category}
              </span>
            </div>
          </div>
        </div>
      )}

      <main className="px-4 py-4">
        {/* 新着プロジェクト */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            <Clock className="h-5 w-5 text-lightgreen-600 mr-2" />
            <h2 className="text-lg font-semibold text-lightgreen-800">
              新着プロジェクト
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 修正: 表示するプロジェクト数を最大6件に制限 */}
            {projects.slice(0, MAX_DISPLAY_PROJECTS).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          <div className="mt-4 text-center">
            <Link href="/projects/new">
              <Button
                variant="ghost"
                className="text-lightgreen-600 hover:text-lightgreen-700"
              >
                新着プロジェクトをもっと見る
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* お気に入りプロジェクト */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            <Heart className="h-5 w-5 text-red-500 mr-2" />
            <h2 className="text-lg font-semibold text-lightgreen-800">
              お気に入りプロジェクト
            </h2>
          </div>

          {likedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 修正: 表示するプロジェクト数を最大6件に制限 */}
              {likedProjects.slice(0, MAX_DISPLAY_PROJECTS).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center border border-dashed border-lightgreen-300 rounded-xl bg-lightgreen-50">
              <p className="text-lightgreen-700 mb-2">
                お気に入りに追加したプロジェクトがありません
              </p>
              <p className="text-sm text-lightgreen-600 mb-3">
                興味のあるプロジェクトの★マークをクリックして、お気に入りに追加しましょう
              </p>
            </div>
          )}

          {/* お気に入りプロジェクトの「もっと見る」リンク */}
          {likedProjects.length > 0 && (
            <div className="mt-4 text-center">
              <Link href="/projects/favorite">
                <Button
                  variant="ghost"
                  className="text-lightgreen-600 hover:text-lightgreen-700"
                >
                  お気に入りプロジェクトをもっと見る
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* お困りごとリンク */}
        <div className="space-y-6">
          <Link href="/troubles">
            <Button className="w-full bg-lightgreen-500 hover:bg-lightgreen-600 text-white rounded-full shadow-md hover:shadow-lg transition-all py-3">
              <MessageSquare className="mr-2 h-5 w-5" />
              お困りごとリスト
            </Button>
          </Link>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
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
      </main>

      <MobileNav />
    </div>
  );
}
