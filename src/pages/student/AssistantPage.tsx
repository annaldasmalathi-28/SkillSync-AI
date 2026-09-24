import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { dataService } from '../../services/dataService';
import { aiAssistantService } from '../../services/aiAssistantService';
import { calculateReadinessScore } from '../../services/careerMatrix';
import { ChatMessage, StudentSkill, Internship, Project, RoadmapMilestone } from '../../types';
import { Card } from '../../components/common/Card';
import { GlowButton } from '../../components/common/GlowButton';
import { Badge } from '../../components/common/Badge';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Trash2,
  HelpCircle,
  ArrowRight,
  Code,
  Briefcase,
  Award,
  Zap,
  RefreshCw,
  Compass,
} from 'lucide-react';

const QUICK_PROMPTS = [
  {
    icon: <Briefcase className="w-3.5 h-3.5 text-violet-400" />,
    text: 'What are the highest-match internships for my skill graph?',
  },
  {
    icon: <Award className="w-3.5 h-3.5 text-emerald-400" />,
    text: 'How can I bridge my primary skill gaps for my target career?',
  },
  {
    icon: <Code className="w-3.5 h-3.5 text-cyan-400" />,
    text: 'Recommend 2 production portfolio projects to build next',
  },
  {
    icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
    text: 'Explain my Career Readiness Score and how to reach 90%+',
  },
];

export const AssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useNavigation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([]);
  const [readinessScore, setReadinessScore] = useState<number>(78);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadContext();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadContext = async () => {
    if (!user) return;
    try {
      const [sk, ints, projs, msgs] = await Promise.all([
        dataService.getStudentSkills(user.user_id),
        dataService.getInternships(),
        dataService.getProjects(user.user_id),
        dataService.getChatMessages(user.user_id),
      ]);

      setSkills(sk);
      setInternships(ints);
      setProjects(projs);

      const ms = await dataService.getRoadmapMilestones(user.user_id, user.target_career);
      setMilestones(ms);

      const score = calculateReadinessScore(user.target_career, sk, projs, ms);
      setReadinessScore(score);

      if (msgs.length === 0) {
        // Initialize with helpful welcome message
        const welcomeMsg: ChatMessage = {
          id: 'welcome-msg',
          sender: 'ai',
          text: `Welcome to **SkillSync AI Career Intelligence**, ${user.full_name.split(' ')[0]}!\n\nI am synced with your active academic telemetry for **${user.target_career}** (${score}% readiness index). Ask me anything about recommended projects, skill gap remediation, verified assessments, or matching internships.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionSuggestions: [
            'What internships match my profile?',
            'What skills should I verify next?',
            'Recommend a portfolio project',
          ],
        };
        setMessages([welcomeMsg]);
      } else {
        setMessages(msgs);
      }
    } catch (e) {
      console.error('Error loading AI context:', e);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText.trim();
    if (!textToSend || !user || isTyping) return;

    setInputText('');

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsTyping(true);

    try {
      // Save user message to persistent storage
      await dataService.saveChatMessage(user.user_id, userMessage);

      // Query AI career service
      const response = await aiAssistantService.generateCareerAdvice(
        textToSend,
        newHistory,
        {
          profile: user,
          skills,
          internships,
          readinessScore,
        }
      );

      const aiMessage: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionSuggestions: response.actionSuggestions,
        suggestedRoute: response.suggestedRoute,
      };

      const finalHistory = [...newHistory, aiMessage];
      setMessages(finalHistory);
      await dataService.saveChatMessage(user.user_id, aiMessage);
    } catch (e) {
      console.error('AI assistant error:', e);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'I encountered a temporary processing interruption. Please retry your inquiry or inspect your active roadmap.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newHistory, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    if (!user) return;
    await dataService.clearChatMessages(user.user_id);
    const resetMsg: ChatMessage = {
      id: 'reset-msg',
      sender: 'ai',
      text: `Conversation memory reset. I am ready to advise you on your career path toward **${user.target_career}**.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionSuggestions: ['Recommend internships', 'Analyze skill gaps', 'Explore roadmap'],
    };
    setMessages([resetMsg]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-950/50">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
              Career AI Intelligence Copilot
              <Badge variant="cyan" size="sm">Gemini Powered</Badge>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Personalized career guidance grounded in your real skill verification graph and target career milestones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Reset Chat Session"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            Clear History
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Context Telemetry & Quick Prompts */}
        <div className="lg:col-span-1 space-y-4">
          {/* Student Status Summary */}
          <Card glow="purple">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white font-heading">Student Context</span>
              <Badge variant="emerald" size="sm">Live Synced</Badge>
            </div>

            <div className="space-y-3 pt-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono-code">
                  Target Career
                </span>
                <span className="font-bold text-slate-100">{user?.target_career}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono-code">
                  Readiness Index
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full"
                      style={{ width: `${readinessScore}%` }}
                    />
                  </div>
                  <span className="font-mono-code font-bold text-cyan-300">{readinessScore}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Verified Skills</span>
                  <span className="font-bold text-emerald-400 font-mono-code">
                    {skills.filter((s) => s.verified).length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Projects</span>
                  <span className="font-bold text-violet-300 font-mono-code">{projects.length}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Prompts Panel */}
          <Card>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white font-heading">Recommended Inquiries</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </div>

            <div className="space-y-2">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.text)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-900/70 hover:bg-violet-950/40 border border-slate-800/80 hover:border-violet-600/40 transition-all text-[11px] text-slate-300 hover:text-slate-100 flex items-start gap-2.5 cursor-pointer group"
                >
                  <div className="mt-0.5 shrink-0">{qp.icon}</div>
                  <span className="group-hover:translate-x-0.5 transition-transform">{qp.text}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Chat Feed & Input Box */}
        <div className="lg:col-span-3 flex flex-col h-[700px] glass-panel rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl shadow-violet-950/40">
          {/* Chat Messages Log */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-md shadow-violet-950/60 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className={`max-w-2xl space-y-2 ${isAi ? 'text-left' : 'text-right'}`}>
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        isAi
                          ? 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-md whitespace-pre-wrap'
                          : 'bg-violet-600 text-white rounded-tr-xs shadow-md shadow-violet-950/50'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Action Suggestions from AI */}
                    {isAi && msg.actionSuggestions && msg.actionSuggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.actionSuggestions.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(sug)}
                            className="px-2.5 py-1 text-[11px] rounded-lg bg-violet-950/60 hover:bg-violet-900 border border-violet-500/40 text-violet-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            {sug}
                          </button>
                        ))}

                        {msg.suggestedRoute && (
                          <button
                            onClick={() => navigate(msg.suggestedRoute!)}
                            className="px-2.5 py-1 text-[11px] rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium"
                          >
                            Jump to Recommended View <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}

                    <span className="text-[10px] text-slate-500 font-mono-code block px-1">
                      {msg.timestamp}
                    </span>
                  </div>

                  {!isAi && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-violet-300" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-slate-400 font-mono-code text-[11px]">
                    Analyzing career graph & generating advice...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-3"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Ask anything about ${user?.target_career || 'your career'} roadmap, internships, projects, or skill gaps...`}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-4 pr-10 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors shadow-inner"
                  disabled={isTyping}
                />
              </div>

              <GlowButton
                type="submit"
                size="md"
                disabled={!inputText.trim() || isTyping}
                icon={<Send className="w-4 h-4" />}
              >
                Send
              </GlowButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
