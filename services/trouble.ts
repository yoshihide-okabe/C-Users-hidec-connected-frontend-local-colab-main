//import { Trouble } from "@/components/trouble-list";

// APIのベースURL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// APIレスポンスの型
interface ApiTrouble {
  trouble_id: number;
  description: string;
  category_id: number;
  project_id: number;
  project_title: string;
  creator_user_id: number;
  creator_name: string;
  created_at: string;
  status: string;
  comments: number;
}

interface Trouble {
  id: number;
  description: string;
  status: string;
  categoryId: number;
  projectId: number;
  creatorName: string;
  createdAt: string;
  commentCount: number;
}

interface ApiTroubleList {
  troubles: ApiTrouble[];
  total: number;
}

// APIレスポンスをフロントエンドの型に変換する関数
const mapApiTroubleToTrouble = (apiTrouble: ApiTrouble): Trouble => ({
  id: apiTrouble.trouble_id,
  description: apiTrouble.description,
  status: apiTrouble.status,
  categoryId: apiTrouble.category_id,
  projectId: apiTrouble.project_id,
  creatorName: apiTrouble.creator_name,
  createdAt: apiTrouble.created_at,
  commentCount: apiTrouble.comments,
});

// プロジェクト別のお困りごとを取得する関数
export const getTroublesByProject = async (
  projectId: string | number
): Promise<{ troubles: Trouble[]; total: number }> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("認証情報がありません。再ログインしてください。");
    }

    // 文字列の場合は数値に変換
    const numericProjectId =
      typeof projectId === "string" ? parseInt(projectId, 10) : projectId;

    // 数値変換が失敗した場合のエラー処理
    if (isNaN(numericProjectId)) {
      throw new Error("無効なプロジェクトIDです");
    }

    console.log(
      "API呼び出し前のプロジェクトID:",
      numericProjectId,
      typeof numericProjectId
    );

    // APIリクエスト
    const response = await fetch(
      `${API_URL}/api/v1/troubles/project/${numericProjectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`お困りごとの取得に失敗しました: ${response.status}`);
    }

    const data: ApiTroubleList = await response.json();
    return {
      troubles: data.troubles.map(mapApiTroubleToTrouble),
      total: data.total,
    };
  } catch (error) {
    console.error("お困りごと取得エラー:", error);
    // エラー時は空の配列を返す
    return { troubles: [], total: 0 };
  }
};
