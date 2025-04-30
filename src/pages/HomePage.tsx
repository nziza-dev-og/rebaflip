import  { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Play, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import SeriesCard from '../components/SeriesCard';
import { useMovies } from '../hooks/useMovies';
import { useSeries } from '../hooks/useSeries';
import { Movie, Series } from '../types';
import VideoPlayer from '../components/VideoPlayer';

export default function HomePage() {
  const { movies, loading: loadingMovies, fetchFeaturedMovies } = useMovies();
  const { seriesList, loading: loadingSeries, fetchFeaturedSeries } = useSeries();
  const [featuredContent, setFeaturedContent] = useState<Movie | Series | null>(null);
  const [isSeries, setIsSeries] = useState(false);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<Series[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const [theaterBackgrounds] = useState([
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxkYXJrJTIwY2luZW1hJTIwbW92aWUlMjB0aGVhdGVyfGVufDB8fHx8MTc0NTY1MTQ2MHww&ixlib=rb-4.0.3&fit=fillmax&h=1080&w=1920",
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxkYXJrJTIwY2luZW1hJTIwbW92aWUlMjB0aGVhdGVyfGVufDB8fHx8MTc0NTY1MTQ2MHww&ixlib=rb-4.0.3&fit=fillmax&h=1080&w=1920",
    "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxkYXJrJTIwY2luZW1hJTIwbW92aWUlMjB0aGVhdGVyfGVufDB8fHx8MTc0NTY1MTQ2MHww&ixlib=rb-4.0.3&fit=fillmax&h=1080&w=1920"
  ]);
  
  const [cinePosterImages] = useState([
    "https://images.unsplash.com/photo-1475070929565-c985b496cb9f?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxjaW5lbWF0aWMlMjB0diUyMHNlcmllcyUyMHBvc3RlciUyMGRhcmt8ZW58MHx8fHwxNzQ1OTkzMjU1fDA&ixlib=rb-4.0.3&fit=fillmax&h=900&w=600",
    "https://images.unsplash.com/photo-1584448097764-374f81551427?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxjaW5lbWF0aWMlMjB0diUyMHNlcmllcyUyMHBvc3RlciUyMGRhcmt8ZW58MHx8fHwxNzQ1OTkzMjU1fDA&ixlib=rb-4.0.3&fit=fillmax&h=900&w=600",
    "https://images.unsplash.com/photo-1584448141569-69f342da535c?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxjaW5lbWF0aWMlMjB0diUyMHNlcmllcyUyMHBvc3RlciUyMGRhcmt8ZW58MHx8fHwxNzQ1OTkzMjU1fDA&ixlib=rb-4.0.3&fit=fillmax&h=900&w=600",
    "https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw1fHxjaW5lbWF0aWMlMjB0diUyMHNlcmllcyUyMHBvc3RlciUyMGRhcmt8ZW58MHx8fHwxNzQ1OTkzMjU1fDA&ixlib=rb-4.0.3&fit=fillmax&h=900&w=600",
    "https://images.unsplash.com/photo-1580130775562-0ef92da028de?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB0diUyMHNlcmllcyUyMHBvc3RlciUyMGRhcmt8ZW58MHx8fHwxNzQ1OTkzMjU1fDA&ixlib=rb-4.0.3&fit=fillmax&h=900&w=600"
  ]);
  
  useEffect(() => {
    const loadFeaturedContent = async () => {
      await Promise.all([
        fetchFeaturedMovies(),
        fetchFeaturedSeries()
      ]);
    };
    
    loadFeaturedContent();
  }, [fetchFeaturedMovies, fetchFeaturedSeries]);
  
  useEffect(() => {
    // Randomly choose between featuring a movie or series
    if (movies.length > 0 && seriesList.length > 0) {
      const showSeries = Math.random() > 0.5;
      if (showSeries && seriesList.length > 0) {
        setFeaturedContent(seriesList[0]);
        setIsSeries(true);
      } else if (movies.length > 0) {
        setFeaturedContent(movies[0]);
        setIsSeries(false);
      }
    } else if (movies.length > 0) {
      setFeaturedContent(movies[0]);
      setIsSeries(false);
    } else if (seriesList.length > 0) {
      setFeaturedContent(seriesList[0]);
      setIsSeries(true);
    }
    
    // Get movies for categories
    if (movies.length > 0) {
      const action = movies.filter(movie => movie.genre.includes('Action')).slice(0, 6);
      setActionMovies(action.length ? action : movies.slice(0, 6));
    }
    
    // Get series for categories
    if (seriesList.length > 0) {
      setTrendingSeries(seriesList.slice(0, 6));
    }
  }, [movies, seriesList]);

  // If no content, use placeholder data for demo
  useEffect(() => {
    if (!loadingMovies && !loadingSeries && !featuredContent) {
      // Create a placeholder movie
      const placeholderMovie = {
        id: 'placeholder-movie',
        title: 'The Forest\'s Echo',
        description: 'In a world where nature speaks, one person discovers the forgotten language that could save humanity from its own destruction. A haunting journey through time and conscience.',
        genre: ['Drama', 'Fantasy'],
        releaseYear: 2023,
        rating: 8.7,
        duration: '2h 15m',
        posterUrl: cinePosterImages[0],
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        featured: true,
        createdAt: new Date()
      };
      
      // Create a placeholder series
      const placeholderSeries = {
        id: 'placeholder-series',
        title: 'Midnight Chronicles',
        description: 'A detective with supernatural abilities investigates mysterious disappearances in a small town where nothing is as it seems. Each season unravels a new layer of the town\'s dark secrets.',
        genre: ['Mystery', 'Thriller'],
        releaseYear: 2023,
        rating: 9.1,
        posterUrl: cinePosterImages[1],
        bannerUrl: theaterBackgrounds[0],
        featured: true,
        seasons: [
          {
            id: 's1',
            title: 'Season 1: Beginnings',
            seasonNumber: 1,
            episodes: [
              {
                id: 'e1',
                title: 'Welcome to Shadowvale',
                description: 'Detective Alex Morgan arrives in the mysterious town of Shadowvale to investigate a series of unexplained disappearances.',
                episodeNumber: 1,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                duration: '45m'
              },
              {
                id: 'e2',
                title: 'Dark Secrets',
                description: 'Alex discovers strange symbols throughout the town as locals begin to reveal the town\'s unusual history.',
                episodeNumber: 2,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                duration: '42m'
              }
            ]
          }
        ],
        createdAt: new Date()
      };
      
      // Randomly choose movie or series to feature
      const showSeries = Math.random() > 0.5;
      if (showSeries) {
        setFeaturedContent(placeholderSeries);
        setIsSeries(true);
        
        // Create placeholder series list
        const placeholderSeriesList = [
          placeholderSeries,
          {
            id: 'ps2',
            title: 'Quantum Descendants',
            description: 'In 2150, time travel is regulated by the Temporal Authority. When unauthorized jumps begin causing reality to fracture, a team of agents must chase the culprits across different eras.',
            genre: ['Sci-Fi', 'Adventure'],
            releaseYear: 2022,
            rating: 8.9,
            posterUrl: cinePosterImages[2],
            seasons: [{ id: 's1', title: 'Season 1', seasonNumber: 1, episodes: [] }],
            featured: false,
            createdAt: new Date()
          },
          {
            id: 'ps3',
            title: 'The Silent Kingdom',
            description: 'After a mysterious phenomenon renders most of humanity unable to speak, survivors develop new forms of communication while struggling to understand the event\'s cause.',
            genre: ['Drama', 'Mystery'],
            releaseYear: 2023,
            rating: 9.0,
            posterUrl: cinePosterImages[3],
            seasons: [{ id: 's1', title: 'Season 1', seasonNumber: 1, episodes: [] }],
            featured: false,
            createdAt: new Date()
          },
          {
            id: 'ps4',
            title: 'Parallel Lines',
            description: 'Two detectives from parallel universes, identical in appearance but opposite in personality, must work together when criminals begin crossing between realities.',
            genre: ['Crime', 'Sci-Fi'],
            releaseYear: 2021,
            rating: 8.5,
            posterUrl: cinePosterImages[4],
            seasons: [{ id: 's1', title: 'Season 1', seasonNumber: 1, episodes: [] }],
            featured: false,
            createdAt: new Date()
          }
        ];
        setTrendingSeries(placeholderSeriesList);
      } else {
        setFeaturedContent(placeholderMovie);
        setIsSeries(false);
        
        // Create placeholder movie list
        const placeholderMovies = [
          placeholderMovie,
          {
            id: 'pm2',
            title: 'Whispers of the Forest',
            description: 'When a documentary filmmaker ventures deep into an ancient forest to capture its beauty, she begins hearing voices in the fog that guide her toward a truth buried for centuries.',
            genre: ['Horror', 'Mystery'],
            releaseYear: 2023,
            rating: 8.9,
            duration: '2h 12m',
            posterUrl: cinePosterImages[1],
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            featured: false,
            createdAt: new Date()
          },
          {
            id: 'pm3',
            title: 'Desert\'s Ghost',
            description: 'In a vast desert landscape, a lone traveler encounters the specters of forgotten civilizations that reveal humanity\'s cyclical nature of rise and fall. An epic meditation on impermanence.',
            genre: ['Drama', 'Adventure'],
            releaseYear: 2022,
            rating: 8.8,
            duration: '2h 41m',
            posterUrl: cinePosterImages[2],
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            featured: false,
            createdAt: new Date()
          },
          {
            id: 'pm4',
            title: 'Fragments of Sky',
            description: 'After a cosmic event fractures the sky into mirror-like shards, society begins to unravel as each fragment reveals different possible futures. A physicist races to reunite the pieces before reality collapses.',
            genre: ['Sci-Fi', 'Drama'],
            releaseYear: 2021,
            rating: 8.5,
            duration: '2h 34m',
            posterUrl: cinePosterImages[3],
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            featured: false,
            createdAt: new Date()
          }
        ];
        setActionMovies(placeholderMovies);
      }
    }
  }, [loadingMovies, loadingSeries, featuredContent, cinePosterImages, theaterBackgrounds]);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      
      <main>
        <div className="relative h-[80vh] w-full">
          {showTrailer && featuredContent ? (
            <div className="absolute inset-0 bg-black z-10">
              {'videoUrl' in featuredContent ? (
                <VideoPlayer 
                  src={featuredContent.videoUrl}
                  poster={featuredContent.posterUrl}
                  onEnded={() => setShowTrailer(false)}
                  autoplay={true}
                />
              ) : (
                featuredContent.seasons?.[0]?.episodes?.[0]?.videoUrl ? (
                  <VideoPlayer 
                    src={featuredContent.seasons[0].episodes[0].videoUrl}
                    poster={featuredContent.posterUrl}
                    onEnded={() => setShowTrailer(false)}
                    autoplay={true}
                    movieTitle={`${featuredContent.title} - S1E1 ${featuredContent.seasons[0].episodes[0].title}`}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>No trailer available</p>
                  </div>
                )
              )}
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
                  src={featuredContent?.posterUrl || cinePosterImages[0]}
                  alt={featuredContent?.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
              </div>
              
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
                <div className="max-w-2xl">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">{featuredContent?.title || "RebAflix"}</h1>
                  <div className="flex items-center mb-4">
                    <span className="text-sm bg-red-600 px-2 py-1 rounded">Featured</span>
                    <span className="mx-2">•</span>
                    <span>{featuredContent?.releaseYear || "2023"}</span>
                    <span className="mx-2">•</span>
                    <span>{isSeries ? 
                      `${(featuredContent as Series)?.seasons?.length || 0} Season${(featuredContent as Series)?.seasons?.length !== 1 ? 's' : ''}` : 
                      (featuredContent as Movie)?.duration || "2h 15m"}</span>
                  </div>
                  <p className="text-lg text-gray-300 mb-6 line-clamp-3">{featuredContent?.description || "Experience the finest curated cinema collection with immersive storytelling and stunning visuals."}</p>
                  <div className="flex space-x-4">
                    <button 
                      className="btn-primary flex items-center"
                      onClick={() => setShowTrailer(true)}
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Watch Trailer
                    </button>
                    <Link to={isSeries ? 
                      `/series/${featuredContent?.id}` : 
                      `/movie/${featuredContent?.id}`
                    } className="btn-secondary">
                      More Info
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {trendingSeries.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Popular TV Series</h2>
                <Link to="/series" className="text-[#e50914] hover:underline flex items-center">
                  See all <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {trendingSeries.slice(0, 4).map(series => (
                  <SeriesCard key={series.id} series={series} />
                ))}
              </div>
            </section>
          )}
          
          {actionMovies.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Featured Movies</h2>
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
          )}
          
          <section className="mb-8">
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src={theaterBackgrounds[1]} 
                alt="Cinema experience" 
                className="w-full h-64 md:h-80 object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center">
                <div className="px-8 md:px-16 max-w-lg">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">Premium Entertainment Experience</h2>
                  <p className="text-gray-300 mb-6">Enjoy the highest quality streaming experience with theater-grade video and audio, for both movies and TV series.</p>
                  <div className="flex space-x-4">
                    <Link to="/movies" className="btn-primary">
                      Explore Movies
                    </Link>
                    <Link to="/series" className="btn-secondary">
                      Browse TV Series
                    </Link>
                  </div>
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
 
