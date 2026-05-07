"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, FileUp, Sparkles } from "lucide-react";

const PdfViewer = dynamic(() => import("./components/PdfViewer"), {
  ssr: false,
});

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.22),transparent_25%),linear-gradient(180deg,rgba(5,8,22,0.92),rgba(3,5,11,1))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-10 sm:px-8 lg:px-12">
        {!file ? (
          <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur-md">
                <Sparkles className="h-4 w-4" />
                Interactive learning with AI quizzes
              </div>
              <div className="space-y-5">
                <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance text-white sm:text-6xl lg:text-7xl">
                  Turn lecture slides into interactive discussions.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  This solution supports interactive learning where lecturers do more than read slides. Our system generates pop quizzes from the material so students discuss more and understand the topic better.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                  AI-generated pop quizzes
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                  Discussion-first learning flow
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                  Understanding-focused delivery
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
              <div className="rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 via-slate-950/60 to-blue-500/10 p-8">
                <div className="mb-6 flex items-center gap-3 text-cyan-200">
                  <FileUp className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-[0.2em]">
                    Upload PDF
                  </span>
                </div>
                <p className="max-w-sm text-sm leading-6 text-slate-300">
                  Upload your lecture PDF and present it with guided quiz moments that help students pause, discuss, and reinforce understanding.
                </p>
                <label className="mt-8 inline-flex cursor-pointer items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-400 px-6 py-3 font-medium text-slate-950 shadow-[0_12px_40px_rgba(34,211,238,0.25)] transition hover:-translate-y-0.5 hover:bg-cyan-300">
                  <span>Choose File</span>
                  <ArrowRight className="h-4 w-4" />
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </section>
        ) : (
          <div className="flex min-h-[calc(100vh-5rem)] flex-col">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/70">
                  Presentation mode
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                  {file.name}
                </h2>
              </div>
              <label className="hidden cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-md transition hover:bg-white/10 sm:inline-flex">
                <FileUp className="h-4 w-4" />
                Replace PDF
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <PdfViewer file={file} />
          </div>
        )}
      </main>
    </div>
  );
}
