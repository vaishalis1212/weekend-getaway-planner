export default function Footer() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-text-primary text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">✈️</span>
              <span className="text-xl font-heading font-bold">Manzil</span>
            </div>
            <p className="text-neutral">
              Plan your perfect couple's getaway in minutes
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2 text-neutral">
              <li><button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-surface transition">About Us</button></li>
              <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-surface transition">How It Works</button></li>
              <li><button onClick={() => scrollToSection('destinations')} className="hover:text-surface transition">Why Choose Us</button></li>
              <li><button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-surface transition">Contact</button></li>
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="font-bold mb-4 text-lg">Popular Destinations</h3>
            <ul className="space-y-2 text-neutral">
              <li><span className="hover:text-surface transition cursor-pointer">Goa</span></li>
              <li><span className="hover:text-surface transition cursor-pointer">Coorg</span></li>
              <li><span className="hover:text-surface transition cursor-pointer">Udaipur</span></li>
              <li><span className="hover:text-surface transition cursor-pointer">Rishikesh</span></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold mb-4 text-lg">Follow Us</h3>
            <div className="flex gap-4">
              <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                <span className="text-lg">📘</span>
              </button>
              <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                <span className="text-lg">📸</span>
              </button>
              <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                <span className="text-lg">🐦</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral pt-8 text-center text-neutral">
          <p>© 2025 Manzil. Made with ❤️ for couples who love to travel.</p>
        </div>
      </div>
    </footer>
  );
}