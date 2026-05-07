"use client";

import { BarChart3, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

interface StatsCardProps {
  quizCount: number;
  correctAnswers: number;
  wrongAnswers: number;
}

export default function StatsCard({ quizCount, correctAnswers, wrongAnswers }: StatsCardProps) {
  const totalAttempts = correctAnswers + wrongAnswers;
  const successRate = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
  
  // Understanding metric: 0-100 based on correct/wrong ratio
  const understandingMetric = totalAttempts > 0 
    ? Math.round((correctAnswers / totalAttempts) * 100)
    : 0;

  const getMetricColor = (metric: number) => {
    if (metric >= 80) return "text-green-400";
    if (metric >= 60) return "text-yellow-400";
    if (metric >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getMetricLabel = (metric: number) => {
    if (metric >= 80) return "Excellent";
    if (metric >= 60) return "Good";
    if (metric >= 40) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-2">Presentation Complete!</h2>
        <p className="text-slate-300">Here's how you performed</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Quiz Count Card */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Quizzes</p>
          </div>
          <p className="text-4xl font-bold text-white">{quizCount}</p>
          <p className="mt-2 text-sm text-slate-400">times appeared</p>
        </div>

        {/* Correct Answers Card */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <p className="text-xs uppercase tracking-[0.2em] text-green-200/70">Correct</p>
          </div>
          <p className="text-4xl font-bold text-green-400">{correctAnswers}</p>
          <p className="mt-2 text-sm text-slate-400">correct attempts</p>
        </div>

        {/* Wrong Answers Card */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="h-5 w-5 text-red-400" />
            <p className="text-xs uppercase tracking-[0.2em] text-red-200/70">Incorrect</p>
          </div>
          <p className="text-4xl font-bold text-red-400">{wrongAnswers}</p>
          <p className="mt-2 text-sm text-slate-400">wrong attempts</p>
        </div>

        {/* Understanding Metric Card */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className={`h-5 w-5 ${getMetricColor(understandingMetric)}`} />
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Understanding</p>
          </div>
          <p className={`text-4xl font-bold ${getMetricColor(understandingMetric)}`}>
            {understandingMetric}%
          </p>
          <p className={`mt-2 text-sm ${getMetricColor(understandingMetric)}`}>
            {getMetricLabel(understandingMetric)}
          </p>
        </div>
      </div>

      {/* Success Rate Bar */}
      {totalAttempts > 0 && (
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <p className="mb-3 text-sm font-medium text-slate-300">Success Rate</p>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full transition-all duration-500 ${
                successRate >= 70
                  ? "bg-green-500"
                  : successRate >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${successRate}%` }}
            />
          </div>
          <p className="mt-2 text-right text-sm text-slate-400">
            {correctAnswers}/{totalAttempts} correct
          </p>
        </div>
      )}
    </div>
  );
}
