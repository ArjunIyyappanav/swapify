import { Star } from 'lucide-react';

const UserRating = ({ rating, totalRatings, size = 'sm', showCount = false, className = '' }) => {
  // Show default 5.0 rating for users without ratings
  const displayRating = rating || 5.0;
  const displayCount = totalRatings || 0;
  
  // Always show rating (default 5.0 for new users)

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const starSizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`flex items-center gap-1 text-yellow-400 ${className}`}>
      <Star className={`${starSizeClasses[size]} fill-current`} />
      <span className={sizeClasses[size]}>
        {displayRating}
        {showCount && ` (${displayCount})`}
      </span>
    </div>
  );
};

export default UserRating;