"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface QuizModalProps {
  question: QuizQuestion;
  slideNumber: number;
  onAnswer: (isCorrect: boolean) => void;
}

export default function QuizModal({ question, slideNumber, onAnswer }: QuizModalProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (selectedOption === null) return;

    const correct = selectedOption === question.correct;
    setIsCorrect(correct);
    setSubmitted(true);

    setTimeout(() => {
      onAnswer(correct);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col items-center gap-4">
            {isCorrect ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-400" />
                <h2 className="text-xl font-bold text-green-400 sm:text-2xl">Correct!</h2>
                <p className="text-center text-slate-300">Great job! Moving to the next slide...</p>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-red-400" />
                <h2 className="text-xl font-bold text-red-400 sm:text-2xl">Incorrect</h2>
                <p className="text-center text-slate-300">Going back to the previous slide...</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
        <div className="mb-5 sm:mb-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-cyan-200/70">
            Pop Quiz - Slide {slideNumber}
          </p>
          <h2 className="text-xl font-bold text-white sm:text-2xl">{question.question}</h2>
        </div>

        <div className="mb-6 space-y-3 sm:mb-8">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition sm:px-6 sm:py-4 sm:text-base ${
                selectedOption === index
                  ? "border-cyan-400 bg-cyan-400/20 text-cyan-100"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <span className="mr-3 inline-block h-6 w-6 rounded-full border-2 border-current flex items-center justify-center text-xs">
                {selectedOption === index && <span className="h-2 w-2 rounded-full bg-current" />}
              </span>
              {option}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={selectedOption === null}
          className="w-full rounded-full bg-cyan-400 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3"
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
}
