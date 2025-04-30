import  { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import { Series } from '../types';

interface SeriesCardProps {
  series: Series;
}

export default function SeriesCard({ series }: SeriesCardProps) {
  const seasonCount = series.seasons?.length || 0;

  return (
    <div className="relative group overflow-hidden rounded-lg shadow-lg">
      <img 
        src={series.posterUrl} 
        alt={series.title} 
        className="w-full h-[420px] object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null; // Prevent infinite loop
          target.src = 'https://images.unsplash.com/photo-1580130775562-0ef92da028de?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB0diUyMHNlcmllcyUyMHBvc3RlciUyMGRhcmt8ZW58MHx8fHwxNzQ1OTkzMjU1fDA&ixlib=rb-4.0.3&fit=fillmax&h=900&w=600';
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h3 className="text-xl font-bold truncate">{series.title}</h3>
        
        <div className="flex items-center mt-1 mb-2">
          <Star className="h-4 w-4 text-yellow-400 mr-1" />
          <span className="text-sm">{series.rating}/10</span>
          <span className="mx-2">•</span>
          <span className="text-sm">{series.releaseYear}</span>
          <span className="mx-2">•</span>
          <span className="text-sm">{seasonCount} {seasonCount === 1 ? 'Season' : 'Seasons'}</span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {series.genre.map((g, index) => (
            <span key={index} className="text-xs bg-gray-800 px-2 py-1 rounded">{g}</span>
          ))}
        </div>
        
        <Link to={`/series/${series.id}`} className="btn-primary flex items-center justify-center w-full">
          <Play className="h-4 w-4 mr-2" />
          Watch now
        </Link>
      </div>
    </div>
  );
}
 
