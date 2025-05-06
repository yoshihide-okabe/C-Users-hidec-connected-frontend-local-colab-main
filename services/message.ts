// services/message.ts
// メッセージ関連のAPIサービス

// APIのベースURL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// メッセージの型定義
export interface Message {
  message_id: number;
  trouble_id: number;
  sender_user_id: number;
  sender_name: string;
  content: string;
  sent_at: string;
  parent_message_id?: number;
}

// メッセージリストのレスポンス型
export interface MessageListResponse {
  messages: Message[];
  total: number;
}

/**
 * 特定のお困りごとに関するメッセージを取得する
 * @param troubleId お困りごとID
 */
export async function getMessagesByTroubleId(
  troubleId: number | string
): Promise<Message[]> {
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
      `API呼び出し: お困りごとID=${numericTroubleId}のメッセージを取得します`
    );

    // APIからメッセージを取得
    const response = await fetch(
      `${API_URL}/api/v1/messages/trouble/${numericTroubleId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`メッセージの取得に失敗しました: ${response.status}`);
    }

    const data: MessageListResponse = await response.json();

    // 修正/追加: ログを追加してAPIレスポンスを確認
    console.log("API レスポンス:", data);

    // 修正/追加: レスポンスの形式を確認
    if (!data.messages || !Array.isArray(data.messages)) {
      console.error("予期しないレスポンス形式:", data);
      return [];
    }

    // 修正/追加: メッセージが0件の場合の処理
    if (data.messages.length === 0) {
      console.log("メッセージが0件です");
      return [];
    }

    // 修正/追加: メッセージデータの内容をログ出力
    console.log("取得したメッセージ内容:", data.messages);

    return data.messages;
  } catch (error) {
    console.error("メッセージ取得エラー:", error);

    // エラーが発生した場合は空の配列を返す
    // 実際のアプリケーションではエラーハンドリングを適切に行う
    return [];
  }
}

/**
 * 新しいメッセージを送信する
 * @param troubleId お困りごとID
 * @param content メッセージ内容
 * @param parentMessageId 親メッセージID（返信の場合）
 */
export async function sendMessage(
  troubleId: number,
  content: string,
  parentMessageId?: number
): Promise<Message> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("認証情報がありません。再ログインしてください。");
    }

    // リクエストデータの作成
    const requestData: {
      trouble_id: number;
      content: string;
      parent_message_id?: number;
    } = {
      trouble_id: troubleId,
      content: content,
    };

    // 親メッセージIDが指定されている場合は追加
    if (parentMessageId) {
      requestData.parent_message_id = parentMessageId;
    }

    // 修正/追加: リクエストデータをログ出力
    console.log("送信するメッセージデータ:", requestData);

    // APIにメッセージを送信
    const response = await fetch(`${API_URL}/api/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      // 修正/追加: エラーレスポンスの詳細を取得
      const errorText = await response.text();
      console.error("メッセージ送信エラーレスポンス:", errorText);
      throw new Error(`メッセージの送信に失敗しました: ${response.status}`);
    }

    const data: Message = await response.json();
    return data;
  } catch (error) {
    console.error("メッセージ送信エラー:", error);
    throw error;
  }
}
