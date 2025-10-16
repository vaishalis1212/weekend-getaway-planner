import { useState, useRef, useEffect } from 'react';
import DestinationComparisonCard from './DestinationComparisonCard';
import { Send } from 'lucide-react';

const ComparisonView = ({ destinations, onDestinationSelect, onRefine, onChatMessage, chatMessages, isLoadingChat }) => {
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      onChatMessage(chatInput.trim());
      setChatInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    'Plan another trip',
    'I want to go to Udaipur',
    'Show me beach destinations',
    'Adjust my budget to ₹25,000'
  ];
  if (!destinations || destinations.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <div className="bg-accent/10 border-2 border-accent/30 rounded-lg p-8">
          <div className="text-6xl mb-4" role="img" aria-label="thinking">🤔</div>
          <p className="text-lg text-text-primary mb-4 font-semibold">
            Hmm, we couldn't find destinations matching all your criteria.
          </p>
          <p className="text-text-secondary mb-6">
            Let's adjust your preferences to find the perfect getaway!
          </p>
          <button
            onClick={onRefine}
            className="bg-nature-gradient text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-focus focus:ring-primary focus:ring-offset-focus hover:brightness-110"
            aria-label="Adjust your preferences"
          >
            Adjust Preferences
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 pb-12">
      {/* Header */}
      <div className="mb-8 text-center animate-fadeIn">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
          Based on your preferences, here are your top matches!
          <span className="ml-2" role="img" aria-label="sparkles">✨</span>
        </h2>
        <p className="text-text-secondary text-lg">
          Compare these destinations and choose the one that excites you most
        </p>
      </div>

      {/* Destination Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {destinations.map((destination, index) => (
          <div key={destination.name} className="animate-fadeIn" style={{ animationDelay: `${index * 150}ms` }}>
            <DestinationComparisonCard
              destination={destination}
              onSelect={onDestinationSelect}
              isTopPick={index === 0} // First one is top pick
            />
          </div>
        ))}
      </div>

      {/* Chat Section */}
      <div className="border-t-4 border-primary/30 pt-8 mt-8">
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4 flex items-center gap-3">
          <span role="img" aria-label="chat">💬</span>
          Ask me anything
        </h2>
        <p className="text-text-secondary mb-6 text-lg">
          Not feeling these options? I can help you adjust your preferences, suggest different destinations,
          or help you plan another trip - Just ask!
        </p>

        {/* Chat History */}
        <div className="bg-surface rounded-xl border-2 border-neutral-light shadow-sm mb-6">
          <div className="p-6 max-h-96 overflow-y-auto space-y-4">
            {!chatMessages || chatMessages.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <div className="text-5xl mb-3" role="img" aria-label="waving hand">👋</div>
                <p className="mb-2 font-medium">No questions yet. Start chatting!</p>
                <p className="text-sm">Try asking to adjust preferences, suggest alternatives, or plan a different trip.</p>
              </div>
            ) : (
              <>
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-lg shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-neutral-light text-text-primary border border-neutral'
                    }`}>
                      {msg.role === 'assistant' && (
                        <div className="font-semibold text-sm text-primary mb-1">
                          Travel Assistant
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </>
            )}

            {/* Loading indicator */}
            {isLoadingChat && (
              <div className="flex justify-start">
                <div className="bg-neutral-light border border-neutral px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Input */}
        <div className="bg-surface rounded-xl border-2 border-neutral-light focus-within:border-primary transition p-4 shadow-sm">
          <div className="flex gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="E.g., Plan another trip, I want to go to Udaipur, Show me beach destinations"
              className="flex-1 px-4 py-3 border-0 focus:outline-none text-text-primary bg-transparent"
              disabled={isLoadingChat}
              aria-label="Chat message input"
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isLoadingChat}
              className="px-6 py-3 bg-nature-gradient text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-focus focus:ring-primary focus:ring-offset-focus hover:brightness-110"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="mt-5">
          <p className="text-sm text-text-secondary mb-3 font-medium">Quick questions to get started:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setChatInput(question)}
                className="px-4 py-2 text-sm border-2 border-neutral-light rounded-full hover:bg-primary/5 hover:border-primary transition-colors text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={`Ask: ${question}`}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
