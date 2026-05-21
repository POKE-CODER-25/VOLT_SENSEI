import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, CheckCircle2, Clock, Flame, Loader2, Target, Trophy, Zap, Atom, Calculator, Cpu, LayoutDashboard } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import { saveQuizAttempt } from "../services/firestore";
import { generateQuizWithGroq } from "../services/groq";

const subjectData = {
  physics: {
    title: "Physics",
    icon: Cpu,
    theme: "text-electric",
    bg: "bg-electric/10",
    topics: ["Mechanics", "Electromagnetism", "Optics", "Thermodynamics", "Modern Physics", "Numericals"]
  },
  maths: {
    title: "Maths",
    icon: Calculator,
    theme: "text-purple-400",
    bg: "bg-purple-500/10",
    topics: ["Algebra", "Calculus", "Coordinate Geometry", "Trigonometry", "Vectors"]
  },
  chemistry: {
    title: "Chemistry",
    icon: Atom,
    theme: "text-emerald-400",
    bg: "bg-emerald-500/10",
    topics: ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry", "Atomic Structure"]
  }
};

const difficulties = ["Beginner", "Medium", "Advanced", "JEE Main", "JEE Advanced"];
const questionTypes = ["MCQ", "Numerical", "Assertion/Reason"];

function getTimeLimit(difficulty) {
  if (difficulty === "JEE Advanced") return 120;
  if (difficulty === "JEE Main") return 90;
  if (difficulty === "Advanced") return 60;
  if (difficulty === "Medium") return 40;
  return 30;
}

function Quiz() {
  const [searchParams, setSearchParams] = useSearchParams();
  const subjectKey = searchParams.get("subject") || "physics";
  const config = subjectData[subjectKey] || subjectData.physics;

  const { currentUser, profile, refreshProfile } = useAuth();
  const [topic, setTopic] = useState(config.topics[0]);
  const [difficulty, setDifficulty] = useState(difficulties[1]);
  const [questionType, setQuestionType] = useState(questionTypes[0]);
  
  useEffect(() => {
    setTopic(config.topics[0]);
  }, [subjectKey]);

  const handleSubjectChange = (key) => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (activeTimerRef.current) clearInterval(activeTimerRef.current);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    
    setSearchParams({ subject: key });
    setPhase("setup");
    setError("");
  };

  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState("");
  const [answers, setAnswers] = useState([]);
  const [phase, setPhase] = useState("setup");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(getTimeLimit(difficulty));
  const [startedAt, setStartedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const current = questions[step];

  const results = useMemo(() => {
    const correct = answers.filter((answer) => answer.isCorrect).length;
    const total = questions.length || 0;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const weakAreas = answers
      .filter((answer) => !answer.isCorrect)
      .map((answer) => answer.topic)
      .filter(Boolean);
    const timeSpent = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
    
    let xpEarned = answers.reduce((sum, answer) => sum + (answer.isCorrect ? answer.xpReward : 0), 0);
    if (accuracy === 100 && total > 0) xpEarned += 250;
    else if (accuracy >= 80 && total > 0) xpEarned += 100;
    if (difficulty === "JEE Advanced" && total > 0) xpEarned += 150;

    return {
      correct,
      total,
      accuracy,
      weakAreas: [...new Set(weakAreas)],
      timeSpent,
      xpEarned,
      strongestTopic: accuracy >= 70 && total > 0 ? topic : "Needs revision",
      weakestTopic: weakAreas[0] || "None detected",
      averageResponseTime: answers.length ? Math.round(answers.reduce((sum, answer) => sum + answer.responseTime, 0) / answers.length) : 0,
    };
  }, [answers, questions.length, startedAt, topic, difficulty]);

  const countdownIntervalRef = useRef(null);
  const activeTimerRef = useRef(null);
  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (activeTimerRef.current) clearInterval(activeTimerRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  const startQuiz = async () => {
    setLoading(true);
    setError("");

    try {
      const generated = await generateQuizWithGroq({ 
        topic, 
        difficulty, 
        questionType, 
        subject: subjectKey 
      });
      setQuestions(generated);
      setAnswers([]);
      setSelected("");
      setStep(0);
      setCountdown(3);
      setPhase("countdown");

      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = window.setInterval(() => {
        setCountdown((value) => {
          if (value <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            setStartedAt(Date.now());
            setTimeLeft(getTimeLimit(difficulty));
            setPhase("active");
            return 0;
          }
          return value - 1;
        });
      }, 700);
    } catch (quizError) {
      setError(quizError.message);
      setPhase("setup");
    } finally {
      setLoading(false);
    }
  };

  const finishQuiz = async (finalAnswers = answers) => {
    setPhase("results");
    if (activeTimerRef.current) clearInterval(activeTimerRef.current);

    if (!currentUser || questions.length === 0) return;

    const correct = finalAnswers.filter((answer) => answer.isCorrect).length;
    const accuracy = Math.round((correct / questions.length) * 100);
    const weakAreas = [...new Set(finalAnswers.filter((answer) => !answer.isCorrect).map((answer) => answer.topic))];
    const timeSpent = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
    
    let xpEarned = finalAnswers.reduce((sum, answer) => sum + (answer.isCorrect ? answer.xpReward : 0), 0);
    if (accuracy === 100) xpEarned += 250;
    else if (accuracy >= 80) xpEarned += 100;
    if (difficulty === "JEE Advanced") xpEarned += 150;

    setSaving(true);
    try {
      await saveQuizAttempt(currentUser.uid, {
        subject: subjectKey,
        topic,
        difficulty,
        questionType,
        score: correct,
        totalQuestions: questions.length,
        accuracy,
        timeSpent,
        weakAreas,
        xpEarned,
        streakBonus: accuracy >= 70,
        currentXp: profile?.xp || 0,
        answers: finalAnswers,
        improvementTips:
          accuracy >= 80
            ? "Strong performance. Move to harder numericals and timed revision."
            : "Revise incorrect concepts, then retry with Easy or Medium difficulty.",
      });
      await refreshProfile();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const chooseOption = (option) => {
    if (selected || !current) return;

    const isCorrect = option === current.correctAnswer;
    const responseTime = getTimeLimit(difficulty) - timeLeft;
    const nextAnswers = [
      ...answers,
      {
        question: current.question,
        selected: option,
        correctAnswer: current.correctAnswer,
        explanation: current.explanation,
        isCorrect,
        topic: current.topic,
        difficulty: current.difficulty,
        xpReward: current.xpReward,
        responseTime,
      },
    ];

    setSelected(option);
    setAnswers(nextAnswers);

    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = window.setTimeout(() => {
      if (step === questions.length - 1) {
        finishQuiz(nextAnswers);
      } else {
        setStep((value) => value + 1);
        setSelected("");
        setTimeLeft(getTimeLimit(difficulty));
      }
    }, 1100);
  };

  useEffect(() => {
    if (phase !== "active" || selected) return undefined;

    if (activeTimerRef.current) clearInterval(activeTimerRef.current);
    activeTimerRef.current = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          if (activeTimerRef.current) clearInterval(activeTimerRef.current);
          chooseOption("__TIMEOUT__");
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => {
      if (activeTimerRef.current) clearInterval(activeTimerRef.current);
    };
  }, [phase, selected, step]);

  return (
    <>
      <PageHeader
        eyebrow={`${config.title} AI quiz arena`}
        title={`${config.title} Battle Ground`}
        description={`Groq-powered ${config.title} quizzes with timers, XP rewards, streak bonuses, Firestore persistence, and real performance analytics.`}
      />

      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-8">
        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm font-bold text-red-200">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="premium-surface rounded-3xl p-6 md:p-8"
            >
              {/* Subject Selection Tabs */}
              <div className="mb-8 flex flex-wrap gap-2 border-b border-white/10 pb-6">
                {Object.entries(subjectData).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => handleSubjectChange(key)}
                    className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition ${
                      subjectKey === key
                        ? `${data.bg} ${data.theme} ring-1 ring-current/30`
                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    <data.icon size={18} />
                    {data.title} Battle Ground
                  </button>
                ))}
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {[
                  ["Topic", config.topics, topic, setTopic],
                  ["Difficulty", difficulties, difficulty, setDifficulty],
                  ["Question Type", questionTypes, questionType, setQuestionType],
                ].map(([label, options, value, setter]) => (
                  <div key={label}>
                    <p className={`mb-3 text-xs font-black uppercase ${config.theme}`}>{label}</p>
                    <div className="grid gap-2">
                      {options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setter(option)}
                          className={`rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
                            value === option
                              ? `border-current/50 ${config.bg} ${config.theme} shadow-glow`
                              : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-current/40"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={startQuiz}
                disabled={loading}
                className="premium-button mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-amber-300 px-6 py-4 font-black text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="animate-spin" size={19} /> : <Zap size={19} />}
                Generate AI Quiz
              </button>
            </motion.div>
          )}

          {phase === "countdown" && (
            <motion.div key="countdown" className="premium-surface grid min-h-[420px] place-items-center rounded-3xl p-8 text-center">
              <p className="text-sm font-black uppercase text-electric">Quiz begins in</p>
              <motion.p key={countdown} initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="mt-4 text-8xl font-black text-primary">
                {countdown}
              </motion.p>
            </motion.div>
          )}

          {phase === "active" && current && (
            <motion.div key="active" className="premium-surface rounded-3xl p-5 md:p-8">
              <div className="mb-6 grid gap-3 md:grid-cols-4">
                {[
                  ["Question", `${step + 1}/${questions.length}`, Target],
                  ["Timer", `${timeLeft}s`, Clock],
                  ["XP Pool", current.xpReward, Trophy],
                  ["Streak", "Live", Flame],
                ].map(([label, value, Icon]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <Icon className="text-electric" size={19} />
                    <p className="mt-2 text-xs font-black uppercase text-slate-400">{label}</p>
                    <p className="text-xl font-black text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mb-7 h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-electric shadow-glow" animate={{ width: `${(timeLeft / getTimeLimit(difficulty)) * 100}%` }} />
              </div>

              <p className="text-sm font-black uppercase text-electric">{current.topic} · {current.difficulty}</p>
              <h2 className="mt-4 text-2xl font-black leading-snug text-white md:text-4xl">{current.question}</h2>
              <div className="mt-8 grid gap-3 md:grid-cols-2">
                {current.options.map((option) => {
                  const isCorrect = selected && option === current.correctAnswer;
                  const isWrong = selected === option && option !== current.correctAnswer;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => chooseOption(option)}
                      disabled={Boolean(selected)}
                      className={`rounded-2xl border p-5 text-left text-lg font-bold transition ${
                        isCorrect
                          ? "border-emerald-400 bg-emerald-400/15 text-emerald-200"
                          : isWrong
                            ? "border-red-400 bg-red-400/15 text-red-200"
                            : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-electric hover:bg-electric/10 hover:text-electric"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {selected && (
                <div className="mt-5 rounded-2xl border border-electric/20 bg-electric/10 p-4 text-sm leading-6 text-slate-200">
                  <span className="font-black text-electric">Explanation:</span> {current.explanation}
                </div>
              )}
            </motion.div>
          )}

          {phase === "results" && (
            <motion.div key="results" className="premium-surface rounded-3xl p-6 md:p-8">
              <div className="text-center">
                <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-primary/15 text-primary shadow-[0_0_44px_rgba(255,217,61,0.35)]">
                  <Trophy size={46} />
                </div>
                <h2 className="mt-7 text-4xl font-black text-white">Quiz analytics synced</h2>
                <p className="mt-3 text-slate-300">
                  {saving ? "Saving your attempt to Firestore..." : currentUser ? "Progress saved to your student profile." : "Login to save XP and streak progress."}
                </p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-4">
                {[
                  ["Score", `${results.correct}/${results.total}`, CheckCircle2],
                  ["Accuracy", `${results.accuracy}%`, BarChart3],
                  ["XP Earned", results.xpEarned, Zap],
                  ["Avg Time", `${results.averageResponseTime}s`, Clock],
                ].map(([label, value, Icon]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <Icon className="text-electric" size={22} />
                    <p className="mt-4 text-sm font-bold text-slate-400">{label}</p>
                    <p className="text-3xl font-black text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-electric/20 bg-electric/10 p-5">
                  <p className="text-sm font-black uppercase text-electric">Strongest topic</p>
                  <p className="mt-2 text-2xl font-black text-white">{results.strongestTopic}</p>
                </div>
                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5">
                  <p className="text-sm font-black uppercase text-primary">Improvement focus</p>
                  <p className="mt-2 text-2xl font-black text-white">{results.weakestTopic}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm font-black uppercase text-electric">AI improvement tip</p>
                <p className="mt-2 leading-7 text-slate-200">
                  {results.accuracy >= 80
                    ? "Excellent control. Move to harder numericals and reduce response time."
                    : "Revise the weak topic, then retry with a lower difficulty before attempting timed hard questions."}
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setPhase("setup")}
                  className="premium-button flex-1 rounded-2xl bg-gradient-to-br from-primary to-amber-300 px-6 py-4 font-black text-slate-950 transition hover:-translate-y-0.5"
                >
                  Generate Another Quiz
                </button>
                <Link
                  to="/dashboard"
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-black text-white transition hover:bg-white/10 hover:border-white/20 active:scale-95"
                >
                  <LayoutDashboard size={19} />
                  Check Your XP
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}

export default Quiz;
