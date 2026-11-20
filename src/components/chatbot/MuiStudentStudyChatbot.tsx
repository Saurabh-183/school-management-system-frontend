'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Fab,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Badge,
} from '@mui/material';
import {
  SmartToy as BotIcon,
  Close as CloseIcon,
  Send as SendIcon,
  History as HistoryIcon,
  AddComment as NewChatIcon,
  ArrowBack as BackIcon,
  School as AcademicIcon,
  Lightbulb as TipIcon,
  Delete as DeleteIcon,
  Psychology as BrainIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { User } from '@/lib/types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  subject?: string;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: ChatMessage[];
}

const STORAGE_KEY = 'mentora_student_ai_chats_v1';

// Subject-related preset questions
const SUBJECT_PRESETS = [
  {
    category: 'Computer Science',
    questions: [
      { label: '🌳 Binary Search Tree vs AVL Tree', query: 'Can you explain Binary Search Trees vs self-balancing AVL Trees with time complexities and rotation examples?' },
      { label: '⚡ Node.js Event Loop Microtasks', query: 'How does the Node.js Event Loop work with timers, I/O callbacks, and microtask queues like process.nextTick?' },
      { label: '📊 MongoDB Indexes & Aggregation', query: 'Explain the Compound Index ESR rule and how MongoDB Aggregation pipelines optimize performance.' },
    ],
  },
  {
    category: 'Mathematics & Calculus',
    questions: [
      { label: '📐 Quadratic Formula Derivation', query: 'How do you derive the Quadratic Formula and find roots of ax² + bx + c = 0 step by step?' },
      { label: '📈 Derivatives & Chain Rule', query: 'Explain the Chain Rule in differentiation with clear examples for composite functions.' },
    ],
  },
  {
    category: 'Physics & Science',
    questions: [
      { label: '🚀 Newton’s Laws with Examples', query: 'Can you explain Newton’s Three Laws of Motion with practical real-world engineering examples?' },
      { label: '⚛️ Heisenberg Uncertainty Principle', query: 'What is Heisenberg’s Uncertainty Principle in quantum physics and what does Δx * Δp ≥ ħ/2 mean?' },
    ],
  },
];

interface MuiStudentStudyChatbotProps {
  currentUser: User | null;
}

export function MuiStudentStudyChatbot({ currentUser }: MuiStudentStudyChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'history'>('chat');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Active Chat Session
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Saved Chat Sessions History
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ChatSession[] = JSON.parse(saved);
        setChatHistory(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (view === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, view]);

  // Start fresh chat on open if no active session
  const handleOpenBot = () => {
    setIsOpen(true);
    setView('chat');
    if (!currentSessionId || messages.length === 0) {
      startNewChat();
    }
  };

  const handleCloseBot = () => {
    // Save current session before closing if it has user messages
    saveCurrentSessionToHistory();
    setIsOpen(false);
    // User requested: when user creates new chat after closing chatbot, then again start from new chat
    startNewChat();
  };

  const startNewChat = () => {
    if (messages.length > 1) {
      saveCurrentSessionToHistory();
    }
    const newId = 'session_' + Date.now();
    setCurrentSessionId(newId);
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        sender: 'assistant',
        text: `Hello ${currentUser?.fullName || 'Student'}! 👋 I am your Mentora AI Academic Study Companion. Ask me any question in Computer Science, Math, Science, or click one of the subject presets below to get an instant breakdown!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setView('chat');
  };

  const saveCurrentSessionToHistory = () => {
    const userMsgs = messages.filter((m) => m.sender === 'user');
    if (userMsgs.length === 0) return;

    const firstQuestion = userMsgs[0].text;
    const title = firstQuestion.length > 35 ? firstQuestion.substring(0, 35) + '...' : firstQuestion;

    setChatHistory((prev) => {
      const filtered = prev.filter((s) => s.id !== currentSessionId);
      const updatedSession: ChatSession = {
        id: currentSessionId,
        title,
        timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        messages,
      };
      const newHistory = [updatedSession, ...filtered];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch {}
      return newHistory;
    });
  };

  const loadHistorySession = (session: ChatSession) => {
    saveCurrentSessionToHistory();
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setView('chat');
  };

  const deleteHistorySession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = chatHistory.filter((s) => s.id !== id);
    setChatHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    if (currentSessionId === id) {
      startNewChat();
    }
  };

  // Generate realistic academic step-by-step response
  const generateAcademicResponse = (question: string): string => {
    const qLower = question.toLowerCase();

    if (qLower.includes('tree') || qLower.includes('bst') || qLower.includes('avl')) {
      return `### 🌳 Binary Search Trees (BST) vs AVL Trees:

1. **Binary Search Tree (BST)**:
   - In a standard BST, for every node $X$:
     - Keys in the left subtree are strictly $< X$
     - Keys in the right subtree are strictly $> X$
   - **Worst-case Time Complexity**: $O(N)$ when skewed (e.g., inserting sorted array $1, 2, 3, 4$).

2. **AVL Tree (Self-Balancing)**:
   - Strictly enforces height balance: **Balance Factor** $\\text{BF} = \\text{height}(\\text{left}) - \\text{height}(\\text{right}) \\in \\{-1, 0, 1\\}$.
   - If $|\text{BF}| > 1$, balanced via **Rotations**:
     - **Left Rotation (LL)** or **Right Rotation (RR)** for single shifts.
     - **Left-Right (LR)** or **Right-Left (RL)** double rotations.
   - **Guaranteed Complexity**: Lookup, Insertion, and Deletion are strictly $O(\\log N)$.

💡 **Exam Tip**: An In-Order traversal of any valid BST or AVL tree always visits keys in ascending sorted order!`;
    }

    if (qLower.includes('event loop') || qLower.includes('node') || qLower.includes('microtask')) {
      return `### ⚡ Node.js Event Loop Architecture:

Node.js executes single-threaded JavaScript using **libuv** with the following phased event loop:

1. **Timers Phase**: Executes callbacks scheduled by \`setTimeout\` and \`setInterval\`.
2. **Pending I/O Callbacks**: Handles system-level errors (like TCP connect refusal).
3. **Poll Phase**: Retrieves new I/O events and executes their callbacks.
4. **Check Phase**: Executes callbacks registered by \`setImmediate()\`.
5. **Close Callbacks**: Handles socket closes (e.g. \`socket.on('close')\`).

🚀 **Microtask Queue Priority**:
- Microtasks execute **immediately between every phase** before the event loop advances!
- \`process.nextTick()\` queue runs *first*, followed by the **Promise resolution microtask queue**.`;
    }

    if (qLower.includes('quadratic') || qLower.includes('roots')) {
      return `### 📐 Quadratic Equation & Derivation:

For standard quadratic form:
$$ax^2 + bx + c = 0 \\quad (a \\neq 0)$$

1. **Quadratic Formula**:
   $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

2. **Discriminant Analysis ($D = b^2 - 4ac$)**:
   - $D > 0$: Two distinct real roots.
   - $D = 0$: Exactly one real repeated root ($x = -b / 2a$).
   - $D < 0$: Two complex conjugate roots ($x = -b/2a \\pm i\\sqrt{|D|}/2a$).`;
    }

    if (qLower.includes('newton') || qLower.includes('force') || qLower.includes('motion')) {
      return `### 🚀 Newton's Three Laws of Motion:

1. **First Law (Law of Inertia)**:
   - An object remains at rest or in uniform motion unless acted upon by an external net force.
   - *Example*: Passengers lurch forward when a bus suddenly brakes.

2. **Second Law ($F = ma$)**:
   - The rate of change of momentum is proportional to the applied net force: $F = \\frac{dp}{dt} = m \\cdot a$.
   - *Example*: Catching a cricket ball by pulling your hands back increases contact time, reducing impact force.

3. **Third Law (Action-Reaction)**:
   - For every action, there is an equal and opposite reaction ($F_{AB} = -F_{BA}$).
   - *Example*: Rocket propulsion exhausts high-speed gas backward, thrusting the spacecraft forward.`;
    }

    // Default intelligent tutoring response
    return `### 🎓 Academic Breakdown for: "${question}"

1. **Fundamental Principle**:
   - Understanding this topic requires breaking it down into state variables, underlying axioms, and boundary conditions.

2. **Key Concepts & Derivations**:
   - Verify assumptions before applying mathematical or algorithmic reductions.
   - In computational problems, identify space complexity $O(S)$ versus runtime complexity $O(T)$.

3. **Recommended Study Strategy**:
   - Review today's lecture notes in the **Mentora Learning Portal**.
   - Solve at least 3 practice problems to reinforce retention before your scheduled mentorship slot!

💡 *Would you like me to generate a 3-question practice quiz on this topic?*`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateAcademicResponse(text);
      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* 1. Floating Action Button in Bottom-Right Corner */}
      {!isOpen && (
        <Tooltip title="Mentora AI Study Companion • Instant Academic Doubt Solver" placement="left">
          <Fab
            color="primary"
            onClick={handleOpenBot}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1300,
              width: 58,
              height: 58,
              boxShadow: '0 8px 24px rgba(30, 41, 59, 0.35)',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.08)',
                boxShadow: '0 12px 28px rgba(30, 41, 59, 0.45)',
              },
            }}
          >
            <Badge
              variant="dot"
              color="success"
              overlap="circular"
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <BotIcon sx={{ fontSize: 30, color: '#ffffff' }} />
            </Badge>
          </Fab>
        </Tooltip>
      )}

      {/* 2. Chatbot Window (Small Right Screen Overlay) */}
      {isOpen && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            width: { xs: 'calc(100vw - 32px)', sm: 400 },
            height: 600,
            maxHeight: 'calc(100vh - 48px)',
            borderRadius: 3.5,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1400,
            border: '1px solid #cbd5e1',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
            bgcolor: '#ffffff',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 1.8,
              bgcolor: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Upper Left Corner: HISTORY ICON */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {view === 'history' ? (
                <Tooltip title="Back to Current Chat">
                  <IconButton size="small" onClick={() => setView('chat')} sx={{ color: '#ffffff' }}>
                    <BackIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="View Previous Chat History">
                  <IconButton size="small" onClick={() => setView('history')} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
                    <HistoryIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                  <BrainIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.1, color: '#ffffff' }}>
                    {view === 'history' ? 'Conversation History' : 'Mentora Study Bot'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.68rem' }}>
                    <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
                    Academic AI Ready
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right Header Actions: New Chat & Close */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title="Start New Conversation">
                <IconButton size="small" onClick={startNewChat} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
                  <NewChatIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={handleCloseBot} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* VIEW 1: CONVERSATION HISTORY */}
          {view === 'history' && (
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#f8fafc' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Saved Conversations ({chatHistory.length})
                </Typography>
                <Button size="small" variant="text" onClick={startNewChat} sx={{ fontSize: '0.72rem', textTransform: 'none', fontWeight: 700 }}>
                  + Start New Chat
                </Button>
              </Box>

              {chatHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                  <HistoryIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    No previous chats saved yet
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Your conversations will be preserved here automatically.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {chatHistory.map((session) => (
                    <ListItem
                      key={session.id}
                      disablePadding
                      sx={{
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: session.id === currentSessionId ? '#e0f2fe' : '#ffffff',
                        border: '1px solid',
                        borderColor: session.id === currentSessionId ? '#0284c7' : '#e2e8f0',
                        overflow: 'hidden',
                      }}
                    >
                      <ListItemButton onClick={() => loadHistorySession(session)} sx={{ py: 1.2, px: 1.5 }}>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                              {session.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {session.timestamp} • {session.messages.length} messages
                            </Typography>
                          }
                        />
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={(e) => deleteHistorySession(session.id, e)}
                          sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* VIEW 2: ACTIVE CHAT SCREEN */}
          {view === 'chat' && (
            <>
              {/* Message Feed */}
              <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#f8fafc' }}>
                {messages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '92%',
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.8,
                        borderRadius: 2.5,
                        bgcolor: msg.sender === 'user' ? 'primary.main' : '#ffffff',
                        color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: msg.sender === 'assistant' ? '1px solid #e2e8f0' : 'none',
                        borderBottomRightRadius: msg.sender === 'user' ? 4 : 20,
                        borderBottomLeftRadius: msg.sender === 'assistant' ? 4 : 20,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.825rem',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'inherit',
                          '& h3': { fontSize: '0.9rem', fontWeight: 800, mt: 0, mb: 1 },
                          '& code': { bgcolor: msg.sender === 'user' ? 'rgba(255,255,255,0.2)' : '#f1f5f9', px: 0.5, borderRadius: 0.5 },
                        }}
                      >
                        {msg.text}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.65rem', mt: 0.3, px: 0.5 }}>
                      {msg.timestamp}
                    </Typography>
                  </Box>
                ))}

                {isTyping && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: 'flex-start', p: 1.2, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <CircularProgress size={14} color="primary" />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Mentora AI is formulating response...
                    </Typography>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Subject Presets / Instant Options (Shown when chat is beginning) */}
              {messages.length <= 3 && (
                <Box sx={{ p: 1.5, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 0.8, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                    💡 Tap to ask instant subject doubts:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                    {SUBJECT_PRESETS.flatMap((cat) => cat.questions).map((q, idx) => (
                      <Chip
                        key={idx}
                        label={q.label}
                        size="small"
                        onClick={() => handleSendMessage(q.query)}
                        sx={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          bgcolor: '#f1f5f9',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#e2e8f0' },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Input Bar */}
              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                sx={{
                  p: 1.5,
                  bgcolor: '#ffffff',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <TextField
                  placeholder="Ask any subject or session question..."
                  size="small"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      fontSize: '0.825rem',
                      bgcolor: '#f8fafc',
                    },
                  }}
                />
                <IconButton
                  color="primary"
                  type="submit"
                  disabled={!inputMessage.trim()}
                  sx={{
                    bgcolor: inputMessage.trim() ? 'primary.main' : '#f1f5f9',
                    color: inputMessage.trim() ? '#ffffff' : '#94a3b8',
                    '&:hover': {
                      bgcolor: inputMessage.trim() ? 'primary.dark' : '#f1f5f9',
                    },
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            </>
          )}
        </Paper>
      )}
    </>
  );
}
