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
}

// API URLの設定
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// プロジェクト一覧を取得する関数
export async function getProjects(
  type: "new" | "favorite" = "new"
): Promise<Project[]> {
  try {
    // トークンの取得
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("認証情報がありません。再ログインしてください。");
    }

    // APIエンドポイントの構築
    let endpoint = `${API_URL}/api/v1/projects`;
    if (type === "favorite") {
      endpoint = `${API_URL}/api/v1/projects/favorites`;
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

    // データの変換・整形
    return data.map((item: any) => ({
      id: item.project_id || item.id,
      title: item.title,
      description: item.description || item.summary || "",
      owner: item.owner_name || "フクロウ", // APIからの所有者名
      status: item.status || "active",
      category: item.category_name || "その他",
      createdAt: item.created_at || new Date().toISOString(),
      isFavorite: type === "favorite" || item.is_favorite,
    }));
  } catch (error) {
    console.error("プロジェクト取得エラー:", error);
    throw error;
  }
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

    return {
      id: data.project_id,
      title: data.title,
      description: data.description || data.summary || "",
      owner: data.owner_name || "フクロウ",
      status: data.status || "active",
      category: data.category_name || "その他",
      createdAt: data.created_at || new Date().toISOString(),
      isFavorite: data.is_favorite || false,
    };
  } catch (error) {
    console.error("プロジェクト詳細取得エラー:", error);
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
