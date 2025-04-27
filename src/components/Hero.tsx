import  { ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Movie } from '../types';

interface HeroProps {
  featuredMovie: Movie | null;
}

export default function Hero({ featuredMovie }: HeroProps) {
  if (!featuredMovie) return null;
  
  return (
    <div className="relative h-[80vh] w-full">
      <div className="absolute inset-0">
        <img 
          src={featuredMovie.posterUrl || "https://images.unsplash.com/photo-1580130775562-0ef92da028de?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBtb3ZpZSUyMHBvc3RlciUyMHRoZWF0cmV8ZW58MHx8fHwxNzQ1NTU1MzY4fDA&ixlib=rb-4.0.3"}
          alt={featuredMovie.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{featuredMovie.title}</h1>
          <div className="flex items-center mb-4">
            <span className="text-sm bg-red-600 px-2 py-1 rounded">Featured</span>
            <span className="mx-2">•</span>
            <span>{featuredMovie.releaseYear}</span>
            <span className="mx-2">•</span>
            <span>{featuredMovie.duration}</span>
          </div>
          <p className="text-lg text-gray-300 mb-6 line-clamp-3">{featuredMovie.description}</p>
          <div className="flex space-x-4">
            <Link to={`/movie/${featuredMovie.id}`} className="btn-primary flex items-center">
              <Play className="h-5 w-5 mr-2" />
              Watch Now
            </Link>
            <Link to={`/movie/${featuredMovie.id}`} className="btn-secondary">More Info</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
 