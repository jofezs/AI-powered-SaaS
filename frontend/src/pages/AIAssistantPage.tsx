import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Zap } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import api from '../lib/axios';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are an intelligent productivity assistant embedded in WorkspaceAI, a task management application. You help users manage their tasks, break down complex projects, set priorities, and stay productive.

When users share their tasks with you, you can:
- Suggest how to break down large tasks into subtasks
- Help prioritize tasks based on deadlines and importance
- Provide time estimates for tasks
- Suggest strategies to improve productivity
- Answer questions about task management best practices

Be concise, practical, and actionable in your responses.`;

const AIAssistantPage = () => {
  const { tasks } = useTaskStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your AI productivity assistant. I can help you break down tasks, prioritize your work, and boost your productivity. What would you like help with today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const taskContext =
        tasks.length > 0
          ? `\n\nUser's current tasks:\n${tasks
              .map(
                (t) =>
                  `- [${t.status}] [${t.priority} priority] ${t.title}${
                    t.description ? `: ${t.description}` : ''
                  }${t.dueDate ? ` (due: ${new Date(t.dueDate).toLocaleDateString()})` : ''}`
              )
              .join('\n')}`
          : '';

      const res = await api.post('/ai/chat', {
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        systemPrompt: SYSTEM_PROMPT + taskContext,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: res.data.data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      toast.error('Failed to get a response. Please try again.');
      // Remove the user message if the request failed
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          "Hi! I'm your AI productivity assistant. I can help you break down tasks, prioritize your work, and boost your productivity. What would you like help with today?",
      },
    ]);
  };

  const suggestions = [
    'Help me prioritize my tasks',
    'Break down my high priority tasks',
    'What should I focus on today?',
    'Suggest subtasks for my in-progress work',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
          <p className="text-gray-500 text-sm mt-1">
            Powered by OpenAI · Aware of your {tasks.length} task
            {tasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleClearChat}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Trash2 size={14} />
          Clear chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                message.role === 'assistant'
                  ? 'bg-accent/20'
                  : 'bg-dark-hover border border-dark-border'
              }`}
            >
              {message.role === 'assistant' ? (
                <Bot size={16} className="text-accent-light" />
              ) : (
                <User size={16} className="text-gray-400" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                message.role === 'assistant'
                  ? 'bg-dark-card border border-dark-border text-gray-200 rounded-tl-sm'
                  : 'bg-accent text-white rounded-tr-sm'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-accent-light" />
            </div>
            <div className="bg-dark-card border border-dark-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions — only show when only the initial message exists */}
      {messages.length === 1 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="text-left text-xs text-gray-400 bg-dark-card border border-dark-border hover:border-accent/40 hover:text-gray-200 rounded-xl px-3 py-2.5 transition-colors"
            >
              <Zap size={11} className="inline mr-1.5 text-accent-light" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 items-end bg-dark-card border border-dark-border rounded-2xl px-4 py-3">
        <textarea
          ref={textareaRef}
          rows={1}
          className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 text-sm resize-none focus:outline-none"
          placeholder="Ask me anything about your tasks..."
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="btn-primary p-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
      <p className="text-gray-600 text-xs text-center mt-2">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
};

export default AIAssistantPage;