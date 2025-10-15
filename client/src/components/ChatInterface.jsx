import { useState, useEffect, useRef } from 'react'
import PreferenceWizard from './PreferenceWizard'
import ComparisonView from './ComparisonView'
import DetailedItineraryView from './DetailedItineraryView'

function ChatInterface() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showWizard, setShowWizard] = useState(true)

  // View mode state
  const [viewMode, setViewMode] = useState(null) // null | 'comparison' | 'detailed'
  const [comparisonData, setComparisonData] = useState(null)
  const [detailedItinerary, setDetailedItinerary] = useState(null)

  // Context state
  const [userPreferences, setUserPreferences] = useState(null)
  const [selectedDestination, setSelectedDestination] = useState(null)

  // Chat state (for detailed view)
  const [destinationChatMessages, setDestinationChatMessages] = useState([])
  const [isLoadingChat, setIsLoadingChat] = useState(false)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle wizard completion
  const handleWizardComplete = async (query, preferences) => {
    console.log('Wizard completed:', { query, preferences })
    setUserPreferences(preferences)
    setShowWizard(false)

    // Add user message to chat
    const userMessage = {
      text: query,
      isUser: true,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])

    // Send to backend
    await handleSendMessage(query, preferences)
  }

  // Check for wizard data from Hero2Demo on mount
  useEffect(() => {
    const storedWizardData = sessionStorage.getItem('wizardData');
    if (storedWizardData) {
      try {
        const { query, preferences } = JSON.parse(storedWizardData);
        console.log('Found stored wizard data:', { query, preferences });
        // Clear the stored data
        sessionStorage.removeItem('wizardData');
        // Process the wizard completion
        handleWizardComplete(query, preferences);
      } catch (error) {
        console.error('Error parsing stored wizard data:', error);
        sessionStorage.removeItem('wizardData');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  // Send message to backend
  const handleSendMessage = async (message, preferences = userPreferences, isChat = false) => {
    if (isChat) {
      setIsLoadingChat(true)
    } else {
      setIsLoading(true)
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          userPreferences: preferences || {},
          context: {
            selectedDestination: selectedDestination,
            hasSeenItinerary: viewMode === 'detailed'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      console.log('Backend response:', data)

      // Handle based on mode
      if (data.mode === 'comparison') {
        setViewMode('comparison')
        setComparisonData(data)

        const aiMessage = {
          text: data.message || 'Here are your top destination matches!',
          isUser: false,
          timestamp: data.timestamp,
          type: 'comparison'
        }
        setMessages(prev => [...prev, aiMessage])

      } else if (data.mode === 'detailed') {
        setViewMode('detailed')
        setDetailedItinerary(data)
        setSelectedDestination(data.destination)
        setDestinationChatMessages([]) // Clear chat when new destination selected

        const aiMessage = {
          text: `Here's your complete ${data.destination} itinerary!`,
          isUser: false,
          timestamp: data.timestamp,
          type: 'detailed',
          destination: data.destination
        }
        setMessages(prev => [...prev, aiMessage])

      } else if (data.mode === 'chat') {
        // Contextual chat response
        setDestinationChatMessages(prev => [
          ...prev,
          { role: 'user', content: message },
          { role: 'assistant', content: data.message }
        ])
      }
    } catch (error) {
      console.error('Error sending message:', error)

      if (isChat) {
        setDestinationChatMessages(prev => [
          ...prev,
          { role: 'user', content: message },
          { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
        ])
      } else {
        const errorMessage = {
          text: 'Sorry, something went wrong. Please try again.',
          isUser: false,
          timestamp: new Date().toISOString(),
          type: 'error'
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } finally {
      if (isChat) {
        setIsLoadingChat(false)
      } else {
        setIsLoading(false)
      }
    }
  }

  // Handle destination selection from comparison
  const handleDestinationSelect = async (destinationName) => {
    console.log('Destination selected:', destinationName)
    const message = `Choose ${destinationName}`

    // Add user message
    const userMessage = {
      text: message,
      isUser: true,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])

    // Send to backend
    await handleSendMessage(message, userPreferences, false)
  }

  // Handle back to comparison
  const handleBackToComparison = () => {
    console.log('Back to comparison')
    setViewMode('comparison')
    setDetailedItinerary(null)
    setSelectedDestination(null)
    setDestinationChatMessages([])
  }

  // Handle chat message in detailed view
  const handleDestinationChatMessage = async (message) => {
    console.log('Chat message:', message)
    await handleSendMessage(message, userPreferences, true)
  }

  // Handle refine search
  const handleRefineSearch = () => {
    console.log('Refine search clicked')
    setShowWizard(true)
    setViewMode(null)
    setComparisonData(null)
    setDetailedItinerary(null)
    setSelectedDestination(null)
    setDestinationChatMessages([])
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Wizard Modal */}
      {messages.length === 0 && showWizard && (
        <PreferenceWizard
          onComplete={handleWizardComplete}
          onClose={() => window.location.href = '/?demo=hero2'}
        />
      )}

      {/* Wizard Modal - Refinement */}
      {messages.length > 0 && showWizard && (
        <PreferenceWizard
          onComplete={handleWizardComplete}
          onClose={() => window.location.href = '/?demo=hero2'}
        />
      )}


      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Comparison View */}
        {viewMode === 'comparison' && comparisonData && !showWizard && !isLoading && (
          <ComparisonView
            destinations={comparisonData.destinations}
            onDestinationSelect={handleDestinationSelect}
            onRefine={handleRefineSearch}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-12 min-h-screen">
            <div className="text-center">
              <div className="relative">
                {/* Animated gradient circle */}
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-primary via-secondary to-accent mb-6"
                     style={{
                       WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                       WebkitMaskComposite: 'xor',
                       maskComposite: 'exclude',
                       padding: '4px'
                     }}>
                </div>
              </div>
              <p className="text-text-primary text-lg font-semibold mb-2">
                {viewMode === null ? '🔍 Finding your perfect destinations...' : '✨ Creating your personalized itinerary...'}
              </p>
              <p className="text-text-secondary text-sm">
                {viewMode === null ? 'Analyzing options based on your preferences' : 'Crafting the perfect getaway plan just for you'}
              </p>
            </div>
          </div>
        )}

        {/* Detailed Itinerary View */}
        {viewMode === 'detailed' && detailedItinerary && !isLoading && !showWizard && (
          <DetailedItineraryView
            itinerary={detailedItinerary}
            onBack={handleBackToComparison}
            onChatMessage={handleDestinationChatMessage}
            chatMessages={destinationChatMessages}
            isLoadingChat={isLoadingChat}
            userPreferences={userPreferences}
          />
        )}

        {/* Empty State */}
        {messages.length === 0 && !showWizard && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-lg px-4">
              <div className="text-6xl md:text-7xl mb-6" role="img" aria-label="chat">💬</div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
                Ready to plan your getaway?
              </h2>
              <p className="text-text-secondary mb-6">
                Tell me about your preferences and I'll create the perfect weekend itinerary for you!
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default ChatInterface
