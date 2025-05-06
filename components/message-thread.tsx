"use client";

import { useState, useEffect, useRef } from "react";
import { SendHorizontal, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Message,
  getMessagesByTroubleId,
  sendMessage,
} from "@/services/message";

// メッセージのプロパティ
interface MessageThreadProps {
  troubleId?: number | string;
}

export function MessageThread({ troubleId }: MessageThreadProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージの読み込み
  useEffect(() => {
    async function fetchMessages() {
      setIsLoading(true);
      try {
        // ローカルストレージから選択中のお困りごとIDを取得
        const storedTroubleId =
          troubleId || localStorage.getItem("selectedTroubleId");

        // お困りごとIDがない場合はダミーデータを表示
        if (!storedTroubleId) {
          console.log(
            "選択中のお困りごとIDがありません。ダミーデータを表示します。"
          );
          setMessages(getDummyMessages());
          setIsLoading(false);
          return;
        }

        console.log(
          "お困りごとID:",
          storedTroubleId,
          "のメッセージを取得します"
        );

        // APIからメッセージを取得
        const fetchedMessages = await getMessagesByTroubleId(storedTroubleId);
        console.log("取得したメッセージ:", fetchedMessages);

        // メッセージが0件の場合
        if (fetchedMessages.length === 0) {
          console.log(
            "メッセージが見つかりませんでした。ダミーデータを表示します。"
          );
          setMessages(getDummyMessages());
        } else {
          console.log("メッセージを取得しました:", fetchedMessages);

          // 修正: レスポンスデータが直接使えるので変換不要
          setMessages(fetchedMessages);
        }
      } catch (error) {
        console.error("メッセージ取得エラー:", error);
        toast({
          title: "エラー",
          description: "メッセージの読み込みに失敗しました",
          variant: "destructive",
        });
        // エラー時はダミーデータを表示
        setMessages(getDummyMessages());
      } finally {
        setIsLoading(false);
      }
    }

    fetchMessages();
  }, [toast, troubleId]);

  // メッセージ送信後に最下部にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // メッセージ送信処理
  const handleSendMessage = async () => {
    // 入力チェック
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      // ローカルストレージから選択中のお困りごとIDを取得
      const storedTroubleId =
        troubleId || localStorage.getItem("selectedTroubleId");

      if (!storedTroubleId) {
        throw new Error("お困りごとIDが見つかりません");
      }

      // 親メッセージIDを取得（返信の場合）
      const parentId = replyToMessage?.message_id;

      // メッセージをAPIに送信
      const sentMessage = await sendMessage(
        Number(storedTroubleId),
        newMessage,
        parentId
      );

      // メッセージリストを更新
      setMessages([...messages, sentMessage]);

      // 入力フィールドをクリア
      setNewMessage("");

      // 返信状態をリセット
      if (replyToMessage) {
        setReplyToMessage(null);
      }

      toast({
        title: "送信完了",
        description: "メッセージを送信しました",
      });
    } catch (error) {
      console.error("メッセージ送信エラー:", error);
      toast({
        title: "エラー",
        description: "メッセージの送信に失敗しました",
        variant: "destructive",
      });

      // APIが失敗しても、ユーザー体験のためにローカルでメッセージを追加
      const dummySentMessage: Message = {
        message_id: Date.now(), // 一時的なID
        trouble_id: Number(
          troubleId || localStorage.getItem("selectedTroubleId") || 0
        ),
        sender_user_id: Number(localStorage.getItem("userId") || 0),
        sender_name: localStorage.getItem("userName") || "あなた",
        content: newMessage,
        sent_at: new Date().toISOString(),
        parent_message_id: replyToMessage?.message_id,
      };

      setMessages([...messages, dummySentMessage]);
      setNewMessage("");
      if (replyToMessage) {
        setReplyToMessage(null);
      }
    } finally {
      setIsSending(false);
    }
  };

  // 返信ボタンのハンドラー
  const handleReply = (message: Message) => {
    setReplyToMessage(message);
  };

  // ダミーメッセージ生成関数
  const getDummyMessages = (): Message[] => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    return [
      {
        message_id: 1,
        trouble_id: 1,
        sender_user_id: 1,
        sender_name: "フクロウ",
        content:
          "こちらのお困りごとについて相談させていただきます。ユーザー登録フローを改善したいのですが、現在の離脱率が高くて問題となっています。",
        sent_at: yesterday.toISOString(),
      },
      {
        message_id: 2,
        trouble_id: 1,
        sender_user_id: 2,
        sender_name: "キツネ",
        content:
          "こんにちは！確かにユーザー登録フローは改善の余地がありそうですね。現在のフローの具体的な問題点を教えていただけますか？",
        sent_at: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        message_id: 3,
        trouble_id: 1,
        sender_user_id: 1,
        sender_name: "フクロウ",
        content:
          "現在は6ステップあり、特にメールアドレス確認と趣味の入力で離脱が多いです。もっとシンプルにしたいと考えています。",
        sent_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        message_id: 4,
        trouble_id: 1,
        sender_user_id: 3,
        sender_name: "パンダ",
        content:
          "私も参加させていただきます。SNSログインを導入すると、ステップ数が減らせるのではないでしょうか？多くのユーザーはGoogleアカウントやApple IDを持っていると思います。",
        sent_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        message_id: 5,
        trouble_id: 1,
        sender_user_id: 2,
        sender_name: "キツネ",
        content:
          "パンダさんの意見に賛成です。SNSログインはユーザー獲得の大きな助けになります。また、趣味の入力はプロフィール設定に移動して、最初のステップでは必須にしないのもいいかもしれません。",
        sent_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];
  };

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    // 修正: 日付変換エラーのハンドリングを追加
    try {
      const date = new Date(dateString);

      // 修正: 無効な日付の場合はエラーとする
      if (isNaN(date.getTime())) {
        console.error("無効な日付:", dateString);
        return "日時不明";
      }

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // 今日の日付の場合は時刻のみ表示
      if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      // 昨日の日付の場合
      else if (date.toDateString() === yesterday.toDateString()) {
        return `昨日 ${date.toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }
      // それ以外の場合は日付と時刻を表示
      else {
        return date.toLocaleDateString("ja-JP", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (error) {
      // 修正: 日付変換エラーが発生した場合のフォールバック
      console.error("日付フォーマットエラー:", error);
      return "日時不明";
    }
  };

  // ユーザーのアバターを表示する関数
  const getUserAvatar = (name: string) => {
    // 名前に対応する色
    const colors: Record<string, string> = {
      フクロウ: "bg-amber-700",
      キツネ: "bg-orange-500",
      パンダ: "bg-gray-800",
      // 自分自身
      [localStorage.getItem("userName") || ""]: "bg-lightgreen-600",
    };

    // デフォルト色
    const bgColor = colors[name] || "bg-lightgreen-600";

    return (
      <div
        className={`h-8 w-8 rounded-full ${bgColor} text-white flex items-center justify-center text-xs shadow-sm`}
      >
        {name.charAt(0)}
      </div>
    );
  };

  // 自分のメッセージかどうかを判定
  const isOwnMessage = (senderId: number) => {
    const userId = Number(localStorage.getItem("userId") || "0");
    return senderId === userId;
  };

  // 親メッセージを検索する関数
  const findParentMessage = (parentId?: number) => {
    if (!parentId) return null;
    return messages.find((msg) => msg.message_id === parentId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* メッセージスレッド */}
      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-lightgreen-600 animate-pulse">読み込み中...</div>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto px-1 space-y-6">
          {/* **修正 1**: 三項演算子の構文エラーを修正 */}
          {messages.length === 0 ? (
            <div className="text-center p-4 text-lightgreen-600">
              メッセージはまだありません。最初のメッセージを送信してみましょう！
            </div>
          ) : (
            /* **修正 2**: 余分な中括弧を削除し、直接 messages.map を呼び出し */
            messages.map((message) => {
              const isOwn = isOwnMessage(message.sender_user_id);
              const parentMessage = findParentMessage(
                message.parent_message_id
              );

              return (
                <div
                  key={message.message_id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] ${isOwn ? "order-2" : "order-1"}`}
                  >
                    {/* 送信者名 */}
                    <div
                      className={`flex items-center mb-1 ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isOwn && (
                        <div className="mr-2">
                          {getUserAvatar(message.sender_name)}
                        </div>
                      )}
                      <span className="text-xs font-medium text-lightgreen-700">
                        {message.sender_name}
                      </span>
                      <span className="text-xs text-lightgreen-500 ml-2">
                        {formatDate(message.sent_at)}
                      </span>
                    </div>

                    {/* 返信先メッセージの表示 */}
                    {parentMessage && (
                      <div
                        className={`text-xs p-2 rounded-lg mb-1 border-l-2 border-lightgreen-300 ${
                          isOwn
                            ? "bg-lightgreen-50 text-lightgreen-700"
                            : "bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className="font-medium mb-0.5">
                          {parentMessage.sender_name}への返信:
                        </div>
                        <div className="truncate">
                          {parentMessage.content.length > 60
                            ? `${parentMessage.content.substring(0, 60)}...`
                            : parentMessage.content}
                        </div>
                      </div>
                    )}

                    {/* メッセージ本文 */}
                    <div
                      className={`p-3 rounded-xl shadow-sm ${
                        isOwn
                          ? "bg-lightgreen-500 text-white rounded-tr-none"
                          : "bg-white text-lightgreen-800 rounded-tl-none border border-lightgreen-100"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>

                    {/* 返信ボタン */}
                    <div
                      className={`mt-1 ${isOwn ? "text-right" : "text-left"}`}
                    >
                      <button
                        onClick={() => handleReply(message)}
                        className="text-xs text-lightgreen-600 hover:text-lightgreen-700 inline-flex items-center"
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        返信
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
            /* **修正 3**: 閉じ括弧を正しく配置 */
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* 返信先表示 */}
      {replyToMessage && (
        <div className="bg-lightgreen-50 p-2 rounded-lg mb-2 border border-lightgreen-200">
          <div className="flex justify-between">
            <span className="text-xs font-medium text-lightgreen-700">
              {replyToMessage.sender_name}への返信:
            </span>
            <button
              onClick={() => setReplyToMessage(null)}
              className="text-xs text-lightgreen-600 hover:text-lightgreen-700"
            >
              キャンセル
            </button>
          </div>
          <p className="text-xs text-lightgreen-600 truncate">
            {replyToMessage.content}
          </p>
        </div>
      )}

      {/* メッセージ入力 */}
      <div className="mt-4">
        <Separator className="mb-4" />
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="メッセージを入力..."
            className="min-h-[80px] border-lightgreen-200 focus:border-lightgreen-300 resize-none"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            type="submit"
            className="bg-lightgreen-500 hover:bg-lightgreen-600 h-10 w-10 p-0"
            disabled={isSending || !newMessage.trim()}
            onClick={handleSendMessage}
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
