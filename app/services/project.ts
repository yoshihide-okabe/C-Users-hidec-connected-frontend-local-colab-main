// services/project.ts
import { Project } from "@/components/project-list";

// APIのベースURL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// レスポンスデータの型
interface ApiProject {
  project_id: number;
  title: string;
  description: string;
  owner_name: string;
  owner_id: number;
  category_name: string;
  category_id: number;
  status: string;
  created_at: string;
  is_favorite: boolean;
}

// APIレスポンスをフロントエンドの型に変換する関数
const mapApiProjectToProject = (apiProject: ApiProject): Project => ({
  id: apiProject.project_id,
  title: apiProject.title,
  description: apiProject.description || "説明はありません",
  owner: apiProject.owner_name || "不明",
  status: apiProject.status || "active",
  category: apiProject.category_name || "その他",
  createdAt: apiProject.created_at,
  isFavorite: apiProject.is_favorite,
});

// 新着プロジェクトを取得する関数
export const getRecentProjects = async (
  limit: number = 5
): Promise<Project[]> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("認証情報がありません。再ログインしてください。");
    }

    // APIリクエスト
    const response = await fetch(
      `${API_URL}/api/v1/projects/recent?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`プロジェクトの取得に失敗しました: ${response.status}`);
    }

    const data: ApiProject[] = await response.json();
    return data.map(mapApiProjectToProject);
  } catch (error) {
    console.error("新着プロジェクト取得エラー:", error);

    // APIが実装されていない場合はダミーデータを返す
    return getDummyProjects("new", limit);
  }
};

// お気に入りプロジェクトを取得する関数
export const getFavoriteProjects = async (
  limit: number = 5
): Promise<Project[]> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("認証情報がありません。再ログインしてください。");
    }

    // APIリクエスト
    const response = await fetch(
      `${API_URL}/api/v1/projects/favorites?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `お気に入りプロジェクトの取得に失敗しました: ${response.status}`
      );
    }

    const data: ApiProject[] = await response.json();
    return data.map(mapApiProjectToProject);
  } catch (error) {
    console.error("お気に入りプロジェクト取得エラー:", error);

    // APIが実装されていない場合はダミーデータを返す
    return getDummyProjects("favorite", limit);
  }
};

// お気に入り追加/削除を行う関数
export const toggleFavorite = async (
  projectId: number,
  isFavorite: boolean
): Promise<boolean> => {
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

    // APIが実装されていない場合はダミーの結果を返す（トグル後の状態）
    return !isFavorite;
  }
};

// ダミープロジェクトデータを取得する関数
const getDummyProjects = (
  type: "new" | "favorite",
  limit: number = 5
): Project[] => {
  const now = new Date();

  const dummyProjects: Project[] = [
    {
      id: 1,
      title: "オンライン学習プラットフォーム",
      description:
        "誰でも簡単にオンラインで学べるプラットフォームを開発しています。特に教育格差の解消を目指しています。",
      owner: "フクロウ",
      status: "active",
      category: "教育",
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2時間前
      isFavorite: type === "favorite",
    },
    {
      id: 2,
      title: "地域コミュニティアプリ",
      description:
        "地域の交流を活性化するためのアプリを開発しています。お祭りや地域活動の告知、参加者募集などができます。",
      owner: "タヌキ",
      status: "active",
      category: "コミュニティ",
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12時間前
      isFavorite: type === "favorite",
    },
    {
      id: 3,
      title: "健康管理サービス",
      description:
        "日々の健康データを簡単に記録・分析できるサービスを開発しています。医療機関との連携も検討中です。",
      owner: "キツネ",
      status: "active",
      category: "ヘルスケア",
      createdAt: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(), // 18時間前
      isFavorite: type === "favorite",
    },
    {
      id: 4,
      title: "フリーランス向け案件マッチングサービス",
      description:
        "フリーランスと企業を効率的にマッチングするサービスです。スキルベースのマッチングアルゴリズムを採用しています。",
      owner: "クマ",
      status: "active",
      category: "ビジネス",
      createdAt: new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString(), // 23時間前
      isFavorite: type === "favorite",
    },
    {
      id: 5,
      title: "シェアリングエコノミープラットフォーム",
      description:
        "物品の共有サービスを提供するプラットフォームです。サステナブルな社会づくりに貢献します。",
      owner: "シカ",
      status: "active",
      category: "環境",
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5時間前
      isFavorite: type === "favorite",
    },
  ];

  // タイプに応じてフィルタリング
  if (type === "new") {
    // 24時間以内のプロジェクトのみを返す（すべてのダミーデータは24時間以内なので全て）
    return dummyProjects.slice(0, limit);
  } else {
    // お気に入りはすべて返す（すべて true に設定済み）
    return dummyProjects.slice(0, limit);
  }
};
