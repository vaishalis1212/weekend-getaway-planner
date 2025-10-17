import { useState } from 'react';

const ItineraryHero = ({ destination, imageUrl }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Use default image if no imageUrl provided
  const heroImage = imageUrl || `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80`;

  return (
    <div className="relative w-full h-80 md:h-96 overflow-hidden rounded-2xl shadow-xl mb-8">
      {/* Loading skeleton */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-neutral-light animate-pulse" />
      )}

      {/* Hero Image */}
      <img
        src={heroImage}
        alt={`${destination} landscape`}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Destination Name */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
          {destination}
        </h1>
        <p className="text-white/90 text-lg md:text-xl drop-shadow-md">
          Your Perfect Weekend Getaway
        </p>
      </div>
    </div>
  );
};

export default ItineraryHero;
