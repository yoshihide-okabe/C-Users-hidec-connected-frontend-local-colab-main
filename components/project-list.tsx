"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Project {
  id: number;
  title: string;
  description: string;
  owner: string;
  status: string;
  category: string;
  createdAt: string;
}

interface ProjectListProps {
  type: "new" | "favorite";
  onSelectProject?: (project: Project) => void;
}

export function ProjectList({ type, onSelectProject }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 通常はAPIからプロジェクト一覧を取得するが、
    // ここではダミーデータを使用する
    const fetchProjects = async () => {
      try {
        // APIコール（実装時にコメントアウトを解除）
        // const response = await fetch(`/api/projects/${type}`);
        // const data = await response.json();
        // setProjects(data);

        // ダミーデータ（実際の実装時は削除）
        setTimeout(() => {
          const dummyProjects: Project[] = [
            {
              id: 1,
              title: "オンライン学習プラットフォーム",
              description:
                "誰でも簡単にオンラインで学べるプラットフォームを開発しています。特に教育格差の解消を目指しています。",
              owner: "フクロウ",
              status: "active",
              category: "教育",
              createdAt: "2023-04-10T12:00:00Z",
            },
            {
              id: 2,
              title: "シニア向けスマホアプリ",
              description:
                "高齢者でも直感的に操作できるシンプルなインターフェースのアプリを開発します。",
              owner: "タヌキ",
              status: "active",
              category: "ヘルスケア",
              createdAt: "2023-04-12T09:30:00Z",
            },
            {
              id: 3,
              title: "地域コミュニティアプリ",
              description:
                "地域の情報共有と助け合いを促進するプラットフォームです。",
              owner: "キツネ",
              status: "active",
              category: "コミュニティ",
              createdAt: "2023-04-15T14:20:00Z",
            },
          ];

          // お気に入りとして2番目と3番目のプロジェクトを表示
          if (type === "favorite") {
            setProjects([dummyProjects[1], dummyProjects[2]]);
          } else {
            setProjects(dummyProjects);
          }

          setIsLoading(false);
        }, 500); // 読み込み時間をシミュレート
      } catch (error) {
        console.error(`Error fetching ${type} projects:`, error);
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [type]);

  const handleProjectClick = (project: Project) => {
    // プロジェクト選択のコールバックがある場合は実行
    if (onSelectProject) {
      onSelectProject(project);
    }

    // ローカルストレージに情報を保存（親コンポーネントでも行っているが念のため）
    localStorage.setItem("selectedProjectId", project.id.toString());
    localStorage.setItem("selectedProjectTitle", project.title);
    localStorage.setItem("selectedProjectDescription", project.description);
    localStorage.setItem("selectedProjectOwner", project.owner);

    console.log("Project clicked and saved:", {
      id: project.id,
      title: project.title,
    });
  };

  if (isLoading) {
    return (
      <div className="w-full py-6 flex justify-center">
        <div className="text-lightgreen-600">読み込み中...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="w-full py-6 bg-lightgreen-50 rounded-xl border border-lightgreen-200 flex flex-col items-center justify-center">
        <p className="text-lightgreen-700 mb-2">
          {type === "new"
            ? "新着プロジェクトはありません"
            : "お気に入りプロジェクトはありません"}
        </p>
        {type === "favorite" && (
          <Link href="/projects/new">
            <Button
              variant="outline"
              size="sm"
              className="border-lightgreen-300 text-lightgreen-700 hover:bg-lightgreen-100"
            >
              プロジェクトを探す
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className="rounded-xl border border-lightgreen-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleProjectClick(project)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lightgreen-800">
                {project.title}
              </h3>
              <p className="text-xs text-lightgreen-600 mt-1">
                {project.description.length > 100
                  ? `${project.description.substring(0, 100)}...`
                  : project.description}
              </p>
            </div>
            <div className="text-lightgreen-500">
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-5 w-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center mr-1">
                {project.owner.charAt(0)}
              </div>
              <span className="text-xs text-lightgreen-600">
                {project.owner}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="bg-lightgreen-100 text-lightgreen-700 px-2 py-0.5 rounded-full text-xs">
                {project.category}
              </span>
            </div>
          </div>
        </div>
      ))}

      <Link href={`/projects/${type}`} className="mt-1">
        <Button
          variant="ghost"
          className="w-full text-lightgreen-700 hover:bg-lightgreen-100"
        >
          {type === "new" ? "新着プロジェクト" : "お気に入り"}をもっと見る
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
