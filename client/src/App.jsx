import ChatInterface from './components/ChatInterface'

function App() {
  return (
    <div className="flex h-screen flex-col">
      {/* Hero Section - Compact */}
      <div className="relative overflow-hidden bg-warm-gradient py-6 px-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title with Icon */}
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <span className="text-3xl" role="img" aria-label="sunset">🌅</span>
            Your Perfect Escape Awaits with Manzil
          </h1>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-white text-xs md:text-sm">
            <div className="flex items-center gap-1 bg-white/25 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full border border-white/30">
              <span role="img" aria-label="couple">💑</span>
              <span className="font-medium">Personalized</span>
            </div>
            <div className="flex items-center gap-1 bg-white/25 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full border border-white/30">
              <span role="img" aria-label="backpack">🎒</span>
              <span className="font-medium">Offbeat</span>
            </div>
            <div className="flex items-center gap-1 bg-white/25 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full border border-white/30">
              <span role="img" aria-label="money">💰</span>
              <span className="font-medium">Budget-friendly</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 bg-gradient-to-b from-background/80 to-surface overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  )
}

export default App
