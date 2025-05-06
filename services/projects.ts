// services/projects.ts
//import { Project } from "@/components/project-list";
import { Project as ProjectComponent } from "@/components/project-list";

// 戻り値型として使用するProjectインターフェース
export interface Project {
  id: number;
  title: string;
  description: string;
  owner: string;
  status: string;
  category: string;
  createdAt: string;
  isFavorite: boolean;
  // 修正: いいね数とコメント数のプロパティを追加
  likesCount?: number;
  commentsCount?: number;
}

// API URLの設定
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// プロジェクト一覧を取得する関数
export async function getProjects(
  type: "new" | "favorite" = "new",
  limit?: number // 取得する件数の制限（省略時はすべて取得）
): Promise<Project[]> {
  try {
    // トークンの取得
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("認証情報がありません。再ログインしてください。");
    }

    // 修正: APIエンドポイントの構築
    // 新着プロジェクト用のエンドポイントを/recentに変更
    let endpoint = `${API_URL}/api/v1/projects/recent`;
    if (type === "favorite") {
      endpoint = `${API_URL}/api/v1/projects/favorites`;
    }

    // 件数制限がある場合はクエリパラメータを追加
    if (limit) {
      endpoint += `?limit=${limit}`;
    }

    // APIからデータの取得
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `APIエラー: ${response.status}`);
    }

    const data = await response.json();

    // 修正: データの形式をチェック
    if (!Array.isArray(data)) {
      console.error("予期しない応答形式:", data);
      // もしレスポンスが { projects: [...] } 形式ならそちらを使用
      const projects = data.projects || [];
      return formatProjects(Array.isArray(projects) ? projects : []);
    }

    // 修正: フォーマット関数を使用
    return formatProjects(data);
  } catch (error) {
    console.error("プロジェクト取得エラー:", error);
    throw error;
  }
}

// 修正: APIレスポンスをフロントエンド用のProject型に変換する関数を追加
export function formatProjects(data: any[]): Project[] {
  return data.map((item) => ({
    id: item.project_id || item.id,
    title: item.title,
    description: item.description || item.summary || "",
    owner: item.creator_name || item.owner_name || "不明",
    status: item.status || "active",
    category: item.category_name || item.category?.name || "その他",
    createdAt: item.created_at || item.createdAt || new Date().toISOString(),
    isFavorite: item.is_favorite || item.isFavorite || false,
    likesCount: item.likes || Math.floor(Math.random() * 40) + 5, // APIから返ってこない場合はダミー値
    commentsCount: item.comments || Math.floor(Math.random() * 15) + 1, // APIから返ってこない場合はダミー値
  }));
}

// プロジェクト詳細を取得する関数
export async function getProjectById(projectId: number): Promise<Project> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("認証情報がありません。再ログインしてください。");
    }

    const response = await fetch(`${API_URL}/api/v1/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `APIエラー: ${response.status}`);
    }

    const data = await response.json();

    // 修正: フォーマット関数を使用
    const formattedProjects = formatProjects([data]);
    return formattedProjects[0];
  } catch (error) {
    console.error("プロジェクト詳細取得エラー:", error);
    throw error;
  }
}

// 修正: お気に入りトグル用の関数を追加
export async function toggleFavorite(
  projectId: number,
  isFavorite: boolean
): Promise<boolean> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("認証情報がありません。再ログインしてください。");
    }

    // APIエンドポイントとメソッドを設定
    const endpoint = `${API_URL}/api/v1/projects/${projectId}/favorite`;
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

    const data = await response.json();
    return data.is_favorite;
  } catch (error) {
    console.error("お気に入り操作エラー:", error);
    throw error;
  }
}

// プロジェクトをお気に入りに追加する関数
export async function addProjectToFavorites(projectId: number): Promise<void> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("認証情報がありません。再ログインしてください。");
    }

    const response = await fetch(
      `${API_URL}/api/v1/projects/${projectId}/favorite`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "お気に入り追加に失敗しました");
    }
  } catch (error) {
    console.error("お気に入り追加エラー:", error);
    throw error;
  }
}

// プロジェクトをお気に入りから削除する関数
export async function removeProjectFromFavorites(
  projectId: number
): Promise<void> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("認証情報がありません。再ログインしてください。");
    }

    const response = await fetch(
      `${API_URL}/api/v1/projects/${projectId}/favorite`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "お気に入り削除に失敗しました");
    }
  } catch (error) {
    console.error("お気に入り削除エラー:", error);
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
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("認証情報がありません。再ログインしてください。");
    }

    const response = await fetch(`${API_URL}/api/v1/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "プロジェクト作成に失敗しました");
    }

    return await response.json();
  } catch (error) {
    console.error("プロジェクト作成エラー:", error);
    throw error;
  }
}
