"use client";

import Link from "next/link";
import { TemplateGallery } from "@/components/template-gallery";
import { Button, Card, Container } from "@/components/ui";

export default function TemplateGalleryPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] py-8">
      <Container>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Button href="/editor/builder" variant="ghost" size="md" className="rounded-lg">
            ← エディタに戻る
          </Button>
        </div>
        <Card padding="lg">
          <TemplateGallery applyToEditor />
          <p className="mt-6 text-center text-sm text-slate-500">
            適用後は{" "}
            <Link href="/editor/builder" className="font-medium text-emerald-700 hover:underline">
              編集
            </Link>
            {" "}でプレビュー・編集できます。
          </p>
        </Card>
      </Container>
    </div>
  );
}
