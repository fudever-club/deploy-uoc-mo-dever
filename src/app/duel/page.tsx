"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import {
  DuelQuestion,
  DuelSession,
  RewardTier,
  BuggyMood,
} from "@/types/duel";
import { duelAudio } from "@/lib/duel-audio";
import {
  getRandomQuestions,
  calculateDuelScore,
  evaluateTier,
  generateRewardToken,
  getRandomBuggyLine,
} from "@/lib/duel-engine";
import { BuggyAvatarDialogue } from "@/components/duel/BuggyAvatarDialogue";
import { DuelTimerRing } from "@/components/duel/DuelTimerRing";
import { DynamicRewardQR } from "@/components/duel/DynamicRewardQR";
import {
  Swords,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  Flame,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Home,
  Bot,
} from "lucide-react";

type GameStage = "lobby" | "battle" | "result";

interface AnswerStep {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timeLeftSeconds: number;
  timeSpentMs: number;
}

export default function DuelMobilePage() {
  const [stage, setStage] = useState<GameStage>("lobby");
  const [nickname, setNickname] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Gameplay State
  const [questions, setQuestions] = useState<DuelQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [userAnswers, setUserAnswers] = useState<AnswerStep[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);

  // Timer State (10s per question)
  const QUESTION_TIME = 10;
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIME);
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  // Buggy Reactive Dialogue & Mood
  const [buggyMood, setBuggyMood] = useState<BuggyMood>("idle");
  const [buggyLine, setBuggyLine] = useState<string>(
    "Buggy đang chờ một đối thủ xứng tầm đây, nhập nickname rồi vào so tài nào!"
  );
  const [buggyMascotSrc, setBuggyMascotSrc] = useState<string>("/assets/buggy/arena/buggy_arena_duel_swords.png");

  // Final Session Result
  const [finalSession, setFinalSession] = useState<DuelSession | null>(null);
  const [aiMindReading, setAiMindReading] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sound Toggle
  const toggleSound = () => {
    duelAudio.playClick();
    const next = !soundEnabled;
    setSoundEnabled(next);
    duelAudio.setSoundEnabled(next);
  };

  // Start a new 5-question match
  const handleStartMatch = () => {
    if (!nickname.trim()) return;
    duelAudio.playClick();

    const picked = getRandomQuestions(5);
    setQuestions(picked);
    setCurrentIndex(0);
    setCurrentScore(0);
    setCurrentStreak(0);
    setUserAnswers([]);
    setSelectedOption(null);
    setIsAnswerLocked(false);
    setFinalSession(null);
    setAiMindReading(null);

    setBuggyMood("thinking");
    setBuggyLine(getRandomBuggyLine("game_start"));
    setStage("battle");
  };

  // Synchronize Live Progress with /display Screen
  const broadcastProgress = useCallback(
    async (
      qIndex: number,
      score: number,
      streak: number,
      isCorrect?: boolean,
      comment?: string
    ) => {
      try {
        fetch("/api/duel/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "progress_update",
            nickname: nickname.trim(),
            currentQuestionIndex: qIndex + 1,
            currentScore: score,
            streak,
            isCorrect,
            buggyComment: comment,
          }),
        }).catch(() => {});
      } catch {
        // ignore
      }
    },
    [nickname]
  );

  // Handle Question Timeout
  const handleTimeout = useCallback(() => {
    if (isAnswerLocked) return;
    setIsAnswerLocked(true);
    setSelectedOption(-1);

    duelAudio.playWrongSound();
    setBuggyMood("shocked");
    const line = getRandomBuggyLine("timeout");
    setBuggyLine(line);

    const step: AnswerStep = {
      questionId: questions[currentIndex]?.id || `q-${currentIndex + 1}`,
      selectedIndex: -1,
      isCorrect: false,
      timeLeftSeconds: 0,
      timeSpentMs: QUESTION_TIME * 1000,
    };

    const nextAnswers = [...userAnswers, step];
    setUserAnswers(nextAnswers);
    setCurrentStreak(0);

    broadcastProgress(currentIndex, currentScore, 0, false, line);

    // Auto advance after 1.8s
    setTimeout(() => {
      advanceToNext(nextAnswers, currentScore);
    }, 1800);
  }, [
    isAnswerLocked,
    questions,
    currentIndex,
    userAnswers,
    currentScore,
    broadcastProgress,
  ]);

  // Start question countdown
  useEffect(() => {
    if (stage !== "battle" || questions.length === 0) return;

    setTimeLeft(QUESTION_TIME);
    questionStartTimeRef.current = Date.now();
    setSelectedOption(null);
    setIsAnswerLocked(false);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timerIntervalRef.current);
          handleTimeout();
          return 0;
        }
        if (prev <= 3.5 && Math.floor(prev) !== Math.floor(prev - 0.1)) {
          duelAudio.playCountdownTick(true);
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [stage, currentIndex, questions.length, handleTimeout]);

  // Select an Answer Option
  const handleSelectOption = (optionIndex: number) => {
    if (isAnswerLocked || stage !== "battle") return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setIsAnswerLocked(true);
    setSelectedOption(optionIndex);

    const timeSpentMs = Date.now() - questionStartTimeRef.current;
    const currentQ = questions[currentIndex];
    const isCorrect = optionIndex === currentQ.correctIndex;

    let nextScore = currentScore;
    let nextStreak = currentStreak;
    let line = "";

    if (isCorrect) {
      nextStreak += 1;
      const base = 100;
      const timeBonus = Math.floor(timeLeft) * 10;
      const streakBonus = nextStreak > 1 ? (nextStreak - 1) * 20 : 0;
      nextScore += base + timeBonus + streakBonus;

      duelAudio.playCorrectSound(nextStreak);

      if (nextStreak >= 3) {
        setBuggyMood("shocked");
        line = getRandomBuggyLine("streak");
      } else if (timeLeft >= 7) {
        setBuggyMood("smug");
        line = getRandomBuggyLine("fast_correct");
      } else {
        setBuggyMood("happy");
        line = getRandomBuggyLine("slow_correct");
      }
    } else {
      nextStreak = 0;
      duelAudio.playWrongSound();
      setBuggyMood("crying");
      line = getRandomBuggyLine("wrong");
    }

    setBuggyLine(line);
    setCurrentScore(nextScore);
    setCurrentStreak(nextStreak);

    const step: AnswerStep = {
      questionId: currentQ.id,
      selectedIndex: optionIndex,
      isCorrect,
      timeLeftSeconds: timeLeft,
      timeSpentMs,
    };
    const nextAnswers = [...userAnswers, step];
    setUserAnswers(nextAnswers);

    broadcastProgress(currentIndex, nextScore, nextStreak, isCorrect, line);

    // Auto advance after 1.5s
    setTimeout(() => {
      advanceToNext(nextAnswers, nextScore);
    }, 1500);
  };

  // Advance to next question or finish game
  const advanceToNext = async (answers: AnswerStep[], finalScore: number) => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished all 5 questions
      await handleFinishMatch(answers, finalScore);
    }
  };

  // Submit Match & Calculate Tier
  const handleFinishMatch = async (
    answers: AnswerStep[],
    scoreCalculated: number
  ) => {
    setIsSubmitting(true);
    setStage("result");

    const scoreResult = calculateDuelScore(answers);
    const tierInfo = evaluateTier(scoreResult.correctCount);

    // Victory Effects
    if (tierInfo.tier === 2) {
      duelAudio.playVictoryFanfare();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FAC775", "#4CE0D2", "#E14CE8", "#0091EA"],
      });
      setBuggyMood("victory");
    } else if (tierInfo.tier === 1) {
      duelAudio.playCorrectSound(3);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#FAC775", "#0091EA"],
      });
      setBuggyMood("happy");
    } else {
      setBuggyMood("smug");
    }

    // Dynamic Token Generation
    const sessionId = `duel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const { rewardCode, expiresAt } = generateRewardToken(
      sessionId,
      tierInfo.tier,
      90
    );

    const newSession: DuelSession = {
      id: sessionId,
      nickname: nickname.trim(),
      score: scoreResult.totalScore,
      correctCount: scoreResult.correctCount,
      totalQuestions: answers.length,
      streakMax: scoreResult.streakMax,
      tier: tierInfo.tier,
      tierLabel: tierInfo.tierLabel,
      rewardCode,
      rewardCodeExpiresAt: expiresAt,
      rewardStatus: "pending",
      phone: null,
      createdAt: new Date().toISOString(),
      answers: scoreResult.detailedAnswers,
    };

    setFinalSession(newSession);

    // Persist session to API
    try {
      fetch("/api/duel/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim(),
          answers,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.session) {
            setFinalSession(data.data.session);
          }
        })
        .catch(() => {});
    } catch {
      // offline fallback handles it locally
    } finally {
      setIsSubmitting(false);
    }

    // Call Non-blocking AI Mind-reading
    triggerMindReading(nickname.trim(), scoreResult.totalScore, scoreResult.correctCount);
  };

  // Trigger Mind Reading Endpoint (1.5s timeout fallback)
  const triggerMindReading = async (
    name: string,
    score: number,
    correctCount: number
  ) => {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/duel/mind-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: name, score, correctCount }),
      });
      const data = await res.json();
      if (data.success && data.data?.aiComment) {
        setAiMindReading(data.data.aiComment);
      }
    } catch {
      setAiMindReading(
        "Buggy chúc bạn một ngày Club Day rực rỡ và sớm trở thành coder cừ khôi cùng FU-DEVER!"
      );
    } finally {
      setLoadingAi(false);
    }
  };

  // Refresh Expired Token Callback
  const handleRefreshCode = async () => {
    if (!finalSession) return;
    try {
      const res = await fetch("/api/duel/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "refresh",
          sessionId: finalSession.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFinalSession((prev) =>
          prev
            ? {
                ...prev,
                rewardCode: data.data.rewardCode,
                rewardCodeExpiresAt: data.data.rewardCodeExpiresAt,
              }
            : null
        );
      }
    } catch {
      // local regenerate fallback
      const { rewardCode, expiresAt } = generateRewardToken(
        finalSession.id,
        finalSession.tier,
        90
      );
      setFinalSession((prev) =>
        prev
          ? {
              ...prev,
              rewardCode,
              rewardCodeExpiresAt: expiresAt,
            }
          : null
      );
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col justify-between selection:bg-[#4CE0D2] selection:text-[#0B1220]">
      {/* Top Navbar */}
      <header className="px-4 py-3 border-b border-[#4CE0D2]/20 flex items-center justify-between bg-[#0B1220]/80 backdrop-blur-md sticky top-0 z-30">
        <Link
          href="/"
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#993C1D] to-[#0091EA] p-1 border border-[#FAC775] flex items-center justify-center">
            <Image
              src="/assets/logo/logo-dever-white.png"
              alt="Logo FU-DEVER"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-[#4CE0D2]">
              FU-DEVER ARENA
            </div>
            <h1 className="text-xs font-black text-white flex items-center gap-1">
              <span>Buggy AI Arena</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E14CE8]/30 text-[#E14CE8] font-bold">
                60S
              </span>
            </h1>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-[#FAC775] transition-colors cursor-pointer"
            title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 opacity-50" />
            )}
          </button>

          <Link
            href="/"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-slate-300 transition-colors cursor-pointer"
            title="Về trang chủ Deploy Ước Mơ"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6 flex flex-col justify-center">
        {/* STAGE 1: LOBBY */}
        {stage === "lobby" && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Mascot Banner */}
            <div className="text-center space-y-3">
              <div className="relative w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br from-[#12203A] to-[#0091EA]/30 border-2 border-[#4CE0D2] p-2 shadow-[0_0_30px_rgba(76,224,210,0.3)] flex items-center justify-center">
                <Image
                  src="/assets/buggy/11.png"
                  alt="Buggy Mascot"
                  width={96}
                  height={96}
                  priority
                  className="object-contain animate-float"
                />
                <span className="absolute -top-2 -right-2 bg-[#FAC775] text-[#0B1220] text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-md">
                  SOLO 1v1
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4CE0D2] via-white to-[#FAC775] tracking-tight">
                  Đấu Trí Solo AI Buggy
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  5 câu đố IT & Meme FPTU · 10s/câu · Thắng rinh quà độc quyền!
                </p>
              </div>
            </div>

            {/* Buggy Greeting Dialogue */}
            <BuggyAvatarDialogue mood={buggyMood} line={buggyLine} size="md" title="Lời Chào Từ Buggy" />

            {/* Nickname Input Form */}
            <div className="bg-[#12203A]/80 border border-[#4CE0D2]/40 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Nhập Nickname của bạn</span>
                  <span className="text-[10px] text-[#4CE0D2] font-semibold">
                    (Hiện trên bảng vàng)
                  </span>
                </label>
                <input
                  id="input-nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStartMatch()}
                  placeholder="VD: MinhK22, CoderGiauTen, HackerDEVER..."
                  maxLength={25}
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#0B1220] border border-slate-700 focus:border-[#4CE0D2] focus:ring-2 focus:ring-[#4CE0D2]/20 text-white font-bold text-sm outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              <button
                id="btn-start-duel"
                onClick={handleStartMatch}
                disabled={!nickname.trim()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#4CE0D2] via-[#0091EA] to-[#E14CE8] text-[#0B1220] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(76,224,210,0.4)] hover:opacity-95 active:scale-98 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Swords className="w-5 h-5" />
                <span>Bắt Đầu Đấu Với Buggy</span>
              </button>
            </div>

            {/* Rewards Tiers Preview */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <div>
                  <div className="font-bold text-[#FAC775]">Tier 1 (Đúng 3-4)</div>
                  <div className="text-slate-400 text-[10px]">Sticker DEVER</div>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                <span className="text-lg">👑</span>
                <div>
                  <div className="font-bold text-[#4CE0D2]">Tier 2 (Đúng 5/5)</div>
                  <div className="text-slate-400 text-[10px]">Móc Khóa / Thẻ Hacker</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: BATTLE (5 QUESTIONS) */}
        {stage === "battle" && currentQ && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Top Score & Progress Header */}
            <div className="flex items-center justify-between bg-[#12203A]/80 border border-white/10 rounded-2xl p-3 shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#0091EA]/30 text-[#4CE0D2] border border-[#4CE0D2]/30">
                  Câu {currentIndex + 1}/5
                </span>
                <span className="text-xs font-extrabold text-[#FAC775] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {currentScore} pts
                </span>
              </div>

              <div className="flex items-center gap-3">
                {currentStreak > 1 && (
                  <div className="flex items-center gap-1 text-xs font-black text-[#E14CE8] animate-bounce">
                    <Flame className="w-4 h-4 fill-current" />
                    <span>Streak x{currentStreak}</span>
                  </div>
                )}
                {/* Timer Ring */}
                <DuelTimerRing
                  timeLeft={timeLeft}
                  totalTime={QUESTION_TIME}
                  size={46}
                  strokeWidth={5}
                />
              </div>
            </div>

            {/* Buggy Reactive Dialogue Bar */}
            <BuggyAvatarDialogue
              mood={buggyMood}
              line={buggyLine}
              size="sm"
              animate={false}
              title="Lời Bình Từ Buggy"
            />

            {/* Question Card */}
            <div className="bg-[#12203A] border-2 border-[#4CE0D2]/50 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-[11px] text-[#4CE0D2] font-extrabold uppercase tracking-wider">
                <span>{currentQ.topicLabel}</span>
                <span className="text-slate-400">10s countdown</span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-white leading-snug min-h-[50px] flex items-center">
                {currentQ.question}
              </h3>

              {/* Options List */}
              <div className="space-y-2.5 pt-1">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isCorrect = optIdx === currentQ.correctIndex;

                  let btnStyle =
                    "bg-[#0B1220] border-slate-700 hover:border-[#4CE0D2] text-slate-200";

                  if (isAnswerLocked) {
                    if (isCorrect) {
                      btnStyle =
                        "bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.4)]";
                    } else if (isSelected) {
                      btnStyle =
                        "bg-rose-950/80 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]";
                    } else {
                      btnStyle = "bg-[#0B1220]/50 border-slate-800 text-slate-500";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      disabled={isAnswerLocked}
                      className={`w-full min-h-[48px] p-3.5 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm flex items-center justify-between transition-all duration-200 cursor-pointer active:scale-98 ${btnStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isAnswerLocked && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-in zoom-in" />
                      )}
                      {isAnswerLocked && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0 animate-in zoom-in" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation on Locked */}
              {isAnswerLocked && currentQ.explanation && (
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 animate-in fade-in duration-300">
                  <span className="font-bold text-[#FAC775]">💡 Giải thích: </span>
                  {currentQ.explanation}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STAGE 3: RESULT & DYNAMIC REWARD QR */}
        {stage === "result" && finalSession && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-400">
            {/* Score & Tier Card */}
            <div className="bg-[#12203A] border-2 border-[#FAC775] rounded-3xl p-5 shadow-2xl text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAC775]/20 text-[#FAC775] text-xs font-black uppercase">
                <Trophy className="w-4 h-4" />
                <span>Kết Quả Trận Đấu</span>
              </div>

              <div>
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FAC775] via-white to-[#4CE0D2]">
                  {finalSession.score} Điểm
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Đúng {finalSession.correctCount}/5 câu · Chuỗi đúng cao nhất:{" "}
                  {finalSession.streakMax}
                </p>
              </div>

              {/* Buggy Final Speech */}
              <BuggyAvatarDialogue
                mood={buggyMood}
                line={buggyLine}
                size="sm"
                animate={false}
                title="Tổng Kết Từ Buggy"
              />

              {/* Optional AI Mind-Reading Flavor */}
              {aiMindReading && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0091EA]/20 to-[#E14CE8]/20 border border-[#4CE0D2]/40 text-left text-xs text-slate-200 flex items-start gap-2.5 animate-in fade-in duration-500">
                  <Bot className="w-5 h-5 text-[#4CE0D2] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-[#4CE0D2] block mb-0.5">
                      🔮 Buggy Đọc Vị Ước Mơ:
                    </span>
                    <p className="italic">{aiMindReading}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic QR Code Redeem Widget (Only for Tier >= 1) */}
            {finalSession.tier >= 1 ? (
              <DynamicRewardQR
                rewardCode={finalSession.rewardCode}
                expiresAt={finalSession.rewardCodeExpiresAt}
                sessionId={finalSession.id}
                tierLabel={finalSession.tierLabel}
                onRefreshCode={handleRefreshCode}
              />
            ) : (
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center space-y-2">
                <p className="text-xs text-slate-300">
                  Chưa đạt đủ 3 câu đúng để nhận quà lần này. Hãy chơi lại để phục thù Buggy nhé!
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleStartMatch}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#4CE0D2] to-[#0091EA] text-[#0B1220] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi Lại Trận Mới</span>
              </button>

              <Link
                href="/display"
                className="py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Xem BXH Display</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-[10px] text-slate-500 border-t border-slate-800">
        FU-DEVER Club Day 2026 · Software Engineering Club · FPT University Da Nang
      </footer>
    </div>
  );
}
