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
  Heart,
  Trophy,
  TagIcon,
  Check,
  Clock,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
    農業: {
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
  };

  return (
    styles[category] || {
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
      icon: (
        <div className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs">
          他
        </div>
      ),
    }
  );
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

            setSelectedProject({
              id: projectId,
              title: projectTitle,
              description: projectDescription,
              owner: projectOwner,
              status: "active",
              category: "その他",
              createdAt: new Date().toISOString(),
              isFavorite: false,
            });
          } catch (error) {
            console.error("プロジェクト情報の復元エラー:", error);
          }
        }
      } catch (error) {
        console.error("認証チェックエラー:", error);
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
        // 過去24時間のプロジェクト取得
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("認証情報がありません。ログインしてください。");
        }

        const response = await fetch(`/api/v1/projects/recent`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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

        // データ整形用の関数
        const formatProject = (item: any): Project => {
          // project_id が文字列の場合に整数変換
          const projectId =
            typeof item.project_id === "string"
              ? parseInt(item.project_id, 10)
              : item.project_id || item.id;

          return {
            id: projectId,
            title: item.title || "",
            description: item.description || "",
            owner: item.creator_name || "",
            status: "active",
            category: item.category?.name || "その他",
            createdAt: item.created_at || new Date().toISOString(),
            isFavorite: Boolean(item.is_favorite),
            likesCount: Math.floor(Math.random() * 40) + 5, // ダミーデータ
            commentsCount: Math.floor(Math.random() * 15) + 1, // ダミーデータ
          };
        };

        // 新着プロジェクトの処理
        const recentProjects = data.map(formatProject);
        setProjects(recentProjects);

        // いいねプロジェクト取得
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
        }
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
          {
            id: 2,
            title: "サステナブルファッションブランド",
            description:
              "環境に配慮した素材を使用し、エシカルな製造プロセスによるファッションブランドを立ち上げます。",
            owner: "パンダ",
            status: "active",
            category: "ビジネス",
            createdAt: new Date(
              now.getTime() - 3 * 60 * 60 * 1000
            ).toISOString(),
            isFavorite: false,
            likesCount: 11,
            commentsCount: 9,
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
            ).toISOString(),
            isFavorite: false,
            likesCount: 30,
            commentsCount: 4,
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
            ).toISOString(),
            isFavorite: false,
            likesCount: 23,
            commentsCount: 5,
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
            ).toISOString(),
            isFavorite: false,
            likesCount: 18,
            commentsCount: 13,
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
            ).toISOString(),
            isFavorite: false,
            likesCount: 33,
            commentsCount: 14,
          },
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
          {
            id: 2,
            title: "サステナブルファッションブランド",
            description:
              "環境に配慮した素材を使用し、エシカルな製造プロセスによるファッションブランドを立ち上げます。",
            owner: "パンダ",
            status: "active",
            category: "ビジネス",
            createdAt: new Date(
              now.getTime() - 3 * 60 * 60 * 1000
            ).toISOString(),
            isFavorite: true,
            likesCount: 30,
            commentsCount: 11,
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
            ).toISOString(),
            isFavorite: true,
            likesCount: 37,
            commentsCount: 13,
          },
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
  const toggleFavorite = async (
    projectId: number,
    isFavorite: boolean,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // プロジェクト選択イベントを防止

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("認証情報がありません。ログインしてください。");
      }

      // APIエンドポイントとメソッドを設定
      const endpoint = `/api/v1/projects/${projectId}/favorite`;
      const method = isFavorite ? "DELETE" : "POST";

      // APIリクエスト
      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`お気に入り操作に失敗しました: ${response.status}`);
      }

      // プロジェクトのいいね状態を更新
      const updateProjects = (projectList: Project[]) => {
        return projectList.map((project) =>
          project.id === projectId
            ? { ...project, isFavorite: !isFavorite }
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

      {/* 選択中のプロジェクト */}
      {selectedProject && (
        <div className="sticky top-[57px] z-10 bg-lightgreen-50/95 backdrop-blur-sm border-b border-lightgreen-200 px-4 py-2 shadow-sm">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-lightgreen-700 mr-2" />
            <span className="text-sm text-lightgreen-800 font-semibold mr-2">
              選択中のプロジェクト:
            </span>
            {/* カテゴリーカラーを左側に配置 */}
            {getCategoryStyle(selectedProject.category).icon}
            <div className="flex items-center flex-1 min-w-0 ml-2">
              <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs mr-2">
                {selectedProject.owner.charAt(0)}
              </div>
              <h3 className="text-sm font-medium text-lightgreen-800 truncate">
                {selectedProject.title}
              </h3>
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
            {projects.map((project) => (
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
              {likedProjects.map((project) => (
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
