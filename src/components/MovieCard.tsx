import  { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="relative group overflow-hidden rounded-lg shadow-lg">
      <img 
        src={movie.posterUrl} 
        alt={movie.title} 
        className="w-full h-[420px] object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null; // Prevent infinite loop
          target.src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&h=900';
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h3 className="text-xl font-bold truncate">{movie.title}</h3>
        
        <div className="flex items-center mt-1 mb-2">
          <Star className="h-4 w-4 text-yellow-400 mr-1" />
          <span className="text-sm">{movie.rating}/10</span>
          <span className="mx-2">•</span>
          <span className="text-sm">{movie.releaseYear}</span>
          <span className="mx-2">•</span>
          <span className="text-sm">{movie.duration}</span>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {movie.genre.map((g, index) => (
            <span key={index} className="text-xs bg-gray-800 px-2 py-1 rounded">{g}</span>
          ))}
        </div>
        
        <Link to={`/movie/${movie.id}`} className="btn-primary flex items-center justify-center w-full">
          <Play className="h-4 w-4 mr-2" />
          Watch now
        </Link>
      </div>
    </div>
  );
}
 