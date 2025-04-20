// services/projects.ts
import { Project } from "@/components/project-list";

// API URLの設定
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// プロジェクト一覧を取得する関数
export async function getProjects(type: 'new' | 'favorite' = 'new'): Promise<Project[]> {
  try {
    // トークンの取得
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('認証情報がありません。再ログインしてください。');
    }

    // APIエンドポイントの構築
    let endpoint = `${API_URL}/api/v1/projects`;
    if (type === 'favorite') {
      endpoint = `${API_URL}/api/v1/projects/favorites`;
    }

    // APIからデータの取得
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `APIエラー: ${response.status}`);
    }

    const data = await response.json();

    // データの変換・整形
    return data.map((item: any) => ({
      id: item.project_id || item.id,
      title: item.title,
      description: item.description || item.summary || '',
      owner: item.owner_name || 'フクロウ', // APIからの所有者名
      status: item.status || 'active',
      category: item.category_name || 'その他',
      createdAt: item.created_at || new Date().toISOString(),
      isFavorite: type === 'favorite' || item.is_favorite
    }));
  } catch (error) {
    console.error('プロジェクト取得エラー:', error);
    throw error;
  }
}

// プロジェクト詳細を取得する関数
export async function getProjectById(projectId: number): Promise<Project> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('認証情報がありません。再ログインしてください。');
    }

    const response = await fetch(`${API_URL}/api/v1/projects/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `APIエラー: ${response.status}`);
    }

    const data = await response.json();

    return {
      id: data.project_id,
      title: data.title,
      description: data.description || data.summary || '',
      owner: data.owner_name || 'フクロウ',
      status: data.status || 'active',
      category: data.category_name || 'その他',
      createdAt: data.created_at || new Date().toISOString(),
      isFavorite: data.is_favorite || false
    };
  } catch (error) {
    console.error('プロジェクト詳細取得エラー:', error);
    throw error;
  }
}

// プロジェクトをお気に入りに追加する関数
export async function addProjectToFavorites(projectId: number): Promise<void> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('認証情報がありません。再ログインしてください。');
    }

    const response = await fetch(`${API_URL}/api/v1/projects/${projectId}/favorite`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'お気に入り追加に失敗しました');
    }
  } catch (error) {
    console.error('お気に入り追加エラー:', error);
    throw error;
  }
}

// プロジェクトをお気に入りから削除する関数
export async function removeProjectFromFavorites(projectId: number): Promise<void> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('認証情報がありません。再ログインしてください。');
    }

    const response = await fetch(`${API_URL}/api/v1/projects/${projectId}/favorite`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'お気に入り削除に失敗しました');
    }
  } catch (error) {
    console.error('お気に入り削除エラー:', error);
    throw error;
  }
}

// プロジェクト作成関数
export async function createProject(projectData: {
  title: string;
  summary?: string;
  description: string;
  category_id: number;
}): Promise<{ project_id: number }> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('認証情報がありません。再ログインしてください。');
    }

    const response = await fetch(`${API_URL}/api/v1/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(projectData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'プロジェクト作成に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('プロジェクト作成エラー:', error);
    throw error;
  }
}
3. 修正: app/page.tsx
ホームページコンポーネントを修正し、バックエンドAPIとの連携部分を追加します。
tsx"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, Bell, MessageSquare, Trophy, TagIcon } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { ProjectList, Project } from "@/components/project-list"; // 修正：実装したProjectListをインポート
import { useToast } from "@/hooks/use-toast";

// ランキングに基づいた色を取得する関数
function getRankColor(rank: number) {
  const colors: Record<number, string> = {
    1: "bg-yellow-500",
    2: "bg-gray-400",
    3: "bg-amber-600",
  };

  return colors[rank] || "bg-lightgreen-500";
}

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 修正：ローディング状態の追加

  // ログイン状態をチェックして未ログインの場合にログインページに遷移
  useEffect(() => {
    // 修正：認証チェックとプロジェクト情報の復元処理を追加
    const checkAuthAndRestore = async () => {
      setIsLoading(true);
      
      try {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true" || 
                          localStorage.getItem("token") !== null;
                          
        if (!isLoggedIn) {
          console.log("未ログイン状態を検出。ログインページへリダイレクト");
          router.push("/login"); // ログインしていない場合はログインページにリダイレクト
          return;
        }

        // 保存されたプロジェクト情報を復元
        const savedProjectId = localStorage.getItem("selectedProjectId");
        if (savedProjectId) {
          try {
            const projectId = parseInt(savedProjectId);
            const projectTitle = localStorage.getItem("selectedProjectTitle") || "";
            const projectDescription =
              localStorage.getItem("selectedProjectDescription") || "";
            const projectOwner =
              localStorage.getItem("selectedProjectOwner") || "オーナー情報なし";
            
            // 保存されていた情報からプロジェクトオブジェクトを再構築
            setSelectedProject({
              id: projectId,
              title: projectTitle,
              description: projectDescription,
              owner: projectOwner,
              // その他必要なフィールドにはデフォルト値を設定
              status: "active",
              category: "その他",
              createdAt: new Date().toISOString(),
            });

            console.log("Restored project from localStorage:", {
              id: projectId,
              title: projectTitle,
              description: projectDescription,
            });
          } catch (error) {
            console.error("Failed to restore project from localStorage:", error);
          }
        }
      } catch (error) {
        console.error("認証チェックエラー:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRestore();
  }, [router]);

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

      console.log("Project saved to localStorage", {
        id: project.id.toString(),
        title: project.title,
        description: project.description,
      });

      // 選択通知
      toast({
        title: "プロジェクト選択",
        description: `「${project.title}」を選択しました`,
      });
    } catch (error) {
      console.error("Failed to save project to localStorage:", error);
      toast({
        title: "エラー",
        description: "プロジェクト情報の保存に失敗しました",
        variant: "destructive",
      });
    }
  };

  // お困りごとリストへの遷移時の処理
  const handleTroublesClick = () => {
    // プロジェクトが選択されていなければアラート表示
    if (!selectedProject) {
      toast({
        title: "選択が必要です",
        description: "プロジェクトを選択してください",
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

      console.log("Before navigation - localStorage state:", {
        projectId: localStorage.getItem("selectedProjectId"),
        projectTitle: localStorage.getItem("selectedProjectTitle"),
        projectDescription: localStorage.getItem("selectedProjectDescription"),
        userId: localStorage.getItem("currentUserId"),
      });

      // お困りごとリスト画面に遷移
      router.push("/troubles");
    } catch (error) {
      console.error("Navigation error:", error);
      toast({
        title: "エラー",
        description: "画面遷移中にエラーが発生しました",
        variant: "destructive",
      });
    }
  };

  // 修正：ロード中表示を追加
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
                  onClick={handleTroublesClick}
                >
                  <MessageSquare className="mr-1 h-3 w-3" />
                  お困りごとを見る
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-lightgreen-800">
              新着プロジェクト
            </h2>
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
          </div>
          {/* 修正：ProjectListコンポーネントによるバックエンドデータ取得 */}
          <ProjectList type="new" onSelectProject={handleProjectSelect} />
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-lightgreen-800">
            お気に入りプロジェクト
          </h2>
          {/* 修正：ProjectListコンポーネントによるバックエンドデータ取得 */}
          <ProjectList type="favorite" onSelectProject={handleProjectSelect} />
        </div>

        <div className="space-y-6">
          <Link href="/troubles">
            <Button className="w-full bg-lightgreen-500 hover:bg-lightgreen-600 text-white rounded-full shadow-md hover:shadow-lg transition-all">
              <MessageSquare className="mr-2 h-4 w-4" />
              お困りごとリスト
            </Button>
          </Link>

          <div className="rounded-2xl border border-lightgreen-200 bg-white p-4 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-lightgreen-800 flex items-center">
                <div className="bg-lightgreen-100 p-1.5 rounded-full mr-2">
                  <Trophy className="h-4 w-4 text-lightgreen-600" />
                </div>
                アクティビティランキング
              </h3>
              <span className="text-xs text-lightgreen-600 bg-lightgreen-50 px-2 py-1 rounded-full">
                今週
              </span>
            </div>
            <div className="space-y-3">
              {[
                { name: "キツネ", points: 1250, rank: 1 },
                { name: "パンダ", points: 980, rank: 2 },
                { name: "ウサギ", points: 875, rank: 3 },
              ].map((user) => (
                <div
                  key={user.name}
                  className="flex items-center justify-between bg-gradient-to-r from-lightgreen-50 to-transparent p-2 rounded-lg hover:shadow-sm transition-all"
                >
                  <div className="flex items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-white font-medium mr-2 text-xs ${getRankColor(
                        user.rank
                      )}`}
                    >
                      {user.rank}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-lightgreen-500 h-1.5 rounded-full"
                          style={{ width: `${(user.points / 1250) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <span className="font-medium text-sm text-lightgreen-700">
                    {user.points}pt
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-lightgreen-200 bg-white p-4 shadow-sm">
            <h3 className="font-medium mb-3 text-lightgreen-800 flex items-center">
              <div className="bg-lightgreen-100 p-1.5 rounded-full mr-2">
                <TagIcon className="h-4 w-4 text-lightgreen-600" />
              </div>
              カテゴリー
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "テクノロジー",
                "デザイン",
                "マーケティング",
                "ビジネス",
                "教育",
              ].map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs h-8 border-lightgreen-300 bg-lightgreen-50 text-lightgreen-700 hover:bg-lightgreen-100 shadow-sm hover:shadow"
                >
                  {category}
                </Button>
              ))}
            </div>
            <div className="mb-6"></div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}