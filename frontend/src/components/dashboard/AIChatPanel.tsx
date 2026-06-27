import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTaskStore } from '../../store/taskStore';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const suggestions = [
  'Help me prioritize my tasks',
  'Break down my high priority tasks',
  'What should I focus on today?',
  'Suggest subtasks for my in-progress work',
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are an intelligent productivity assistant embedded in WorkspaceAI, a task management app. Help users manage tasks, break down projects, set priorities, and stay productive. Be concise and actionable.`;

interface Props {
  onClose: () => void;
}

const AIChatPanel = ({ onClose }: Props) => {
  const { tasks } = useTaskStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I can see your tasks and help you plan, prioritize, or break them down. What would you like to tackle?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsLoading(true);

    try {
      const taskContext = tasks.length > 0
        ? `\n\nUser's tasks:\n${tasks.map((t) =>
            `- [${t.status}] [${t.priority}] ${t.title}${t.dueDate ? ` (due: ${new Date(t.dueDate).toLocaleDateString()})` : ''}`
          ).join('\n')}`
        : '';

      const res = await api.post('/ai/chat', {
        messages: updated.map((m) => ({ role: m.role, content: m.content })),
        systemPrompt: SYSTEM_PROMPT + taskContext,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.data.reply },
      ]);
    } catch {
      toast.error('AI unavailable. Check your API key.');
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full border-l border-parchment-border bg-parchment">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-parchment-border bg-parchment-dark">
        <div className="flex items-center gap-2">
          <Bot size={15} className="text-bark-light" />
          <span className="font-serif font-bold text-bark-dark text-sm italic">AI Assistant</span>
        </div>
        <button onClick={onClose} className="text-bark-pale hover:text-bark-dark">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'assistant' ? 'bg-bark-mid' : 'bg-parchment-dark border border-parchment-border'
            }`}>
              {msg.role === 'assistant'
                ? <Bot size={12} className="text-bark-cream" />
                : <User size={12} className="text-bark-mid" />}
            </div>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-[11px] font-serif leading-relaxed ${
              msg.role === 'assistant'
                ? 'bg-[#fffdf0] border border-parchment-border text-bark-darkest'
                : 'bg-bark-dark text-bark-cream whitespace-pre-wrap'
            }`}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-3.5 mb-1.5 last:mb-0 space-y-0.5">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-3.5 mb-1.5 last:mb-0 space-y-0.5">{children}</ol>,
                    li: ({ children }) => <li>{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-bark-dark">{children}</strong>,
                    code: ({ className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const inline = !match;
                      return inline ? (
                        <code className="bg-parchment-dark px-1 py-0.5 rounded font-mono text-[10px] text-bark-light" {...props}>
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-parchment-dark p-2 rounded overflow-x-auto font-mono text-[10px] my-1 border border-parchment-border">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    h1: ({ children }) => <h1 className="text-xs font-bold my-1 text-bark-dark">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-[11px] font-bold my-1 text-bark-dark">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-[10px] font-bold my-1 text-bark-dark">{children}</h3>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-bark-mid flex items-center justify-center">
              <Bot size={12} className="text-bark-cream" />
            </div>
            <div className="bg-[#fffdf0] border border-parchment-border rounded-lg px-3 py-2 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-bark-pale rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-bark-pale rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-bark-pale rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        {messages.length === 1 && (
          <div className="flex flex-col gap-1.5 mt-2">
            <p className="text-[10px] text-bark-pale font-sans font-medium italic mb-0.5">Suggestions:</p>
            <div className="grid grid-cols-1 gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-left text-[10px] font-sans text-bark-mid bg-[#fffdf0] border border-parchment-border hover:border-bark-mid hover:text-bark-darkest rounded-lg px-2.5 py-1.5 transition-colors duration-150 flex items-center gap-1.5"
                >
                  <Zap size={10} className="text-bark-light shrink-0" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-parchment-border">
        <div className="flex gap-2">
          <textarea
            rows={2}
            className="input-parchment flex-1 text-[11px] resize-none py-2"
            placeholder="Ask about your tasks..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="btn-bark px-2 self-end disabled:opacity-40"
          >
            <Send size={13} />
          </button>
        </div>
        <p className="text-[9px] text-bark-pale font-sans mt-1">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
};

export default AIChatPanel;