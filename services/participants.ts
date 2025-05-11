// services/participants.ts

// 既存のファイルと同様にAPIベースURLを設定
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// 参加者の型定義
export interface Participant {
  user_id: number;
  name: string;
  role: string;
  avatar: string;
}

/**
 * お困りごとの参加者を取得する
 * @param troubleId お困りごとID
 */
export async function getParticipantsByTroubleId(
  troubleId: number | string
): Promise<Participant[]> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("認証情報がありません。再ログインしてください。");
    }

    // 文字列の場合は数値に変換
    const numericTroubleId =
      typeof troubleId === "string" ? parseInt(troubleId, 10) : troubleId;

    // 数値変換が失敗した場合のエラー処理
    if (isNaN(numericTroubleId)) {
      throw new Error("無効なお困りごとIDです");
    }

    console.log(
      `API呼び出し: お困りごとID=${numericTroubleId}の参加者を取得します`
    );

    // APIから参加者を取得
    const response = await fetch(
      `${API_URL}/api/v1/troubles/${numericTroubleId}/participants`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`参加者の取得に失敗しました: ${response.status}`);
    }

    const participants: Participant[] = await response.json();
    console.log("取得した参加者:", participants);

    return participants;
  } catch (error) {
    console.error("参加者取得エラー:", error);
    // エラー時はダミーデータを返す
    return [
      {
        user_id: 1,
        name: "フクロウ",
        role: "オーナー",
        avatar: "フ",
      },
      {
        user_id: 2,
        name: "キツネ",
        role: "応援者",
        avatar: "キ",
      },
    ];
  }
}
