import { Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Priya & Rahul',
      location: 'Mumbai',
      image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300',
      text: 'Found our perfect Goa getaway in just 5 minutes! The hidden gems recommendations were spot on. Best weekend ever!',
      rating: 5
    },
    {
      name: 'Anjali & Vikram',
      location: 'Bangalore',
      image: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=300',
      text: 'The Coorg itinerary was perfect. Saved us hours of planning and the budget was exactly what we spent. Highly recommend!',
      rating: 5
    },
    {
      name: 'Neha & Arjun',
      location: 'Delhi',
      image: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=300',
      text: 'Best weekend trip ever! The romantic spots were magical and we discovered places we would have never found on our own.',
      rating: 5
    }
  ];

  return (
    <div id="testimonials" className="py-20 bg-surface">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-heading font-bold text-center mb-4 text-text-primary">
          What Couples Say
        </h2>
        <p className="text-center text-text-secondary mb-16 text-lg">
          Real stories from real travelers
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-gradient-to-br from-background to-surface p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-text-secondary mb-6 italic leading-relaxed">"{testimonial.text}"</p>
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary"
                />
                <div>
                  <div className="font-bold text-text-primary">{testimonial.name}</div>
                  <div className="text-sm text-neutral">{testimonial.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}