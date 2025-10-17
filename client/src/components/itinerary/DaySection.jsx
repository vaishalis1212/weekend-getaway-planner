import { useState } from 'react';
import { MapPin } from 'lucide-react';
import ActivityCard from './ActivityCard';

const DaySection = ({ day, dayImage }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="mb-10">
      {/* Day Header */}
      <div className="mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
          {day.title}
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
      </div>

      {/* Day Image */}
      {dayImage && !imageError && (
        <div className="relative w-full h-64 md:h-72 rounded-xl overflow-hidden mb-6 shadow-lg">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-neutral-light animate-pulse" />
          )}
          <img
            src={dayImage.url}
            alt={dayImage.alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          {/* Location overlay */}
          {imageLoaded && dayImage.location && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-medium">{dayImage.location}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activities */}
      <div className="space-y-4">
        {day.activities.map((activity, index) => (
          <ActivityCard key={index} activity={activity} />
        ))}
      </div>
    </div>
  );
};

export default DaySection;
