import { motion } from "framer-motion";
import { Award, BarChart3, BookOpenCheck, Brain, Crown, Flame, Target, Zap } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHeader from "../components/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import {
  getRankFromXp,
  getRevisionHistory,
  subscribeToChatHistory,
  subscribeToQuizAttempts,
} from "../services/firestore";

function ChartShell({ title, children }) {
  return (
    <div className="premium-surface rounded-3xl p-6">
      <h2 className="text-2xl font-black text-white">{title}</h2>
      <div className="mt-6 h-72">{children}</div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm font-bold text-slate-400">
      {text}
    </div>
  );
}

function Dashboard() {
  const { currentUser, profile, refreshProfile } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [revisionHistory, setRevisionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isInitialMount = useRef(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!currentUser?.uid) return;
      
      // Only show skeleton loading on truly the first mount with no profile
      if (isInitialMount.current && !profile) {
        setLoading(true);
      }
      setError("");

      try {
        const [revisionData] = await Promise.all([
          getRevisionHistory(currentUser.uid),
          refreshProfile(),
        ]);
        setRevisionHistory(revisionData);
      } catch (dashboardError) {
        setError(dashboardError.message);
      } finally {
        setLoading(false);
        isInitialMount.current = false;
      }
    };

    loadDashboard();
  }, [currentUser?.uid, refreshProfile]);

  useEffect(() => {
    if (!currentUser?.uid) return undefined;

    const unsubscribeAttempts = subscribeToQuizAttempts(currentUser.uid, setAttempts);
    const unsubscribeChat = subscribeToChatHistory(currentUser.uid, setChatHistory);

    return () => {
      unsubscribeAttempts();
      unsubscribeChat();
    };
  }, [currentUser?.uid]);

  const analytics = useMemo(() => {
    const totalQuizzes = attempts.length;
    const avgAccuracy = totalQuizzes
      ? Math.round(attempts.reduce((sum, item) => sum + (item.accuracy || 0), 0) / totalQuizzes)
      : profile?.mastery || 0;
    const weeklyXp = [...attempts]
      .slice(0, 7)
      .reverse()
      .map((item, index) => ({
        day: `S${index + 1}`,
        xp: item.xpEarned || 0,
        accuracy: item.accuracy || 0,
      }));
    const topicMap = attempts.reduce((map, item) => {
      const key = item.topic || "General";
      const current = map[key] || { topic: key, total: 0, count: 0 };
      return {
        ...map,
        [key]: {
          topic: key,
          total: current.total + (item.accuracy || 0),
          count: current.count + 1,
        },
      };
    }, {});
    const masteryBars = Object.values(topicMap).map((item) => ({
      topic: item.topic,
      mastery: Math.round(item.total / item.count),
    }));
    const weakTopics = profile?.weakTopics?.length ? profile.weakTopics : attempts.flatMap((item) => item.weakAreas || []);

    return {
      totalQuizzes,
      avgAccuracy,
      weeklyXp,
      masteryBars,
      weakTopics: [...new Set(weakTopics)].slice(0, 4),
      rank: profile?.rank || getRankFromXp(profile?.xp || 0),
    };
  }, [attempts, profile]);

  const stats = [
    { label: "Total XP", value: profile?.xp || 0, icon: Zap },
    { label: "Rank", value: analytics.rank, icon: Crown },
    { label: "Quizzes", value: analytics.totalQuizzes, icon: BookOpenCheck },
    { label: "Accuracy", value: `${analytics.avgAccuracy}%`, icon: Target },
  ];

  const achievements = [
    profile?.xp >= 500 && "First 500 XP",
    (profile?.streak || 0) >= 3 && "3 Day Streak",
    analytics.totalQuizzes >= 5 && "Quiz Grinder",
    chatHistory.length >= 10 && "AI Doubt Solver",
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        eyebrow="Student dashboard"
        title="Your real learning cockpit."
        description="Firestore-powered XP, quiz history, streaks, topic mastery, AI usage, revision activity, and recommendations."
      />

      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm font-bold text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="premium-surface h-32 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={stat.label} whileHover={{ y: -4 }} className="premium-surface rounded-2xl p-6">
                    <Icon className="text-electric" size={24} />
                    <p className="mt-5 text-sm font-bold text-slate-400">{stat.label}</p>
                    <p className="mt-1 text-3xl font-black text-white">{stat.value}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <ChartShell title="Weekly XP Graph">
                {analytics.weeklyXp.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.weeklyXp}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="day" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(0,245,255,0.25)", borderRadius: 16 }} />
                      <Bar dataKey="xp" fill="#00F5FF" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="Complete a Groq-generated quiz to unlock XP analytics." />
                )}
              </ChartShell>

              <ChartShell title="Quiz Accuracy Trend">
                {analytics.weeklyXp.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.weeklyXp}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="day" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(0,245,255,0.25)", borderRadius: 16 }} />
                      <Line type="monotone" dataKey="accuracy" stroke="#FFD93D" strokeWidth={3} dot={{ fill: "#FFD93D" }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="Accuracy trend appears after your first saved quiz attempt." />
                )}
              </ChartShell>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="premium-surface rounded-3xl p-6">
                <div className="mb-6 flex items-center gap-2">
                  <BarChart3 className="text-primary" />
                  <h2 className="text-2xl font-black text-white">Topic Mastery</h2>
                </div>
                <div className="grid gap-4">
                  {analytics.masteryBars.length ? (
                    analytics.masteryBars.map((item) => (
                      <div key={item.topic}>
                        <div className="flex justify-between text-sm font-black">
                          <span>{item.topic}</span>
                          <span className="text-electric">{item.mastery}%</span>
                        </div>
                        <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.mastery}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-electric to-primary"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState text="Topic mastery will build from your saved quiz history." />
                  )}
                </div>
              </div>

              <div className="premium-surface rounded-3xl p-6">
                <div className="mb-6 flex items-center gap-2">
                  <Brain className="text-electric" />
                  <h2 className="text-2xl font-black text-white">AI Recommendations</h2>
                </div>
                <div className="grid gap-3">
                  {(analytics.weakTopics.length ? analytics.weakTopics : ["Take your first quiz"]).map((topic) => (
                    <div key={topic} className="rounded-2xl border border-electric/20 bg-electric/10 p-4">
                      <p className="font-black text-electric">{topic}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        Revise this area, ask Volt Sensei for a summary, then run a medium quiz.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <div className="premium-surface rounded-3xl p-6">
                <Flame className="text-primary" />
                <p className="mt-4 text-sm font-bold text-slate-400">Study streak</p>
                <p className="text-3xl font-black text-white">{profile?.streak || 0} days</p>
              </div>
              <div className="premium-surface rounded-3xl p-6">
                <BookOpenCheck className="text-electric" />
                <p className="mt-4 text-sm font-bold text-slate-400">AI chat usage</p>
                <p className="text-3xl font-black text-white">{chatHistory.length} messages</p>
              </div>
              <div className="premium-surface rounded-3xl p-6">
                <Award className="text-primary" />
                <p className="mt-4 text-sm font-bold text-slate-400">Revision activity</p>
                <p className="text-3xl font-black text-white">{revisionHistory.length} sessions</p>
              </div>
            </div>

            <div className="premium-surface mt-5 rounded-3xl p-6">
              <h2 className="text-2xl font-black text-white">Recent Achievements</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-4">
                {achievements.length ? (
                  achievements.map((achievement) => (
                    <div key={achievement} className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                      <Award className="text-primary" size={20} />
                      <p className="mt-3 font-black text-white">{achievement}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState text="Achievements unlock as you complete quizzes and use the AI classroom." />
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}

export default Dashboard;
