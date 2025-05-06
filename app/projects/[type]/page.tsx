"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Bell } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { useToast } from "@/hooks/use-toast";
import { ProjectGrid } from "@/components/project-grid";
import { getProjects } from "@/services/projects";

export default function ProjectsPage() {
  const params = useParams();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URLパラメータからタイプを取得
  const type = params.type as string;
  const title = type === "new" ? "新着プロジェクト" : "お気に入りプロジェクト";

  // プロジェクト一覧を取得
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // APIからプロジェクト一覧を取得
        const data = await getProjects(type as "new" | "favorite");
        setProjects(data);
      } catch (error) {
        console.error("プロジェクト取得エラー:", error);
        setError(
          error instanceof Error ? error.message : "データの取得に失敗しました"
        );
        toast({
          title: "エラー",
          description: "プロジェクト一覧の取得に失敗しました",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [type, toast]);

  return (
    <div className="pb-20 bg-gradient-to-b from-lightgreen-50 to-white">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-lightgreen-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="mr-1 h-8 w-8 text-lightgreen-600 hover:text-lightgreen-700 hover:bg-lightgreen-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-lightgreen-800">{title}</h1>
          </div>
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
                {localStorage.getItem("userName")?.charAt(0) || "ユ"}
              </div>
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-lightgreen-600">
              読み込み中...
            </div>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}

// ProjectCardコンポーネント（既存のコンポーネントから移植）
function ProjectCard({ project }: { project: Project }) {
  // ProjectCardの実装（現在のprojects/[type]/page.tsxの内容を移植）
  // ...
}
