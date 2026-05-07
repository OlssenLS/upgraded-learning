"use client";

import { type PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, Maximize2, Minus } from "lucide-react";
import StatsCard from "./StatsCard";
import quizQuestions from "../data/quiz-questions.json";
import QuizModal from "./QuizModal";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    file: File;
}

export default function PdfViewer({ file }: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [zoom, setZoom] = useState(1);
    const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(null);
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
    const [zoomOrigin, setZoomOrigin] = useState({ x: 0, y: 0 });
    const [visitedSlides, setVisitedSlides] = useState<Set<number>>(new Set([1]));
    const [currentQuiz, setCurrentQuiz] = useState<{ slideNumber: number } | null>(null);
    const [lastSlideBeforeQuiz, setLastSlideBeforeQuiz] = useState<number | null>(null);
    const [lastQuizTriggerPage, setLastQuizTriggerPage] = useState<number | null>(null);
    const [failedQuizSlides, setFailedQuizSlides] = useState<Set<number>>(new Set());
    const [quizCount, setQuizCount] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const pageFrameRef = useRef<HTMLDivElement>(null);
    const fileKey = `${file.name}-${file.lastModified}-${file.size}`;

    useEffect(() => {
        setNumPages(null);
        setCurrentPage(1);
        setZoom(1);
        setPageSize(null);
        setVisitedSlides(new Set([1]));
        setCurrentQuiz(null);
        setLastQuizTriggerPage(null);
        setFailedQuizSlides(new Set());
        setQuizCount(0);
        setCorrectAnswers(0);
        setWrongAnswers(0);
    }, [fileKey]);

    const quizLimits = useMemo(() => {
        if (!numPages) {
            return { min: 0, max: 0 };
        }

        if (numPages < 10) {
            return { min: 1, max: 2 };
        }

        if (numPages < 20) {
            return { min: 1, max: 3 };
        }

        return { min: 2, max: 5 };
    }, [numPages]);

    const quizSpacing = 2;

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setCurrentPage(1);
        setZoom(1);
        setPageSize(null);
    };

    const onPageLoadSuccess = useCallback((page: { getViewport: (options: { scale: number }) => { width: number; height: number } }) => {
        const viewport = page.getViewport({ scale: 1 });
        setPageSize({ width: viewport.width, height: viewport.height });
    }, []);

    const goToPreviousPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }, [currentPage]);

    const goToNextPage = useCallback(() => {
        if (numPages && currentPage < numPages) {
            const nextPage = currentPage + 1;
            const hasRemainingQuizBudget = quizCount < quizLimits.max;
            const isForcedRetryQuiz = failedQuizSlides.has(currentPage);
            const isWithinQuizCooldown = lastQuizTriggerPage !== null && currentPage - lastQuizTriggerPage < quizSpacing;
            const quizzesNeededForMinimum = Math.max(0, quizLimits.min - quizCount);
            const remainingQuizOpportunities = numPages - currentPage;
            const mustTriggerMinimumQuiz = quizzesNeededForMinimum > 0 && remainingQuizOpportunities <= quizzesNeededForMinimum;
            const shouldTriggerRandomQuiz = hasRemainingQuizBudget && !isForcedRetryQuiz && !isWithinQuizCooldown && !mustTriggerMinimumQuiz && Math.random() < 0.3;

            if (quizQuestions["default"] && (isForcedRetryQuiz || (hasRemainingQuizBudget && (mustTriggerMinimumQuiz || shouldTriggerRandomQuiz)))) {
                setLastSlideBeforeQuiz(currentPage);
                setLastQuizTriggerPage(currentPage);
                setCurrentQuiz({ slideNumber: nextPage });
                if (!isForcedRetryQuiz) {
                    setQuizCount(prev => prev + 1);
                }
            } else {
                setCurrentPage(nextPage);
                setVisitedSlides(prev => new Set([...prev, nextPage]));
            }
        }
    }, [currentPage, numPages, quizCount, quizLimits.max, quizLimits.min, failedQuizSlides, lastQuizTriggerPage]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                goToPreviousPage();
            } else if (e.key === "ArrowRight") {
                goToNextPage();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [goToPreviousPage, goToNextPage]);

    useEffect(() => {
        const updateViewport = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setViewportSize({
                    width: rect.width,
                    height: rect.height,
                });
            }
        };

        updateViewport();

        const observer = new ResizeObserver(updateViewport);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        window.addEventListener("resize", updateViewport);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", updateViewport);
        };
    }, []);

    const fitScale = useMemo(() => {
        if (!pageSize || !viewportSize.width || !viewportSize.height) {
            return 1;
        }

        const isMobileViewport = viewportSize.width < 640;
        const horizontalPadding = isMobileViewport ? 12 : 48;
        const verticalPadding = isMobileViewport ? 32 : 96;
        const availableWidth = Math.max(120, viewportSize.width - horizontalPadding);
        const availableHeight = Math.max(120, viewportSize.height - verticalPadding);

        return Math.min(availableWidth / pageSize.width, availableHeight / pageSize.height);
    }, [pageSize, viewportSize.height, viewportSize.width]);

    useEffect(() => {
        if (!pageSize) {
            return;
        }

        setZoomOrigin({
            x: (pageSize.width * fitScale) / 2,
            y: (pageSize.height * fitScale) / 2,
        });
    }, [fitScale, pageSize]);

    const renderScale = Math.max(0.45, Math.min(3, fitScale * zoom));
    const pageZoomScale = Math.max(0.6, Math.min(2.5, zoom));

    const isFirstPage = currentPage <= 1;
    const isLastPage = !numPages || currentPage >= numPages;

    const handleResetZoom = () => {
        setZoom(1);

        if (pageSize) {
            setZoomOrigin({
                x: (pageSize.width * fitScale) / 2,
                y: (pageSize.height * fitScale) / 2,
            });
        }
    };

    const handleQuizAnswer = useCallback((isCorrect: boolean) => {
        if (!currentQuiz) return;

        if (isCorrect) {
            // Correct answer: move to the quiz slide
            setCurrentPage(currentQuiz.slideNumber);
            setVisitedSlides(prev => new Set([...prev, currentQuiz.slideNumber]));
            setCorrectAnswers(prev => prev + 1);
            // Remove from failed slides if it was there
            setFailedQuizSlides(prev => {
                const newSet = new Set(prev);
                newSet.delete(lastSlideBeforeQuiz!);
                return newSet;
            });
        } else {
            // Incorrect answer: revert to last slide and mark it as a failed quiz slide
            if (lastSlideBeforeQuiz !== null) {
                setCurrentPage(lastSlideBeforeQuiz);
                    setWrongAnswers(prev => prev + 1);
                // Mark this slide as having a failed quiz so it will appear again on next
                setFailedQuizSlides(prev => new Set([...prev, lastSlideBeforeQuiz]));
            }
        }

        setCurrentQuiz(null);
        setLastSlideBeforeQuiz(null);
    }, [currentQuiz, lastSlideBeforeQuiz]);

    const handlePagePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
        if (!pageFrameRef.current) {
            return;
        }

        const rect = pageFrameRef.current.getBoundingClientRect();

        setZoomOrigin({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        });
    }, []);

    const changeZoom = useCallback((delta: number) => {
        setZoom((value) => {
            const nextZoom = Number((value + delta).toFixed(2));
            return Math.max(0.6, Math.min(2.5, nextZoom));
        });
    }, []);

    const handlePageClick = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
        handlePagePointerMove(event);
        changeZoom(0.12);
    }, [changeZoom, handlePagePointerMove]);

    // Show stats if on last page
    if (isLastPage && numPages) {
        return (
            <div className="flex min-h-0 flex-1 flex-col gap-4">
                <div className="flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
                    <StatsCard
                        quizCount={quizCount}
                        correctAnswers={correctAnswers}
                        wrongAnswers={wrongAnswers}
                    />
                </div>
            </div>
        );
    }


    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div
                ref={containerRef}
                className="relative flex min-h-[52vh] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:min-h-[60vh] sm:rounded-[2rem] sm:p-6"
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_35%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.08),transparent_35%)]" />

                <div
                    ref={pageFrameRef}
                    onPointerMove={handlePagePointerMove}
                    onClick={handlePageClick}
                    className="absolute inset-0 z-10 flex items-center justify-center"
                    style={{
                        transformOrigin: `${zoomOrigin.x}px ${zoomOrigin.y}px`,
                        transform: `scale(${pageZoomScale})`,
                        willChange: "transform",
                    }}
                >
                    <Document
                        key={fileKey}
                        file={file}
                        onLoadSuccess={onDocumentLoadSuccess}
                        className="relative z-10 flex items-center justify-center"
                    >
                        <Page
                            pageNumber={currentPage}
                            onLoadSuccess={onPageLoadSuccess}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            scale={renderScale}
                        />
                    </Document>
                </div>

                {!pageSize && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center text-sm text-slate-300">
                        Loading page...
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
                <div className="flex items-center justify-between gap-2 text-sm text-slate-300 sm:w-auto sm:justify-start">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200/80">
                        Page {currentPage}/{numPages ?? "-"}
                    </span>
                    <span className="hidden text-slate-500 sm:inline">•</span>
                    <span className="hidden sm:inline">Zoom {Math.round(renderScale * 100)}%</span>
                </div>

                <div className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 sm:w-auto">
                    <button
                        onClick={goToPreviousPage}
                        disabled={isFirstPage}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-cyan-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={goToNextPage}
                        disabled={isLastPage}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-cyan-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
                        aria-label="Next slide"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 sm:w-auto">
                    <button
                        onClick={() => changeZoom(-0.12)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-cyan-100 transition hover:bg-white/10 sm:h-10 sm:w-10"
                        aria-label="Zoom out"
                    >
                        <Minus size={18} />
                    </button>
                    <button
                        onClick={handleResetZoom}
                        className="inline-flex h-9 items-center justify-center rounded-full px-3 text-[10px] font-medium uppercase tracking-[0.14em] text-cyan-100 transition hover:bg-white/10 sm:h-10 sm:text-xs sm:tracking-[0.18em]"
                    >
                        <Maximize2 className="mr-2 h-3.5 w-3.5" />
                        Fit
                    </button>
                </div>
            </div>

            {currentQuiz && (
                <QuizModal
                    question={quizQuestions["default" as keyof typeof quizQuestions]}
                    slideNumber={currentQuiz.slideNumber}
                    onAnswer={handleQuizAnswer}
                />
            )}
        </div>
    );
}
