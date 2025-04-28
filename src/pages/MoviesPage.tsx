import  { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import { useMovies } from '../hooks/useMovies';

const genres = ['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Horror', 'Thriller', 'Romance', 'Animation', 'History'];

export default function MoviesPage() {
  const location = useLocation();
  const { movies, loading, fetchMovies, fetchMoviesByGenre } = useMovies();
  const [filteredMovies, setFilteredMovies] = useState(movies);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const genre = params.get('genre');
    
    if (genre && genres.includes(genre)) {
      setActiveGenre(genre);
      fetchMoviesByGenre(genre);
    } else {
      fetchMovies();
    }
  }, [location]);
  
  useEffect(() => {
    if (searchTerm) {
      setFilteredMovies(
        movies.filter(movie => 
          movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movie.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredMovies(movies);
    }
  }, [movies, searchTerm]);
  
  const handleGenreFilter = (genre: string) => {
    if (activeGenre === genre) {
      setActiveGenre(null);
      fetchMovies();
    } else {
      setActiveGenre(genre);
      fetchMoviesByGenre(genre);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Movies</h1>
          
          <div className="w-full md:w-auto flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <input
              type="text"
              placeholder="Search movies..."
              className="input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <button
              className="btn-secondary flex items-center justify-center md:w-auto"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="mb-8 p-4 bg-gray-900 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <button
                  key={genre}
                  className={`px-4 py-2 rounded-full text-sm ${
                    activeGenre === genre ? 'bg-[#e50914] text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => handleGenreFilter(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e50914]"></div>
          </div>
        ) : filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No movies found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
 
