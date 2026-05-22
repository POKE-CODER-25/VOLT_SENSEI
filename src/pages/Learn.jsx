import { AnimatePresence, motion } from "framer-motion";
import {
  Bot, Check, Clipboard, Copy, Eye, Loader2, Maximize, Minimize, Plus, Send,
  Sparkles, Trash2, UserRound, X, Search, MessageSquare, Calculator, Cpu, Atom, ChevronRight, Menu
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, memo, useCallback } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  subscribeToChatSessions,
  subscribeToSessionMessages,
  createChatSession,
  saveChatMessage,
  deleteChatSession
} from "../services/firestore";
import { streamVoltSensei } from "../services/groq";
import { intelligentSearch } from "../services/search";

const subjectData = {
  physics: {
    icon: Cpu,
    title: "Physics Sensei",
    theme: "text-electric",
    bg: "bg-electric/10",
    border: "border-electric/30",
    shadow: "shadow-[0_0_18px_rgba(0,245,255,0.18)]",
    gradient: "from-blue-500/20 via-electric/5 to-transparent",
    accent: "bg-electric",
    Visuals: () => (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <motion.div
          animate={{ x: ["0%", "100%", "0%"], y: ["0%", "100%", "0%"] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute h-1 w-1 rounded-full bg-electric shadow-glow"
        />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 50 Q 25 10 50 50 T 100 50" fill="transparent" stroke="currentColor" className="text-electric" strokeWidth="0.2" strokeDasharray="2,2" />
        </svg>
      </div>
    ),
  },
  maths: {
    icon: Calculator,
    title: "Maths Sensei",
    theme: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    shadow: "shadow-[0_0_18px_rgba(168,85,247,0.18)]",
    gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
    accent: "bg-purple-500",
    Visuals: () => (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path
            d="M0,50 Q25,10 50,50 T100,50"
            fill="none"
            stroke="#a855f7"
            strokeWidth="0.5"
            animate={{ pathLength: [0, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>
    ),
  },
  chemistry: {
    icon: Atom,
    title: "Chemistry Sensei",
    theme: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    shadow: "shadow-[0_0_18px_rgba(16,185,129,0.18)]",
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    accent: "bg-emerald-500",
    Visuals: () => (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-48 h-48 border border-emerald-500/30 rounded-full flex items-center justify-center"
        >
          <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-glow" />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 w-2 h-2 rounded-full bg-emerald-400"
          />
        </motion.div>
      </div>
    ),
  }
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function createMessage(role, text, extra = {}) {
  return {
    id: makeId(),
    role,
    text,
    timestamp: getCurrentTime(),
    isStreaming: false,
    ...extra,
  };
}

const renderInlineMarkdown = (text) => {
  const pieces = text.split(/(\*\*[^*]+\*\*|\$[^$]+\$)/g);
  return pieces.map((piece, index) => {
    if (piece.startsWith("**") && piece.endsWith("**")) {
      return <strong key={index} className="font-black text-white">{piece.slice(2, -2)}</strong>;
    }
    if (piece.startsWith("$") && piece.endsWith("$")) {
      return (
        <span key={index} className="mx-1 rounded border border-current/25 bg-current/10 px-1.5 py-0.5 font-mono text-[0.85em] inline-block max-w-full break-words overflow-wrap-anywhere leading-tight align-middle">
          {piece.slice(1, -1)}
        </span>
      );
    }
    return piece;
  });
};

const MarkdownMessage = memo(({ text }) => {
  return (
    <div className="space-y-3 max-w-full overflow-hidden break-words whitespace-pre-wrap">
      {text.split("\n").filter(Boolean).map((line, i) => {
        const listMatch = line.trim().match(/^([-*]|\d+\.)\s+(.*)$/);
        if (listMatch) {
          return (
            <div key={i} className="flex gap-2 ml-2 md:ml-4 min-w-0 items-start">
              <span className="text-current opacity-40 shrink-0 mt-1.5">•</span>
              <div className="min-w-0 flex-1 break-words">{renderInlineMarkdown(listMatch[2])}</div>
            </div>
          );
        }
        return <p key={i} className="break-words leading-relaxed">{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
});

function Learn() {
  const [searchParams] = useSearchParams();
  const subjectKey = searchParams.get("subject") || "physics";
  const config = subjectData[subjectKey] || subjectData.physics;

  const { currentUser } = useAuth();
  const { isFullscreen, setIsFullscreen } = useOutletContext();
  
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const currentSessionIdRef = useRef(null);

  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);

  // Reset session when subject changes
  useEffect(() => {
    setCurrentSessionId(null);
    setMessages([createMessage("ai", `Welcome to ${subjectData[subjectKey]?.title || "Sensei"}. How can I help you today?`)]);
    setIsSidebarOpen(false);
  }, [subjectKey]);

  // Subscribe to sessions
  useEffect(() => {
    if (!currentUser) return;
    let isInitialLoad = true;
    
    const unsubscribe = subscribeToChatSessions(currentUser.uid, subjectKey, async (data) => {
      setSessions(data);
      
      const sid = currentSessionIdRef.current;
      
      if (data.length > 0 && (!sid || isInitialLoad)) {
        const sessionExists = data.some(s => s.id === sid);
        if (!sid || !sessionExists) {
          setCurrentSessionId(data[0].id);
        }
      } else if (data.length === 0 && isInitialLoad) {
        const newId = await createChatSession(currentUser.uid, subjectKey);
        setCurrentSessionId(newId);
      }
      isInitialLoad = false;
    });
    return () => unsubscribe();
  }, [currentUser, subjectKey]);

  // Subscribe to messages
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([createMessage("ai", `Welcome to ${config.title}. How can I help you today?`)]);
      return;
    }

    // Immediately clear messages from previous session to avoid "ghosting"
    setMessages([]);

    const unsubscribe = subscribeToSessionMessages(currentSessionId, (data) => {
      setMessages(prev => {
        const dataIds = new Set(data.map(m => m.id));
        // Keep local messages that are streaming OR haven't been saved to Firestore yet
        // ONLY if they belong to the current session (though usually they do)
        const localOnly = prev.filter(m => (m.isStreaming || m.id.includes('-')) && !dataIds.has(m.id));
        
        const merged = [...data, ...localOnly];
        if (merged.length === 0) {
          return [createMessage("ai", `Welcome to ${config.title}. How can I help you today?`)];
        }
        return merged.sort((a, b) => {
          const timeA = a.createdAt?.seconds || (a.timestamp ? 0 : Date.now() / 1000);
          const timeB = b.createdAt?.seconds || (b.timestamp ? 0 : Date.now() / 1000);
          return timeA - timeB;
        });
      });
    });
    return () => unsubscribe();
  }, [currentSessionId, config.title]);

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isThinking]);

  const startNewChat = async () => {
    if (!currentUser) return;
    setMessages([]); // Clear locally immediately
    const newId = await createChatSession(currentUser.uid, subjectKey);
    setCurrentSessionId(newId);
  };

  const deleteSession = async (id, e) => {
    if (e) e.stopPropagation();
    await deleteChatSession(id);
    if (currentSessionId === id) {
      setCurrentSessionId(null);
    }
  };

  const sendMessage = async (eOrText) => {
    let text = typeof eOrText === 'string' ? eOrText : input;
    if (eOrText && eOrText.preventDefault) eOrText.preventDefault();
    
    text = text.trim();
    if (!text || isThinking) return;

    let sid = currentSessionId;
    if (!sid) {
      if (!currentUser) return;
      sid = await createChatSession(currentUser.uid, subjectKey);
      setCurrentSessionId(sid);
    }

    const studentMessage = createMessage("student", text);
    const aiMessage = createMessage("ai", "", { isStreaming: true });
    
    setMessages(prev => [...prev, studentMessage, aiMessage]);
    setInput("");
    setIsThinking(true);

    try {
      if (currentUser) {
        await saveChatMessage(currentUser.uid, studentMessage, subjectKey, sid);
      }

      // Use the latest messages for context
      const chatContext = [...messages.filter(m => !m.isStreaming && m.role !== 'system'), studentMessage];
      const answer = await streamVoltSensei(chatContext, (partial) => {
        setMessages(curr => curr.map(m => m.id === aiMessage.id ? { ...m, text: partial } : m));
      }, subjectKey);

      const finalAiMsg = { ...aiMessage, text: answer, isStreaming: false, timestamp: getCurrentTime() };
      
      if (currentUser) {
        await saveChatMessage(currentUser.uid, finalAiMsg, subjectKey, sid);
      }
      
      setMessages(curr => curr.map(m => m.id === aiMessage.id ? finalAiMsg : m));
    } catch (err) {
      console.error(err);
      setMessages(curr => curr.map(m => m.id === aiMessage.id ? { ...m, text: `Error: ${err.message}`, isStreaming: false } : m));
    } finally {
      setIsThinking(false);
    }
  };

  const { items: filteredSessions, topConfidence, bestMatch } = useMemo(() => {
    return intelligentSearch(sessions, searchQuery, ['title', 'lastMessage']);
  }, [sessions, searchQuery]);

  // Auto-select session if confidence is high and user is likely targeting this specific chat
  useEffect(() => {
    if (searchQuery.length > 3 && topConfidence > 0.85 && bestMatch && bestMatch.id !== currentSessionId) {
      setCurrentSessionId(bestMatch.id);
    }
  }, [searchQuery, topConfidence, bestMatch, currentSessionId]);

  const copyToClipboard = async (msg) => {
    await navigator.clipboard.writeText(msg.text);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  return (
    <div className={`flex bg-slate-950 text-white overflow-hidden ${isFullscreen ? "fixed inset-0 z-[100]" : "absolute inset-0 top-[0px]"}`}>
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-[80%] max-w-72 border-r border-white/10 flex flex-col bg-slate-900/95 backdrop-blur-xl shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-10 lg:w-80 lg:bg-slate-900/50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <button
            onClick={startNewChat}
            disabled={isThinking}
            className={`flex-1 py-3 px-4 rounded-xl border border-dashed ${config.border} flex items-center gap-2 font-black transition hover:bg-white/5 disabled:opacity-50 text-xs md:text-sm`}
          >
            <Plus size={18} /> New Chat
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 ml-2 text-slate-400 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 relative">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-current/30 text-xs"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          <div className="px-3 py-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">Chat History</div>
          {filteredSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => {
                if (!isThinking) {
                  setCurrentSessionId(session.id);
                  setIsSidebarOpen(false);
                }
              }}
              disabled={isThinking}
              className={`w-full group p-3 rounded-xl flex items-center gap-3 transition ${
                currentSessionId === session.id ? "bg-white/10 ring-1 ring-white/20" : "hover:bg-white/5"
              } ${isThinking ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${currentSessionId === session.id ? config.bg : "bg-white/5"}`}>
                <MessageSquare size={14} className={currentSessionId === session.id ? config.theme : "text-slate-400"} />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="text-xs font-bold truncate">{session.title}</div>
                <div className="text-[10px] text-slate-500 truncate">{session.lastMessage || "No messages yet"}</div>
              </div>
              <button
                onClick={(e) => deleteSession(session.id, e)}
                disabled={isThinking}
                className="opacity-0 lg:group-hover:opacity-100 p-1 hover:text-rose-500 transition disabled:hidden shrink-0"
              >
                <Trash2 size={12} />
              </button>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0 h-full overflow-hidden">
        <config.Visuals />
        
        {/* Top Bar */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-6 bg-slate-950/80 backdrop-blur-md z-20 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition text-slate-400 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <config.icon className={config.theme} size={20} />
            <h1 className="text-sm md:text-lg font-black truncate max-w-[150px] sm:max-w-none">{config.title}</h1>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg hover:bg-white/5 transition text-slate-400"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 custom-scrollbar pb-10 scroll-smooth z-10">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 md:gap-5 ${msg.role === "student" ? "flex-row-reverse" : "flex-row"} ${msg.isStreaming && !msg.text ? "hidden" : ""}`}
            >
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl shrink-0 flex items-center justify-center shadow-lg z-20 ${
                msg.role === "student" ? "bg-white/10" : `${config.bg} border ${config.border}`
              }`}>
                {msg.role === "student" ? <UserRound size={16} className="text-white md:w-5 md:h-5" /> : <config.icon className={`${config.theme} md:w-5 md:h-5`} size={16} />}
              </div>
              <div className={`max-w-[85%] sm:max-w-[80%] md:max-w-[70%] space-y-2 ${msg.role === "student" ? "items-end" : "items-start"} min-w-0 z-20`}>
                <div className={`p-4 md:p-5 rounded-2xl border text-[13px] md:text-[15px] leading-relaxed shadow-xl overflow-hidden break-words whitespace-pre-wrap ${
                  msg.role === "student" 
                    ? "bg-slate-900 border-white/10 rounded-tr-none text-white" 
                    : `bg-slate-900 border-white/10 rounded-tl-none text-slate-100 backdrop-blur-md`
                }`}>
                  <MarkdownMessage text={msg.text} />
                </div>
                <div className={`flex items-center gap-3 text-[9px] font-black uppercase tracking-tighter ${msg.role === "student" ? "justify-end" : ""}`}>
                  <span className="text-slate-500/80">{msg.timestamp}</span>
                  {msg.role === "ai" && !msg.isStreaming && (
                    <button onClick={() => copyToClipboard(msg)} className="hover:text-white transition text-slate-500">
                      {copiedId === msg.id ? "COPIED" : "COPY"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isThinking && (
            <div className="flex gap-3 md:gap-5 animate-pulse z-10">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl shrink-0 flex items-center justify-center ${config.bg} border ${config.border}`}>
                <Loader2 className={`animate-spin ${config.theme} md:w-5 md:h-5`} size={16} />
              </div>
              <div className="px-5 py-4 rounded-2xl border bg-slate-900 border-white/10 italic text-sm text-slate-500 shadow-lg backdrop-blur-md">
                Sensei is thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-40 md:h-48 pb-10" />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 inset-x-0 p-4 md:p-8 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pointer-events-none z-30">
          <div className="max-w-4xl mx-auto relative group pointer-events-auto">
            <div className="w-full relative">
              <div className={`absolute -inset-1 bg-gradient-to-r ${config.gradient} rounded-2xl md:rounded-3xl opacity-30 blur-lg group-focus-within:opacity-60 transition duration-700`} />
              <div className="relative flex bg-slate-900/90 border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden focus-within:border-white/20 transition backdrop-blur-xl shadow-2xl">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  disabled={isThinking}
                  placeholder={isThinking ? "Thinking..." : `Ask ${config.title}...`}
                  className="flex-1 bg-transparent px-6 md:px-8 py-4 md:py-6 outline-none text-sm md:text-base disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isThinking}
                  className={`px-6 md:px-10 flex items-center justify-center transition disabled:opacity-30 border-l border-white/5 hover:bg-white/5 ${config.theme}`}
                >
                  {isThinking ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-8 bg-slate-800" />
              <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">
                Volt Sensei • Groq Engine
              </p>
              <div className="h-px w-8 bg-slate-800" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Learn;
