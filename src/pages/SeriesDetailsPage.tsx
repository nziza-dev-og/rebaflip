import  { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Clock, Star, Play, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSeries } from '../hooks/useSeries';
import { Series, Episode } from '../types';
import VideoPlayer from '../components/VideoPlayer';

export default function SeriesDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { fetchSeriesById, seriesList } = useSeries();
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [relatedSeries, setRelatedSeries] = useState<Series[]>([]);
  const [expandedSeasons, setExpandedSeasons] = useState<number[]>([1]);
  
  useEffect(() => {
    const loadSeries = async () => {
      if (id) {
        setLoading(true);
        try {
          const fetchedSeries = await fetchSeriesById(id);
          console.log("Fetched series details:", fetchedSeries);
          setSeries(fetchedSeries);
          
          if (fetchedSeries?.seasons?.length) {
            setSelectedSeason(1);
            if (fetchedSeries.seasons[0]?.episodes?.length) {
              setSelectedEpisode(fetchedSeries.seasons[0].episodes[0]);
            }
          }
        } catch (err) {
          console.error("Error loading series:", err);
          setVideoError("Failed to load series details");
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadSeries();
  }, [id, fetchSeriesById]);
  
  useEffect(() => {
    if (series && seriesList.length > 0) {
      // Find related series based on genre
      const related = seriesList
        .filter(s => 
          s.id !== series.id && 
          s.genre.some(g => series.genre.includes(g))
        )
        .slice(0, 4);
      
      setRelatedSeries(related);
    }
  }, [series, seriesList]);
  
  const toggleSeasonExpand = (seasonNumber: number) => {
    setExpandedSeasons(prev => {
      if (prev.includes(seasonNumber)) {
        return prev.filter(num => num !== seasonNumber);
      } else {
        return [...prev, seasonNumber];
      }
    });
  };

  const handleEpisodeSelect = (episode: Episode) => {
    setSelectedEpisode(episode);
    setIsPlaying(true);
    setVideoError(null);
    window.scrollTo(0, 0);
  };

  const handleSeasonSelect = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    
    if (series) {
      const season = series.seasons.find(s => s.seasonNumber === seasonNumber);
      if (season && season.episodes?.length) {
        setSelectedEpisode(season.episodes[0]);
      } else {
        setSelectedEpisode(null);
      }
    }
    
    // Expand the selected season
    if (!expandedSeasons.includes(seasonNumber)) {
      setExpandedSeasons(prev => [...prev, seasonNumber]);
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

  if (!series) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Series Not Found</h1>
          <p className="mb-8">The series you're looking for doesn't exist or has been removed.</p>
          <Link to="/series" className="btn-primary">
            Back to Series
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
        {isPlaying && selectedEpisode ? (
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
                    Back to Series Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <VideoPlayer 
                  src={selectedEpisode.videoUrl}
                  poster={series.posterUrl}
                  onEnded={() => setIsPlaying(false)}
                  autoplay={true}
                  movieTitle={`${series.title} S${selectedSeason}E${selectedEpisode.episodeNumber} - ${selectedEpisode.title}`}
                />
                <div className="absolute top-4 left-4 z-10">
                  <button 
                    className="flex items-center text-white bg-black/50 hover:bg-black/70 px-4 py-2 rounded-full transition-colors"
                    onClick={() => setIsPlaying(false)}
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back
                  </button>
                </div>
                <div className="absolute top-4 right-4 bg-black/50 px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">
                    S{selectedSeason} | E{selectedEpisode.episodeNumber} - {selectedEpisode.title}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-[75vh] w-full">
            <div className="absolute inset-0">
              <img 
                src={series.bannerUrl || series.posterUrl} 
                alt={series.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://images.unsplash.com/photo-1580130775562-0ef92da028de?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB0diUyMHNlcmllcyUyMHBvc3RlciUyMGRhcmt8ZW58MHx8fHwxNzQ1OTkzMjU1fDA&ixlib=rb-4.0.3&fit=fillmax&h=900&w=600';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-black/50"></div>
            </div>
            
            <div className="absolute top-4 left-4 z-10">
              <Link to="/series" className="flex items-center text-white bg-black/50 hover:bg-black/70 px-4 py-2 rounded-full transition-colors">
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </Link>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
              <div className="max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{series.title}</h1>
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="bg-[#e50914] px-2 py-1 rounded text-sm">{series.releaseYear}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{series.rating}/10</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{series.seasons.length} {series.seasons.length === 1 ? 'Season' : 'Seasons'}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {series.genre.map((genre, index) => (
                    <Link 
                      key={index} 
                      to={`/series?genre=${genre}`}
                      className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
                
                <p className="text-gray-300 mb-8 max-w-2xl">{series.description}</p>
                
                {series.seasons.length > 0 && series.seasons[selectedSeason - 1]?.episodes?.length > 0 && (
                  <button 
                    className="btn-primary flex items-center"
                    onClick={() => {
                      if (series.seasons[selectedSeason - 1]?.episodes?.length > 0) {
                        setSelectedEpisode(series.seasons[selectedSeason - 1].episodes[0]);
                        setIsPlaying(true);
                      }
                    }}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Play S{selectedSeason} E1
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3 lg:w-1/4">
              <h2 className="text-2xl font-bold mb-6">Seasons</h2>
              <div className="bg-gray-900 rounded-lg overflow-hidden sticky top-20">
                {series.seasons.map(season => (
                  <button
                    key={season.seasonNumber}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between ${
                      selectedSeason === season.seasonNumber ? 'bg-[#e50914]/20 text-white' : 'hover:bg-gray-800/70'
                    } transition-colors`}
                    onClick={() => handleSeasonSelect(season.seasonNumber)}
                  >
                    <span className="font-medium">
                      Season {season.seasonNumber}
                      <span className="text-sm text-gray-400 ml-2">
                        ({season.episodes?.length || 0} episodes)
                      </span>
                    </span>
                    {selectedSeason === season.seasonNumber && (
                      <div className="h-2 w-2 rounded-full bg-[#e50914]"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="md:w-2/3 lg:w-3/4">
              <h2 className="text-2xl font-bold mb-6">Episodes</h2>
              
              {series.seasons.length === 0 ? (
                <div className="bg-gray-900 rounded-lg p-6 text-center">
                  <p className="text-gray-400">No episodes available for this series yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {series.seasons.map(season => (
                    <div key={season.seasonNumber} className={`bg-gray-900 rounded-lg overflow-hidden`}>
                      <button
                        className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-800"
                        onClick={() => toggleSeasonExpand(season.seasonNumber)}
                      >
                        <h3 className="text-xl font-medium">Season {season.seasonNumber}</h3>
                        {expandedSeasons.includes(season.seasonNumber) ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      
                      {expandedSeasons.includes(season.seasonNumber) && (
                        <div className="p-4 space-y-3">
                          {season.episodes.map(episode => (
                            <div 
                              key={episode.episodeNumber}
                              className={`p-4 rounded-lg ${
                                selectedEpisode?.id === episode.id && selectedSeason === season.seasonNumber
                                  ? 'bg-[#e50914]/10 border border-[#e50914]/40'
                                  : 'bg-gray-800/50 hover:bg-gray-800'
                              } cursor-pointer transition-colors`}
                              onClick={() => handleEpisodeSelect(episode)}
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-16 flex-shrink-0 rounded-md overflow-hidden">
                                  <img 
                                    src={episode.thumbnailUrl || series.posterUrl} 
                                    alt={episode.title}
                                    className="w-full aspect-video object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = 'https://images.unsplash.com/photo-1580130775562-0ef92da028de?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB0diUyMHNlcmllcyUyMHBvc3RlciUyMGRhcmt8ZW58MHx8fHwxNzQ1OTkzMjU1fDA&ixlib=rb-4.0.3&fit=fillmax&h=900&w=600';
                                    }}
                                  />
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">
                                      {episode.episodeNumber}. {episode.title}
                                    </h4>
                                    <span className="text-sm text-gray-400">{episode.duration}</span>
                                  </div>
                                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{episode.description}</p>
                                </div>
                                
                                <button className="flex-shrink-0 bg-[#e50914] hover:bg-[#c70812] p-2 rounded-full">
                                  <Play className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {relatedSeries.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedSeries.map(series => (
                <Link key={series.id} to={`/series/${series.id}`} className="block">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                    <img 
                      src={series.posterUrl} 
                      alt={series.title} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'https://images.unsplash.com/photo-1580130775562-0ef92da028de?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB0diUyMHNlcmllcyUyMHBvc3RlciUyMGRhcmt8ZW58MHx8fHwxNzQ1OTkzMjU1fDA&ixlib=rb-4.0.3&fit=fillmax&h=900&w=600';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                      <div>
                        <h3 className="font-medium text-lg">{series.title}</h3>
                        <p className="text-sm text-gray-300">{series.releaseYear} • {series.seasons?.length || 0} Seasons</p>
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
 
