import  { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Play, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import { useMovies } from '../hooks/useMovies';
import { Movie } from '../types';
import VideoPlayer from '../components/VideoPlayer';

export default function HomePage() {
  const { movies, loading, fetchFeaturedMovies } = useMovies();
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [dramaMovies, setDramaMovies] = useState<Movie[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [theaterBackgrounds] = useState([
    "https://i.pinimg.com/736x/c1/44/a9/c144a9d72f82e553ffbf5595fff0cd69.jpg",
    "https://i.pinimg.com/736x/b0/63/cd/b063cdfcb11fbef08013617da665aa8d.jpg",
    "https://i.pinimg.com/736x/02/16/d3/0216d3d1bfc4ec84482b1e3da66d9be0.jpg"
  ]);
  
  useEffect(() => {
    const loadFeaturedMovie = async () => {
      await fetchFeaturedMovies();
    };
    
    loadFeaturedMovie();
  }, [fetchFeaturedMovies]);
  
  useEffect(() => {
    if (movies.length > 0) {
      setFeaturedMovie(movies[0]);
      
      // For demo purposes, split movies into categories
      const action = movies.filter(movie => movie.genre.includes('Action')).slice(0, 6);
      const drama = movies.filter(movie => movie.genre.includes('Drama')).slice(0, 6);
      
      setActionMovies(action.length ? action : movies.slice(0, 6));
      setDramaMovies(drama.length ? drama : movies.slice(0, 6));
    }
  }, [movies]);

  // If no movies, use placeholder data for demo
  useEffect(() => {
    if (!loading && movies.length === 0) {
      setFeaturedMovie({
        id: 'placeholder',
        title: 'The Matrix Resurrections',
        description: 'Return to a world of two realities: one, everyday life; the other, what lies behind it. To find out if his reality is a construct, Mr. Anderson will have to choose to follow the white rabbit once more.',
        genre: ['Action', 'Sci-Fi'],
        releaseYear: 2021,
        rating: 8.5,
        duration: '2h 28m',
        posterUrl: 'https://images.unsplash.com/photo-1475070929565-c985b496cb9f',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        featured: true,
        createdAt: new Date()
      });
      
      const placeholders = [
        {
          id: 'p1',
          title: 'Inception',
          description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
          genre: ['Action', 'Sci-Fi'],
          releaseYear: 2010,
          rating: 8.8,
          duration: '2h 28m',
          posterUrl: 'https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          featured: false,
          createdAt: new Date()
        },
        {
          id: 'p2',
          title: 'The Shawshank Redemption',
          description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
          genre: ['Drama'],
          releaseYear: 1994,
          rating: 9.3,
          duration: '2h 22m',
          posterUrl: 'https://images.unsplash.com/photo-1518343265568-51eec52d40da',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          featured: false,
          createdAt: new Date()
        },
        {
          id: 'p3',
          title: 'Pulp Fiction',
          description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
          genre: ['Crime', 'Drama'],
          releaseYear: 1994,
          rating: 8.9,
          duration: '2h 34m',
          posterUrl: 'https://images.unsplash.com/photo-1510987836583-e3fb9586c7b3',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          featured: false,
          createdAt: new Date()
        },
        {
          id: 'p4',
          title: 'The Dark Knight',
          description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
          genre: ['Action', 'Crime', 'Drama'],
          releaseYear: 2008,
          rating: 9.0,
          duration: '2h 32m',
          posterUrl: 'https://images.unsplash.com/photo-1513569771920-c9e1d31714af',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          featured: false,
          createdAt: new Date()
        }
      ];
      
      setActionMovies(placeholders.filter(m => m.genre.includes('Action')));
      setDramaMovies(placeholders.filter(m => m.genre.includes('Drama')));
    }
  }, [loading, movies]);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      
      <main>
        <div className="relative h-[80vh] w-full">
          {showTrailer && featuredMovie ? (
            <div className="absolute inset-0 bg-black z-10">
              <VideoPlayer 
                src={featuredMovie.videoUrl}
                poster={featuredMovie.posterUrl}
                onEnded={() => setShowTrailer(false)}
                autoplay={true}
              />
              <button 
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 p-2 rounded-full z-20"
                onClick={() => setShowTrailer(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <>
              <div className="absolute inset-0">
                <img 
                  src={featuredMovie?.posterUrl || theaterBackgrounds[0]}
                  alt={featuredMovie?.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
              </div>
              
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
                <div className="max-w-2xl">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">{featuredMovie?.title}</h1>
                  <div className="flex items-center mb-4">
                    <span className="text-sm bg-red-600 px-2 py-1 rounded">Featured</span>
                    <span className="mx-2">•</span>
                    <span>{featuredMovie?.releaseYear}</span>
                    <span className="mx-2">•</span>
                    <span>{featuredMovie?.duration}</span>
                  </div>
                  <p className="text-lg text-gray-300 mb-6 line-clamp-3">{featuredMovie?.description}</p>
                  <div className="flex space-x-4">
                    <button 
                      className="btn-primary flex items-center"
                      onClick={() => setShowTrailer(true)}
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Watch Trailer
                    </button>
                    <Link to={featuredMovie ? `/movie/${featuredMovie.id}` : '/movies'} className="btn-secondary">
                      More Info
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Trending Now</h2>
              <Link to="/movies" className="text-[#e50914] hover:underline flex items-center">
                See all <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {actionMovies.slice(0, 4).map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
          
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Drama</h2>
              <Link to="/movies?genre=Drama" className="text-[#e50914] hover:underline flex items-center">
                See all <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {dramaMovies.slice(0, 4).map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
          
          <section className="mb-8">
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src={theaterBackgrounds[1]} 
                alt="Cinema experience" 
                className="w-full h-64 md:h-80 object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center">
                <div className="px-8 md:px-16 max-w-lg">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">Premium Theater Experience</h2>
                  <p className="text-gray-300 mb-6">Enjoy the highest quality streaming experience with theater-grade video and audio.</p>
                  <Link to="/movies" className="btn-primary">
                    Explore Movies
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
 
