import  { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Clock, Star, Play, Download } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useMovies } from '../hooks/useMovies';
import { Movie } from '../types';
import VideoPlayer from '../components/VideoPlayer';

export default function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { fetchMovieById, movies } = useMovies();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  
  useEffect(() => {
    const loadMovie = async () => {
      if (id) {
        setLoading(true);
        try {
          const fetchedMovie = await fetchMovieById(id);
          console.log("Fetched movie details:", fetchedMovie);
          setMovie(fetchedMovie);
        } catch (err) {
          console.error("Error loading movie:", err);
          setVideoError("Failed to load movie details");
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadMovie();
  }, [id, fetchMovieById]);
  
  useEffect(() => {
    if (movie && movies.length > 0) {
      // Find related movies based on genre
      const related = movies
        .filter(m => 
          m.id !== movie.id && 
          m.genre.some(g => movie.genre.includes(g))
        )
        .slice(0, 4);
      
      setRelatedMovies(related);
    }
  }, [movie, movies]);

  const handlePlayMovie = () => {
    if (!movie?.videoUrl) {
      setVideoError("No video URL available for this movie");
      return;
    }
    
    setIsPlaying(true);
    setVideoError(null);
    window.scrollTo(0, 0);
  };

  const handleDownloadMovie = async () => {
    if (!movie?.videoUrl) {
      setVideoError("No video URL available to download");
      return;
    }
    
    if (movie.videoUrl.includes('youtube.com') || movie.videoUrl.includes('youtu.be')) {
      setVideoError("Download not available for YouTube videos");
      return;
    }
    
    try {
      setDownloading(true);
      
      // Create a direct download link for the video
      const url = movie.videoUrl.includes('hooks.jdoodle.net/proxy') 
        ? movie.videoUrl 
        : `https://hooks.jdoodle.net/proxy?url=${encodeURIComponent(movie.videoUrl)}`;
      
      // Create anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${movie.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Delay resetting downloading to show feedback to user
      setTimeout(() => {
        setDownloading(false);
      }, 1500);
    } catch (err) {
      console.error('Error downloading video:', err);
      setVideoError('Failed to download video. Please try again later.');
      setDownloading(false);
    }
  };

  const handleVideoError = (message: string) => {
    setVideoError(message);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <Navbar />
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e50914]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Movie Not Found</h1>
          <p className="mb-8">The movie you're looking for doesn't exist or has been removed.</p>
          <Link to="/movies" className="btn-primary">
            Back to Movies
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      
      <main>
        {isPlaying ? (
          <div className="w-full bg-black">
            {videoError ? (
              <div className="flex flex-col items-center justify-center w-full aspect-video max-h-[75vh] bg-gray-900">
                <div className="text-center p-8">
                  <h3 className="text-xl font-medium mb-4 text-red-500">Video Playback Error</h3>
                  <p className="mb-6">{videoError}</p>
                  <button 
                    className="btn-secondary"
                    onClick={() => setIsPlaying(false)}
                  >
                    Back to Movie Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <VideoPlayer 
                  src={movie.videoUrl}
                  poster={movie.posterUrl}
                  onEnded={() => setIsPlaying(false)}
                  autoplay={true}
                  movieTitle={movie.title}
                />
                <button 
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 p-2 rounded-full z-20"
                  onClick={() => setIsPlaying(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-[75vh] w-full">
            <div className="absolute inset-0">
              <img 
                src={movie.posterUrl} 
                alt={movie.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&h=900';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-black/50"></div>
            </div>
            
            <div className="absolute top-4 left-4 z-10">
              <Link to="/movies" className="flex items-center text-white bg-black/50 hover:bg-black/70 px-4 py-2 rounded-full transition-colors">
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </Link>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
              <div className="max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{movie.title}</h1>
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="bg-[#e50914] px-2 py-1 rounded text-sm">{movie.releaseYear}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{movie.rating}/10</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{movie.duration}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genre.map((genre, index) => (
                    <Link 
                      key={index} 
                      to={`/movies?genre=${genre}`}
                      className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
                
                <p className="text-gray-300 mb-8 max-w-2xl">{movie.description}</p>
                
                <div className="flex flex-wrap gap-4">
                  <button 
                    className="btn-primary flex items-center"
                    onClick={handlePlayMovie}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Play Now
                  </button>
                  
                  <button 
                    className="btn-secondary flex items-center"
                    onClick={handleDownloadMovie}
                    disabled={downloading || movie.videoUrl.includes('youtube')}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    {downloading ? 'Downloading...' : 'Download'}
                  </button>
                </div>
                
                {videoError && (
                  <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-sm">
                    {videoError}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {relatedMovies.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedMovies.map(movie => (
                <Link key={movie.id} to={`/movie/${movie.id}`} className="block">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                    <img 
                      src={movie.posterUrl} 
                      alt={movie.title} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&h=900';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                      <div>
                        <h3 className="font-medium text-lg">{movie.title}</h3>
                        <p className="text-sm text-gray-300">{movie.releaseYear} • {movie.duration}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
 