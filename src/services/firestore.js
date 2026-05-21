import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";

export const rankTitles = [
  { min: 0, title: "Spark Student" },
  { min: 800, title: "Circuit Warrior" },
  { min: 2200, title: "Volt Master" },
  { min: 5000, title: "Physics Sensei" },
];

export function getLevelFromXp(xp = 0) {
  return Math.max(1, Math.floor(xp / 500) + 1);
}

export function getRankFromXp(xp = 0) {
  return rankTitles.reduce((rank, current) => (xp >= current.min ? current.title : rank), rankTitles[0].title);
}

export async function createUserProfile(user, name = "") {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) return;

  await setDoc(userRef, {
    uid: user.uid,
    name: name || user.displayName || "Volt Student",
    email: user.email,
    createdAt: serverTimestamp(),
    xp: 0,
    streak: 1,
    level: 1,
    rank: "Spark Student",
    completedQuizzes: 0,
    weakTopics: [],
    studyTime: 0,
    mastery: 0,
    roadmapProgress: {
      chargeCurrent: 20,
      ohmsLaw: 10,
      circuits: 0,
      magnetism: 0,
    },
  });
}

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function saveChatMessage(uid, message, subject, sessionId) {
  if (!uid || !sessionId) return;

  const msgId = message.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const msgRef = doc(db, "chatMessages", msgId);

  await setDoc(msgRef, {
    uid,
    sessionId,
    subject,
    role: message.role,
    text: message.text,
    timestamp: message.timestamp || "",
    createdAt: serverTimestamp(),
  });

  // Update session's last updated time and snippet
  const sessionRef = doc(db, "chatSessions", sessionId);
  await updateDoc(sessionRef, {
    updatedAt: serverTimestamp(),
    lastMessage: message.text.substring(0, 60),
  });

  await updateDoc(doc(db, "users", uid), {
    studyTime: increment(1),
  });
}

export async function createChatSession(uid, subject, title = "New Chat") {
  if (!uid) return null;

  const sessionRef = await addDoc(collection(db, "chatSessions"), {
    uid,
    subject,
    title,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: "",
  });

  return sessionRef.id;
}

export async function getChatSessions(uid, subject) {
  if (!uid) return [];

  const sessionsQuery = query(
    collection(db, "chatSessions"),
    where("uid", "==", uid),
    where("subject", "==", subject),
  );
  const snapshot = await getDocs(sessionsQuery);

  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
}

export async function deleteChatSession(sessionId) {
  // In a real app, we'd delete messages too, but for now we'll just delete the session
  // or use a cloud function to clean up.
  await setDoc(doc(db, "chatSessions", sessionId), { deleted: true }, { merge: true });
}

export async function getChatHistory(sessionId, maxItems = 50) {
  if (!sessionId) return [];

  const chatQuery = query(
    collection(db, "chatMessages"),
    where("sessionId", "==", sessionId),
    limit(maxItems),
  );
  const snapshot = await getDocs(chatQuery);

  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
}

export async function saveRevision(uid, title, content) {
  if (!uid) return;

  await addDoc(collection(db, "revisionHistory"), {
    uid,
    title,
    content,
    createdAt: serverTimestamp(),
  });
}

export async function saveQuizAttempt(uid, attempt) {
  if (!uid) return;

  await addDoc(collection(db, "quizAttempts"), {
    uid,
    ...attempt,
    createdAt: serverTimestamp(),
  });

  // New XP Algorithm:
  // Quiz completed: +25 XP
  // High accuracy >80%: +50 XP bonus
  // JEE Advanced quiz: +75 XP
  // Topic mastered (>90% accuracy in advanced mode): +100 XP
  
  let xp = 25; // Base quiz completed
  if (attempt.accuracy >= 80) xp += 50;
  if (attempt.difficulty === "JEE Advanced") xp += 75;
  if (attempt.accuracy >= 90 && attempt.difficulty === "JEE Advanced") xp += 100;

  // Add study session XP: +5 XP every 5 mins (approx 1 XP per minute)
  const timeSpentMins = Math.round((attempt.timeSpent || 0) / 60);
  xp += Math.floor(timeSpentMins / 5) * 5;

  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);
  const userData = snapshot.exists() ? snapshot.data() : {};
  
  const currentTotalXp = (userData.xp || 0) + xp;
  const newLevel = Math.max(1, Math.floor(currentTotalXp / 500) + 1);
  const currentStudyTime = (userData.studyTime || 0) + timeSpentMins;

  // Streak rule: DO NOT increase streak unless: User studies total 1 hour (60 mins) on that day
  // For simplicity, we just add streak if they hit a threshold of daily study time if we track daily.
  // We will increment streak if they hit 60 total study mins in this session/day logic. 
  // Let's implement a simplified daily 60min rule.
  
  let newStreak = userData.streak || 1;
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const lastActiveDate = userData.lastActiveDate || "";
  
  // Calculate yesterday's date string
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split("T")[0];

  const dailyStudyTime = lastActiveDate === today ? (userData.dailyStudyTime || 0) + timeSpentMins : timeSpentMins;
  const previousDailyStudyTime = lastActiveDate === today ? (userData.dailyStudyTime || 0) : 0;

  // Streak Logic:
  // 1. If last active was yesterday, and we just hit 60 mins today -> increment
  // 2. If last active was today, and we just hit 60 mins (was below 60 before) -> increment
  // 3. If last active was more than 1 day ago -> reset to 1 (or 0 if not studied 60m yet)
  
  if (lastActiveDate === yesterday) {
    if (previousDailyStudyTime < 60 && dailyStudyTime >= 60) {
      newStreak += 1;
    }
  } else if (lastActiveDate === today) {
    if (previousDailyStudyTime < 60 && dailyStudyTime >= 60) {
      newStreak += 1;
    }
  } else if (lastActiveDate !== "" && lastActiveDate !== yesterday && lastActiveDate !== today) {
    newStreak = dailyStudyTime >= 60 ? 1 : 0;
  }

  const roadmapKey = {
    "Mechanics": "mechanics",
    "Electromagnetism": "magnetism",
    "Algebra": "algebra",
    "Calculus": "calculus",
    "Organic Chemistry": "organic",
  }[attempt.topic] || attempt.topic.toLowerCase().replace(/[^a-z0-9]/g, "");

  await updateDoc(userRef, {
    xp: currentTotalXp,
    level: newLevel,
    rank: getRankFromXp(currentTotalXp),
    streak: newStreak,
    lastActiveDate: today,
    dailyStudyTime: dailyStudyTime,
    completedQuizzes: increment(1),
    mastery: attempt.accuracy,
    weakTopics: attempt.weakAreas || [],
    studyTime: currentStudyTime,
    [`roadmapProgress.${roadmapKey}`]: Math.min(100, Math.max(20, attempt.accuracy || 0)),
  });
}

export async function getQuizAttempts(uid, maxItems = 30) {
  if (!uid) return [];

  const attemptsQuery = query(
    collection(db, "quizAttempts"),
    where("uid", "==", uid),
    limit(maxItems),
  );
  const snapshot = await getDocs(attemptsQuery);

  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export function subscribeToQuizAttempts(uid, callback, maxItems = 30) {
  if (!uid) return () => {};

  const attemptsQuery = query(
    collection(db, "quizAttempts"),
    where("uid", "==", uid),
    limit(maxItems),
  );

  return onSnapshot(attemptsQuery, (snapshot) => {
    callback(
      snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)),
    );
  });
}

export function subscribeToChatHistory(uid, callback, maxItems = 12) {
  if (!uid) return () => {};

  const chatQuery = query(
    collection(db, "chatMessages"),
    where("uid", "==", uid),
    limit(maxItems),
  );

  return onSnapshot(chatQuery, (snapshot) => {
    callback(
      snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)),
    );
  });
}

export function subscribeToChatSessions(uid, subject, callback) {
  if (!uid) return () => {};

  const sessionsQuery = query(
    collection(db, "chatSessions"),
    where("uid", "==", uid),
    where("subject", "==", subject),
  );

  return onSnapshot(sessionsQuery, (snapshot) => {
    callback(
      snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter(s => !s.deleted)
        .sort((a, b) => {
          const timeA = a.updatedAt?.seconds || Date.now() / 1000;
          const timeB = b.updatedAt?.seconds || Date.now() / 1000;
          return timeB - timeA;
        }),
    );
  });
}

export function subscribeToSessionMessages(sessionId, callback) {
  if (!sessionId) return () => {};

  const messagesQuery = query(
    collection(db, "chatMessages"),
    where("sessionId", "==", sessionId),
  );

  return onSnapshot(messagesQuery, (snapshot) => {
    callback(
      snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .sort((a, b) => {
          const timeA = a.createdAt?.seconds || Date.now() / 1000;
          const timeB = b.createdAt?.seconds || Date.now() / 1000;
          return timeA - timeB;
        }),
    );
  });
}

export async function getRevisionHistory(uid, maxItems = 10) {
  if (!uid) return [];

  const revisionQuery = query(
    collection(db, "revisionHistory"),
    where("uid", "==", uid),
    limit(maxItems),
  );
  const snapshot = await getDocs(revisionQuery);

  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

// --- Custom User Library (Formulae & Models) ---

export async function saveCustomFormula(uid, formula, subject) {
  if (!uid) return { success: false, message: "User not logged in" };
  
  try {
    // Check if formula with same name already exists for this user
    const formulaeQuery = query(
      collection(db, "customFormulae"),
      where("uid", "==", uid),
      where("name", "==", formula.name)
    );
    const snapshot = await getDocs(formulaeQuery);
    
    if (!snapshot.empty) {
      return { success: false, message: "Already saved" };
    }

    await addDoc(collection(db, "customFormulae"), {
      uid,
      subject,
      ...formula,
      isAi: true,
      createdAt: serverTimestamp(),
    });
    return { success: true, message: "Saved to your library" };
  } catch (err) {
    console.error("Error saving formula:", err);
    return { success: false, message: "Failed to save" };
  }
}

export async function getCustomFormulae(uid, subject) {
  if (!uid) return [];
  const formulaeQuery = query(
    collection(db, "customFormulae"),
    where("uid", "==", uid),
    where("subject", "==", subject),
  );
  const snapshot = await getDocs(formulaeQuery);
  return snapshot.docs
    .map(item => ({ id: item.id, ...item.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export async function saveCustomModel(uid, model, subject) {
  if (!uid) return;
  // Note: We don't save the React component, just the metadata
  const { Component, ...metadata } = model;
  await addDoc(collection(db, "customModels"), {
    uid,
    subject,
    ...metadata,
    isAi: true,
    createdAt: serverTimestamp(),
  });
}

export async function getCustomModels(uid, subject) {
  if (!uid) return [];
  const modelsQuery = query(
    collection(db, "customModels"),
    where("uid", "==", uid),
    where("subject", "==", subject),
  );
  const snapshot = await getDocs(modelsQuery);
  return snapshot.docs
    .map(item => ({ id: item.id, ...item.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}
