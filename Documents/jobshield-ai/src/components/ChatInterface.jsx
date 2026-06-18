import { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../services/groq';

function ChatInterface({ context, listingData }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'I\'ve analyzed the job listing. Feel free to ask me any questions about the opportunity, the company, or my assessment.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Prepare context for AI
      const contextInfo = {
        ...listingData,
        previousMessages: messages.slice(-6) // Last 3 exchanges
      };

      const response = await chatWithAI(userMessage, contextInfo);
      
      // Add AI response
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try rephrasing your question or try again in a moment.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    'What are the biggest red flags in this listing?',
    'Should I apply to this job?',
    'How can I verify this company is legitimate?',
    'What questions should I ask in an interview?'
  ];

  return (
    <div className="card bg-surface/80 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-text-primary">Ask AI About This Opportunity</h3>
        <span className="text-xs text-text-secondary bg-primary/10 px-2 py-1 rounded">
          Powered by Groq
        </span>
      </div>

      {/* Messages */}
      <div className="bg-background rounded-lg p-4 mb-4 max-h-[400px] overflow-y-auto space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-text-primary'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface border border-border rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="mb-4">
          <p className="text-xs text-text-secondary mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => setInput(question)}
                className="text-xs bg-surface hover:bg-surface/80 border border-border text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-full transition-colors"
                disabled={loading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about this opportunity..."
          className="input-field flex-1"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            'Send'
          )}
        </button>
      </form>

      <p className="text-xs text-text-secondary mt-3 italic">
        AI responses are for guidance only. Always verify independently before making decisions.
      </p>
    </div>
  );
}

export default ChatInterface;

// Made with Bob