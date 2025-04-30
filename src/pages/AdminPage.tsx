import  { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Film, Plus, Edit, Trash, Star, AlertCircle, Info, 
  Upload, X, Video, ChevronDown, ChevronUp, Check
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useMovies } from '../hooks/useMovies';
import { useSeries } from '../hooks/useSeries';
import { Movie, Series, Season, Episode } from '../types';
import FileUploadPreview from '../components/FileUploadPreview';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Movies state
  const { movies, loading: moviesLoading, fetchMovies, addMovie, updateMovie, deleteMovie, uploadMovieFile } = useMovies();
  
  // Series state
  const { seriesList, loading: seriesLoading, fetchAllSeries, addSeries, updateSeries, deleteSeries, uploadFile } = useSeries();
  
  const [activeTab, setActiveTab] = useState('movies');
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [isSeries, setIsSeries] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Movie form state
  const [movieFormData, setMovieFormData] = useState({
    title: '',
    description: '',
    genre: [] as string[],
    releaseYear: new Date().getFullYear(),
    rating: 0,
    duration: '',
    videoUrl: '',
    posterUrl: '',
    featured: false,
  });
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [movieFile, setMovieFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showLocalUpload, setShowLocalUpload] = useState(false);
  const movieFileInputRef = useRef<HTMLInputElement>(null);
  
  // Series form state
  const [seriesFormData, setSeriesFormData] = useState({
    title: '',
    description: '',
    genre: [] as string[],
    releaseYear: new Date().getFullYear(),
    rating: 0,
    posterUrl: '',
    bannerUrl: '',
    featured: false,
    seasons: [] as Season[]
  });
  const [seasonsExpanded, setSeasonsExpanded] = useState<number[]>([]);
  const [currentSeasonIndex, setCurrentSeasonIndex] = useState<number | null>(null);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number | null>(null);
  const [seriesPosterFile, setSeriesPosterFile] = useState<File | null>(null);
  const [seriesBannerFile, setSeriesBannerFile] = useState<File | null>(null);
  
  const [availableGenres] = useState([
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 
    'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Western', 'Animation',
    'Crime', 'Documentary', 'Family', 'War'
  ]);

  // Validate that the user is an admin
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch content on component mount
  useEffect(() => {
    fetchMovies();
    fetchAllSeries();
  }, [fetchMovies, fetchAllSeries]);

  // Update form data when editing a movie
  useEffect(() => {
    if (editingMovie) {
      setMovieFormData({
        title: editingMovie.title,
        description: editingMovie.description,
        genre: editingMovie.genre,
        releaseYear: editingMovie.releaseYear,
        rating: editingMovie.rating,
        duration: editingMovie.duration,
        videoUrl: editingMovie.videoUrl,
        posterUrl: editingMovie.posterUrl,
        featured: editingMovie.featured
      });
      setPosterPreview(editingMovie.posterUrl);
      setIsSeries(false);
    } else if (editingSeries) {
      setSeriesFormData({
        title: editingSeries.title,
        description: editingSeries.description,
        genre: editingSeries.genre,
        releaseYear: editingSeries.releaseYear,
        rating: editingSeries.rating,
        posterUrl: editingSeries.posterUrl,
        bannerUrl: editingSeries.bannerUrl || '',
        featured: editingSeries.featured,
        seasons: editingSeries.seasons || []
      });
      setSeasonsExpanded([]);
      setIsSeries(true);
    } else {
      resetForm();
    }
  }, [editingMovie, editingSeries]);

  const resetForm = () => {
    // Reset movie form
    setMovieFormData({
      title: '',
      description: '',
      genre: [],
      releaseYear: new Date().getFullYear(),
      rating: 0,
      duration: '',
      videoUrl: '',
      posterUrl: '',
      featured: false,
    });
    setPosterFile(null);
    setPosterPreview('');
    setMovieFile(null);
    setUploadProgress(0);
    setShowLocalUpload(false);
    
    // Reset series form
    setSeriesFormData({
      title: '',
      description: '',
      genre: [],
      releaseYear: new Date().getFullYear(),
      rating: 0,
      posterUrl: '',
      bannerUrl: '',
      featured: false,
      seasons: []
    });
    setSeriesPosterFile(null);
    setSeriesBannerFile(null);
    setSeasonsExpanded([]);
    setCurrentSeasonIndex(null);
    setCurrentEpisodeIndex(null);
    
    // Reset edit states
    setEditingMovie(null);
    setEditingSeries(null);
  };
  
  // Movie form handlers
  const handleMovieChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setMovieFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setMovieFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMovieGenreChange = (genre: string) => {
    setMovieFormData(prev => {
      if (prev.genre.includes(genre)) {
        return { ...prev, genre: prev.genre.filter(g => g !== genre) };
      } else {
        return { ...prev, genre: [...prev.genre, genre] };
      }
    });
  };
  
  const handlePosterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      
      // Create local preview
      const previewURL = URL.createObjectURL(file);
      setPosterPreview(previewURL);
    }
  };

  const handleMovieFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMovieFile(file);
      // Clear any previous videoUrl when uploading a file
      setMovieFormData(prev => ({ ...prev, videoUrl: '' }));
    }
  };

  const handleUploadClick = () => {
    if (movieFileInputRef.current) {
      movieFileInputRef.current.click();
    }
  };
  
  // Series form handlers
  const handleSeriesChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setSeriesFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setSeriesFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSeriesGenreChange = (genre: string) => {
    setSeriesFormData(prev => {
      if (prev.genre.includes(genre)) {
        return { ...prev, genre: prev.genre.filter(g => g !== genre) };
      } else {
        return { ...prev, genre: [...prev.genre, genre] };
      }
    });
  };
  
  const handleAddSeason = () => {
    setSeriesFormData(prev => {
      const newSeasonNumber = prev.seasons.length > 0 
        ? Math.max(...prev.seasons.map(s => s.seasonNumber)) + 1 
        : 1;
        
      const newSeason: Season = {
        id: `season-${Date.now()}`,
        title: `Season ${newSeasonNumber}`,
        seasonNumber: newSeasonNumber,
        episodes: []
      };
      
      const updatedSeasons = [...prev.seasons, newSeason];
      
      return {
        ...prev,
        seasons: updatedSeasons
      };
    });
    
    // Auto-expand the new season
    const newSeasonIndex = seriesFormData.seasons.length;
    setSeasonsExpanded(prev => [...prev, newSeasonIndex]);
    setCurrentSeasonIndex(newSeasonIndex);
    setCurrentEpisodeIndex(null);
  };
  
  const handleDeleteSeason = (seasonIndex: number) => {
    setSeriesFormData(prev => {
      const updatedSeasons = [...prev.seasons];
      updatedSeasons.splice(seasonIndex, 1);
      
      // Reorder season numbers
      updatedSeasons.forEach((season, idx) => {
        season.seasonNumber = idx + 1;
        season.title = `Season ${idx + 1}`;
      });
      
      return {
        ...prev,
        seasons: updatedSeasons
      };
    });
    
    // Update expanded and current season states
    setSeasonsExpanded(prev => prev.filter(idx => idx !== seasonIndex));
    if (currentSeasonIndex === seasonIndex) {
      setCurrentSeasonIndex(null);
      setCurrentEpisodeIndex(null);
    } else if (currentSeasonIndex && currentSeasonIndex > seasonIndex) {
      setCurrentSeasonIndex(currentSeasonIndex - 1);
    }
  };
  
  const handleSeasonChange = (seasonIndex: number, field: string, value: any) => {
    setSeriesFormData(prev => {
      const updatedSeasons = [...prev.seasons];
      updatedSeasons[seasonIndex] = {
        ...updatedSeasons[seasonIndex],
        [field]: value
      };
      
      return {
        ...prev,
        seasons: updatedSeasons
      };
    });
  };
  
  const handleAddEpisode = (seasonIndex: number) => {
    setSeriesFormData(prev => {
      const updatedSeasons = [...prev.seasons];
      const season = updatedSeasons[seasonIndex];
      
      const newEpisodeNumber = season.episodes?.length > 0 
        ? Math.max(...season.episodes.map(e => e.episodeNumber)) + 1 
        : 1;
        
      const newEpisode: Episode = {
        id: `episode-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: `Episode ${newEpisodeNumber}`,
        description: '',
        episodeNumber: newEpisodeNumber,
        videoUrl: '',
        duration: '45m'
      };
      
      if (!season.episodes) {
        season.episodes = [];
      }
      
      season.episodes.push(newEpisode);
      
      return {
        ...prev,
        seasons: updatedSeasons
      };
    });
    
    // Set the current episode to the newly added one
    setCurrentSeasonIndex(seasonIndex);
    setCurrentEpisodeIndex(seriesFormData.seasons[seasonIndex].episodes?.length || 0);
  };
  
  const handleEpisodeChange = (seasonIndex: number, episodeIndex: number, field: string, value: any) => {
    setSeriesFormData(prev => {
      const updatedSeasons = [...prev.seasons];
      const episodes = [...updatedSeasons[seasonIndex].episodes];
      
      episodes[episodeIndex] = {
        ...episodes[episodeIndex],
        [field]: value
      };
      
      updatedSeasons[seasonIndex] = {
        ...updatedSeasons[seasonIndex],
        episodes
      };
      
      return {
        ...prev,
        seasons: updatedSeasons
      };
    });
  };
  
  const handleDeleteEpisode = (seasonIndex: number, episodeIndex: number) => {
    setSeriesFormData(prev => {
      const updatedSeasons = [...prev.seasons];
      const episodes = [...updatedSeasons[seasonIndex].episodes];
      
      episodes.splice(episodeIndex, 1);
      
      // Reorder episode numbers
      episodes.forEach((episode, idx) => {
        episode.episodeNumber = idx + 1;
        if (episode.title.startsWith('Episode ')) {
          episode.title = `Episode ${idx + 1}`;
        }
      });
      
      updatedSeasons[seasonIndex] = {
        ...updatedSeasons[seasonIndex],
        episodes
      };
      
      return {
        ...prev,
        seasons: updatedSeasons
      };
    });
    
    // Update current episode state
    if (currentSeasonIndex === seasonIndex && currentEpisodeIndex === episodeIndex) {
      setCurrentEpisodeIndex(null);
    } else if (currentSeasonIndex === seasonIndex && currentEpisodeIndex && currentEpisodeIndex > episodeIndex) {
      setCurrentEpisodeIndex(currentEpisodeIndex - 1);
    }
  };
  
  const toggleSeasonExpanded = (seasonIndex: number) => {
    setSeasonsExpanded(prev => {
      if (prev.includes(seasonIndex)) {
        return prev.filter(idx => idx !== seasonIndex);
      } else {
        return [...prev, seasonIndex];
      }
    });
  };

  // Form validation
  const validateMovieForm = () => {
    if (!movieFormData.title.trim()) {
      setError('Movie title is required');
      return false;
    }
    
    if (!movieFormData.description.trim()) {
      setError('Movie description is required');
      return false;
    }
    
    if (movieFormData.genre.length === 0) {
      setError('Select at least one genre');
      return false;
    }
    
    if (!movieFormData.duration.trim()) {
      setError('Movie duration is required');
      return false;
    }
    
    // Require either a videoUrl or a movie file
    if (!movieFormData.videoUrl.trim() && !movieFile) {
      setError('Please provide either a video URL or upload a movie file');
      return false;
    }
    
    // For new movies, require either a poster file or direct URL
    if (!editingMovie && !posterFile && !movieFormData.posterUrl.trim()) {
      setError('Please upload a poster image or provide a URL');
      return false;
    }
    
    return true;
  };
  
  const validateSeriesForm = () => {
    if (!seriesFormData.title.trim()) {
      setError('Series title is required');
      return false;
    }
    
    if (!seriesFormData.description.trim()) {
      setError('Series description is required');
      return false;
    }
    
    if (seriesFormData.genre.length === 0) {
      setError('Select at least one genre');
      return false;
    }
    
    // For new series, require either a poster file or direct URL
    if (!editingSeries && !seriesPosterFile && !seriesFormData.posterUrl.trim()) {
      setError('Please upload a poster image or provide a URL');
      return false;
    }
    
    // Validate seasons
    if (seriesFormData.seasons.length === 0) {
      setError('Please add at least one season');
      return false;
    }
    
    // Validate that at least one season has at least one episode
    const hasEpisodes = seriesFormData.seasons.some(season => 
      season.episodes && season.episodes.length > 0
    );
    
    if (!hasEpisodes) {
      setError('Please add at least one episode to a season');
      return false;
    }
    
    return true;
  };
  
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Form submission handlers
  const handleMovieSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    if (!validateMovieForm()) {
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Define a function to handle upload progress
      const onProgress = (progress: number) => {
        setUploadProgress(progress);
      };
      
      // If a movie file is selected, upload it to storage first
      let finalVideoUrl = movieFormData.videoUrl;
      if (movieFile) {
        const uploadedUrl = await uploadMovieFile(movieFile, movieFormData.title, onProgress);
        if (uploadedUrl) {
          finalVideoUrl = uploadedUrl;
        } else {
          throw new Error('Failed to upload movie file');
        }
      }
      
      if (editingMovie) {
        // Updating existing movie
        const success = await updateMovie(editingMovie.id, {
          ...movieFormData,
          videoUrl: finalVideoUrl,
          posterUrl: movieFormData.posterUrl || posterPreview // Use existing preview if no new URL
        });
        
        if (success) {
          setSuccess('Movie updated successfully');
          setShowForm(false);
          resetForm();
        }
      } else {
        // Adding new movie
        const posterUrl = movieFormData.posterUrl || 
                        "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&h=900";
        
        const dummyFile = new File([""], "poster.jpg", { type: "image/jpeg" });
        const newMovie = await addMovie({
          ...movieFormData,
          videoUrl: finalVideoUrl,
          posterUrl
        }, posterFile || dummyFile);
        
        if (newMovie) {
          setSuccess('Movie added successfully');
          setShowForm(false);
          resetForm();
        }
      }
    } catch (err: any) {
      setError('Failed to save movie: ' + err.message);
      console.error(err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleSeriesSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    if (!validateSeriesForm()) {
      return;
    }
    
    try {
      setIsUploading(true);
      
      let posterUrl = seriesFormData.posterUrl;
      let bannerUrl = seriesFormData.bannerUrl;
      
      // Upload poster file if provided
      if (seriesPosterFile) {
        const uploadedPosterUrl = await uploadFile(seriesPosterFile, 'series_posters', (progress) => {
          setUploadProgress(progress);
        });
        
        if (uploadedPosterUrl) {
          posterUrl = uploadedPosterUrl;
        }
      }
      
      // Upload banner file if provided
      if (seriesBannerFile) {
        const uploadedBannerUrl = await uploadFile(seriesBannerFile, 'series_banners', (progress) => {
          setUploadProgress(progress);
        });
        
        if (uploadedBannerUrl) {
          bannerUrl = uploadedBannerUrl;
        }
      }
      
      if (editingSeries) {
        // Update existing series
        const success = await updateSeries(editingSeries.id, {
          ...seriesFormData,
          posterUrl,
          bannerUrl
        });
        
        if (success) {
          setSuccess('Series updated successfully');
          setShowForm(false);
          resetForm();
        }
      } else {
        // Add new series
        const newSeries = await addSeries({
          ...seriesFormData,
          posterUrl,
          bannerUrl
        }, seriesPosterFile);
        
        if (newSeries) {
          setSuccess('Series added successfully');
          setShowForm(false);
          resetForm();
        }
      }
    } catch (err: any) {
      setError('Failed to save series: ' + err.message);
      console.error(err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleFormSubmit = (e: FormEvent) => {
    if (isSeries) {
      handleSeriesSubmit(e);
    } else {
      handleMovieSubmit(e);
    }
  };

  // Edit and delete handlers
  const handleEditMovie = (movie: Movie) => {
    setEditingMovie(movie);
    setEditingSeries(null);
    setIsSeries(false);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditSeries = (series: Series) => {
    setEditingSeries(series);
    setEditingMovie(null);
    setIsSeries(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteMovie = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        const success = await deleteMovie(id);
        if (success) {
          setSuccess('Movie deleted successfully');
        }
      } catch (err: any) {
        setError('Failed to delete movie: ' + err.message);
        console.error(err);
      }
    }
  };

  const handleDeleteSeries = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this series?')) {
      try {
        const success = await deleteSeries(id);
        if (success) {
          setSuccess('Series deleted successfully');
        }
      } catch (err: any) {
        setError('Failed to delete series: ' + err.message);
        console.error(err);
      }
    }
  };

  const clearMovieFile = () => {
    setMovieFile(null);
    if (movieFileInputRef.current) {
      movieFileInputRef.current.value = '';
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          
          <button 
            className="btn-primary flex items-center"
            onClick={() => {
              setShowForm(!showForm);
              setEditingMovie(null);
              setEditingSeries(null);
              resetForm();
            }}
          >
            {showForm ? 'Cancel' : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Add Content
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-white px-4 py-3 rounded mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/50 border border-green-700 text-white px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}
        
        {showForm && (
          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">
                {editingMovie ? 'Edit Movie' : editingSeries ? 'Edit Series' : 'Add New Content'}
              </h2>
              
              {!editingMovie && !editingSeries && (
                <div className="flex space-x-4 mb-6">
                  <button 
                    className={`px-4 py-2 rounded-full ${!isSeries ? 'bg-[#e50914] text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    onClick={() => setIsSeries(false)}
                  >
                    <Film className="h-5 w-5 inline mr-2" />
                    Movie
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-full ${isSeries ? 'bg-[#e50914] text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    onClick={() => setIsSeries(true)}
                  >
                    <Video className="h-5 w-5 inline mr-2" />
                    TV Series
                  </button>
                </div>
              )}
            </div>
            
            <form onSubmit={handleFormSubmit}>
              {!isSeries ? (
                // Movie Form
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium">
                        Title*
                      </label>
                      <input
                        type="text"
                        name="title"
                        className="input-field"
                        value={movieFormData.title}
                        onChange={handleMovieChange}
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium">
                        Description*
                      </label>
                      <textarea
                        name="description"
                        rows={5}
                        className="input-field resize-none"
                        value={movieFormData.description}
                        onChange={handleMovieChange}
                        required
                      ></textarea>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium">
                        Genres*
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableGenres.map(genre => (
                          <button
                            key={genre}
                            type="button"
                            className={`px-3 py-1 rounded-full text-sm ${
                              movieFormData.genre.includes(genre) 
                                ? 'bg-[#e50914] text-white' 
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                            onClick={() => handleMovieGenreChange(genre)}
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          Release Year*
                        </label>
                        <input
                          type="number"
                          name="releaseYear"
                          className="input-field"
                          value={movieFormData.releaseYear}
                          onChange={handleMovieChange}
                          min="1900"
                          max={new Date().getFullYear() + 5}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          Duration*
                        </label>
                        <input
                          type="text"
                          name="duration"
                          className="input-field"
                          value={movieFormData.duration}
                          onChange={handleMovieChange}
                          placeholder="e.g. 2h 30m"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium">
                        Rating (0-10)
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="rating"
                          className="input-field"
                          value={movieFormData.rating}
                          onChange={handleMovieChange}
                          min="0"
                          max="10"
                          step="0.1"
                        />
                        <Star className="h-5 w-5 text-yellow-400 ml-2" />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="featured"
                          name="featured"
                          className="h-4 w-4 text-[#e50914] focus:ring-[#e50914] border-gray-600 rounded"
                          checked={movieFormData.featured}
                          onChange={handleMovieChange}
                        />
                        <label htmlFor="featured" className="ml-2 text-sm font-medium">
                          Featured Movie (appears on homepage)
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Poster Image*
                    </label>
                    
                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg h-80 overflow-hidden">
                        {posterPreview ? (
                          <img 
                            src={posterPreview} 
                            alt="Poster preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <Film className="mx-auto h-12 w-12 text-gray-500" />
                            <p className="mt-2 text-sm text-gray-500">
                              Upload poster image or provide URL
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">
                          Poster URL
                        </label>
                        <input
                          type="url"
                          name="posterUrl"
                          className="input-field"
                          value={movieFormData.posterUrl}
                          onChange={handleMovieChange}
                          placeholder="https://example.com/poster.jpg"
                        />
                        <p className="text-xs text-gray-400 mt-1">Enter direct URL to movie poster image</p>
                      </div>
                      
                      <p className="mb-2 text-sm font-medium">Or upload image:</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterChange}
                        className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                      />
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Movie Video*</h3>
                      
                      <div className="flex mb-4">
                        <button
                          type="button"
                          className={`flex-1 py-2 text-center ${!showLocalUpload ? 'bg-[#e50914] text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                          onClick={() => setShowLocalUpload(false)}
                        >
                          External URL
                        </button>
                        <button
                          type="button"
                          className={`flex-1 py-2 text-center ${showLocalUpload ? 'bg-[#e50914] text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                          onClick={() => setShowLocalUpload(true)}
                        >
                          Upload Video
                        </button>
                      </div>
                      
                      {!showLocalUpload ? (
                        <div className="mb-4">
                          <label className="block mb-2 text-sm font-medium">
                            Video URL
                          </label>
                          <input
                            type="url"
                            name="videoUrl"
                            className="input-field"
                            value={movieFormData.videoUrl}
                            onChange={handleMovieChange}
                            placeholder="https://example.com/video.mp4"
                          />
                          <div className="flex items-center mt-1 text-xs text-gray-400">
                            <Info className="h-3 w-3 mr-1" />
                            <span>Use direct video URLs or YouTube links</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4">
                          {movieFile ? (
                            <div className="p-4 bg-gray-800 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium truncate max-w-xs">{movieFile.name}</span>
                                <button 
                                  type="button" 
                                  className="text-gray-400 hover:text-white"
                                  onClick={clearMovieFile}
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                              <div className="flex items-center text-sm text-gray-400">
                                <span className="mr-2">{(movieFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                                <span>{movieFile.type}</span>
                              </div>
                              
                              {isUploading && (
                                <div className="mt-2">
                                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-[#e50914] transition-all duration-300"
                                      style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                  </div>
                                  <div className="flex justify-between mt-1 text-xs">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                              <input
                                ref={movieFileInputRef}
                                type="file"
                                accept="video/*"
                                onChange={handleMovieFileChange}
                                className="hidden"
                              />
                              <Upload className="mx-auto h-12 w-12 text-gray-500 mb-2" />
                              <p className="text-sm text-gray-400 mb-2">
                                Drag and drop your video file here or click to browse
                              </p>
                              <button
                                type="button"
                                onClick={handleUploadClick}
                                className="btn-secondary text-sm"
                              >
                                Browse files
                              </button>
                            </div>
                          )}
                          <p className="mt-2 text-xs text-gray-400">
                            Supported formats: MP4, WebM, MOV (max 2GB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Series Form
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium">
                        Series Title*
                      </label>
                      <input
                        type="text"
                        name="title"
                        className="input-field"
                        value={seriesFormData.title}
                        onChange={handleSeriesChange}
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium">
                        Description*
                      </label>
                      <textarea
                        name="description"
                        rows={5}
                        className="input-field resize-none"
                        value={seriesFormData.description}
                        onChange={handleSeriesChange}
                        required
                      ></textarea>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium">
                        Genres*
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableGenres.map(genre => (
                          <button
                            key={genre}
                            type="button"
                            className={`px-3 py-1 rounded-full text-sm ${
                              seriesFormData.genre.includes(genre) 
                                ? 'bg-[#e50914] text-white' 
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                            onClick={() => handleSeriesGenreChange(genre)}
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          Release Year*
                        </label>
                        <input
                          type="number"
                          name="releaseYear"
                          className="input-field"
                          value={seriesFormData.releaseYear}
                          onChange={handleSeriesChange}
                          min="1900"
                          max={new Date().getFullYear() + 5}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          Rating (0-10)
                        </label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            name="rating"
                            className="input-field"
                            value={seriesFormData.rating}
                            onChange={handleSeriesChange}
                            min="0"
                            max="10"
                            step="0.1"
                          />
                          <Star className="h-5 w-5 text-yellow-400 ml-2" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="seriesFeatured"
                          name="featured"
                          className="h-4 w-4 text-[#e50914] focus:ring-[#e50914] border-gray-600 rounded"
                          checked={seriesFormData.featured}
                          onChange={handleSeriesChange}
                        />
                        <label htmlFor="seriesFeatured" className="ml-2 text-sm font-medium">
                          Featured Series (appears on homepage)
                        </label>
                      </div>
                    </div>
                    
                    {/* Series Images */}
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-2">Series Images</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            Poster Image*
                          </label>
                          <div className="mb-4">
                            <input
                              type="url"
                              name="posterUrl"
                              className="input-field"
                              value={seriesFormData.posterUrl}
                              onChange={handleSeriesChange}
                              placeholder="https://example.com/poster.jpg"
                            />
                            <p className="text-xs text-gray-400 mt-1">Enter URL or upload below</p>
                          </div>
                          
                          <FileUploadPreview
                            accept="image/*"
                            onChange={setSeriesPosterFile}
                            value={seriesPosterFile}
                            label="Upload Poster"
                            fileTypes="JPG, PNG (max 2MB)"
                            isImage={true}
                          />
                          
                          <div className="aspect-[2/3] w-full h-40 bg-gray-800 rounded-lg overflow-hidden">
                            {seriesPosterFile ? (
                              <img 
                                src={URL.createObjectURL(seriesPosterFile)} 
                                alt="Poster preview" 
                                className="w-full h-full object-cover" 
                              />
                            ) : seriesFormData.posterUrl ? (
                              <img 
                                src={seriesFormData.posterUrl} 
                                alt="Poster preview" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = 'https://images.unsplash.com/photo-1580130775562-0ef92da028de?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB0diUyMHNlcmllcyUyMHBvc3RlciUyMGRhcmt8ZW58MHx8fHwxNzQ1OTkzMjU1fDA&ixlib=rb-4.0.3';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-gray-500">Poster Preview</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            Banner Image (optional)
                          </label>
                          <div className="mb-4">
                            <input
                              type="url"
                              name="bannerUrl"
                              className="input-field"
                              value={seriesFormData.bannerUrl}
                              onChange={handleSeriesChange}
                              placeholder="https://example.com/banner.jpg"
                            />
                            <p className="text-xs text-gray-400 mt-1">Enter URL or upload below</p>
                          </div>
                          
                          <FileUploadPreview
                            accept="image/*"
                            onChange={setSeriesBannerFile}
                            value={seriesBannerFile}
                            label="Upload Banner"
                            fileTypes="JPG, PNG, landscape orientation"
                            isImage={true}
                          />
                          
                          <div className="aspect-video w-full bg-gray-800 rounded-lg overflow-hidden">
                            {seriesBannerFile ? (
                              <img 
                                src={URL.createObjectURL(seriesBannerFile)} 
                                alt="Banner preview" 
                                className="w-full h-full object-cover" 
                              />
                            ) : seriesFormData.bannerUrl ? (
                              <img 
                                src={seriesFormData.bannerUrl} 
                                alt="Banner preview" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxkYXJrJTIwY2luZW1hJTIwbW92aWUlMjB0aGVhdGVyfGVufDB8fHx8MTc0NTY1MTQ2MHww&ixlib=rb-4.0.3';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-gray-500">Banner Preview</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Seasons & Episodes</h3>
                      <button 
                        type="button"
                        className="btn-primary text-sm py-1"
                        onClick={handleAddSeason}
                      >
                        <Plus className="h-4 w-4 inline mr-1" /> Add Season
                      </button>
                    </div>
                    
                    {seriesFormData.seasons.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                        <Video className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                        <p className="text-gray-400 mb-3">No seasons added yet</p>
                        <button 
                          type="button" 
                          className="btn-secondary text-sm"
                          onClick={handleAddSeason}
                        >
                          Add First Season
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {seriesFormData.seasons.map((season, seasonIndex) => (
                          <div 
                            key={season.id || seasonIndex}
                            className="bg-gray-800 rounded-lg overflow-hidden"
                          >
                            <div className="p-4 bg-gray-700 flex justify-between items-center">
                              <input 
                                type="text"
                                value={season.title}
                                className="bg-transparent border-none focus:ring-0 font-medium"
                                onChange={(e) => handleSeasonChange(seasonIndex, 'title', e.target.value)}
                              />
                              <div className="flex items-center space-x-2">
                                <button 
                                  type="button"
                                  className="p-1 hover:text-white"
                                  onClick={() => toggleSeasonExpanded(seasonIndex)}
                                >
                                  {seasonsExpanded.includes(seasonIndex) ? (
                                    <ChevronUp className="h-5 w-5" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5" />
                                  )}
                                </button>
                                <button 
                                  type="button"
                                  className="p-1 hover:text-red-500"
                                  onClick={() => handleDeleteSeason(seasonIndex)}
                                >
                                  <Trash className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                            
                            {seasonsExpanded.includes(seasonIndex) && (
                              <div className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-sm font-medium text-gray-300">Episodes</h4>
                                  <button 
                                    type="button"
                                    className="text-sm text-[#e50914] hover:underline flex items-center"
                                    onClick={() => handleAddEpisode(seasonIndex)}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add Episode
                                  </button>
                                </div>
                                
                                {season.episodes?.length === 0 ? (
                                  <div className="border border-dashed border-gray-700 rounded p-4 text-center">
                                    <p className="text-sm text-gray-400 mb-2">No episodes added yet</p>
                                    <button 
                                      type="button" 
                                      className="text-sm text-[#e50914] hover:underline"
                                      onClick={() => handleAddEpisode(seasonIndex)}
                                    >
                                      Add first episode
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {season.episodes?.map((episode, episodeIndex) => (
                                      <div 
                                        key={episode.id || episodeIndex}
                                        className={`p-3 rounded ${
                                          currentSeasonIndex === seasonIndex && currentEpisodeIndex === episodeIndex
                                            ? 'bg-gray-700'
                                            : 'bg-gray-800/50 hover:bg-gray-700/70'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center">
                                            <span className="text-gray-400 mr-2">{episode.episodeNumber}.</span>
                                            <input 
                                              type="text"
                                              value={episode.title}
                                              className="bg-transparent border-none focus:ring-0 font-medium text-sm"
                                              onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'title', e.target.value)}
                                            />
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <button 
                                              type="button"
                                              className={`text-xs p-1 px-2 rounded ${
                                                currentSeasonIndex === seasonIndex && currentEpisodeIndex === episodeIndex
                                                  ? 'bg-[#e50914] text-white'
                                                  : 'bg-gray-700 hover:bg-[#e50914]/70'
                                              }`}
                                              onClick={() => {
                                                setCurrentSeasonIndex(seasonIndex);
                                                setCurrentEpisodeIndex(episodeIndex);
                                              }}
                                            >
                                              Edit
                                            </button>
                                            <button 
                                              type="button"
                                              className="text-xs p-1 text-gray-400 hover:text-red-500"
                                              onClick={() => handleDeleteEpisode(seasonIndex, episodeIndex)}
                                            >
                                              <Trash className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Episode Edit Panel */}
                    {currentSeasonIndex !== null && currentEpisodeIndex !== null && (
                      <div className="mt-6 bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium">Edit Episode</h3>
                          <button 
                            type="button"
                            className="text-sm text-gray-300 hover:text-white"
                            onClick={() => {
                              setCurrentSeasonIndex(null);
                              setCurrentEpisodeIndex(null);
                            }}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        
                        {seriesFormData.seasons[currentSeasonIndex]?.episodes[currentEpisodeIndex] && (
                          <div className="space-y-3">
                            <div>
                              <label className="block mb-1 text-sm font-medium">
                                Episode Title
                              </label>
                              <input
                                type="text"
                                className="input-field"
                                value={seriesFormData.seasons[currentSeasonIndex].episodes[currentEpisodeIndex].title}
                                onChange={(e) => handleEpisodeChange(
                                  currentSeasonIndex, 
                                  currentEpisodeIndex, 
                                  'title', 
                                  e.target.value
                                )}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block mb-1 text-sm font-medium">
                                  Episode Number
                                </label>
                                <input
                                  type="number"
                                  className="input-field"
                                  value={seriesFormData.seasons[currentSeasonIndex].episodes[currentEpisodeIndex].episodeNumber}
                                  onChange={(e) => handleEpisodeChange(
                                    currentSeasonIndex, 
                                    currentEpisodeIndex, 
                                    'episodeNumber', 
                                    parseInt(e.target.value)
                                  )}
                                  min="1"
                                />
                              </div>
                              
                              <div>
                                <label className="block mb-1 text-sm font-medium">
                                  Duration
                                </label>
                                <input
                                  type="text"
                                  className="input-field"
                                  value={seriesFormData.seasons[currentSeasonIndex].episodes[currentEpisodeIndex].duration || ''}
                                  onChange={(e) => handleEpisodeChange(
                                    currentSeasonIndex, 
                                    currentEpisodeIndex, 
                                    'duration', 
                                    e.target.value
                                  )}
                                  placeholder="e.g. 45m"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block mb-1 text-sm font-medium">
                                Description
                              </label>
                              <textarea
                                className="input-field resize-none"
                                rows={3}
                                value={seriesFormData.seasons[currentSeasonIndex].episodes[currentEpisodeIndex].description || ''}
                                onChange={(e) => handleEpisodeChange(
                                  currentSeasonIndex, 
                                  currentEpisodeIndex, 
                                  'description', 
                                  e.target.value
                                )}
                              ></textarea>
                            </div>
                            
                            <div>
                              <label className="block mb-1 text-sm font-medium">
                                Video URL
                              </label>
                              <input
                                type="url"
                                className="input-field"
                                value={seriesFormData.seasons[currentSeasonIndex].episodes[currentEpisodeIndex].videoUrl || ''}
                                onChange={(e) => handleEpisodeChange(
                                  currentSeasonIndex, 
                                  currentEpisodeIndex, 
                                  'videoUrl', 
                                  e.target.value
                                )}
                                placeholder="https://example.com/video.mp4"
                              />
                              <div className="flex items-center mt-1 text-xs text-gray-400">
                                <Info className="h-3 w-3 mr-1" />
                                <span>Use direct video URLs or YouTube links</span>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block mb-1 text-sm font-medium">
                                Thumbnail URL (optional)
                              </label>
                              <input
                                type="url"
                                className="input-field"
                                value={seriesFormData.seasons[currentSeasonIndex].episodes[currentEpisodeIndex].thumbnailUrl || ''}
                                onChange={(e) => handleEpisodeChange(
                                  currentSeasonIndex, 
                                  currentEpisodeIndex, 
                                  'thumbnailUrl', 
                                  e.target.value
                                )}
                                placeholder="https://example.com/thumbnail.jpg"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  className="btn-secondary mr-4"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <span className="flex items-center">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      {editingMovie || editingSeries ? 'Updating...' : 'Uploading...'}
                    </span>
                  ) : (
                    editingMovie ? 'Update Movie' : 
                    editingSeries ? 'Update Series' :
                    isSeries ? 'Add Series' : 'Add Movie'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Content Management Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-800">
            <div className="flex -mb-px">
              <button
                className={`py-4 px-6 text-center ${
                  activeTab === 'movies' 
                    ? 'border-b-2 border-[#e50914] text-white' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                onClick={() => setActiveTab('movies')}
              >
                Movies
              </button>
              <button
                className={`py-4 px-6 text-center ${
                  activeTab === 'series' 
                    ? 'border-b-2 border-[#e50914] text-white' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                onClick={() => setActiveTab('series')}
              >
                TV Series
              </button>
            </div>
          </div>
        </div>
        
        {activeTab === 'movies' ? (
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <h2 className="text-xl font-bold p-6 border-b border-gray-800">Movie List</h2>
            
            {moviesLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e50914]"></div>
              </div>
            ) : movies.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black bg-opacity-50 text-left">
                    <tr>
                      <th className="p-4">Title</th>
                      <th className="p-4">Release Year</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Featured</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movies.map(movie => (
                      <tr key={movie.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                        <td className="p-4">
                          <div className="flex items-center">
                            <img 
                              src={movie.posterUrl} 
                              alt={movie.title}
                              className="w-12 h-16 object-cover rounded mr-3" 
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=100&h=140';
                              }}
                            />
                            <span className="font-medium">{movie.title}</span>
                          </div>
                        </td>
                        <td className="p-4">{movie.releaseYear}</td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            {movie.rating}
                          </div>
                        </td>
                        <td className="p-4">
                          {movie.featured ? (
                            <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded-full text-xs">
                              Featured
                            </span>
                          ) : (
                            <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded-full text-xs">
                              Regular
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button 
                              className="text-blue-400 hover:text-blue-300"
                              onClick={() => handleEditMovie(movie)}
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button 
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleDeleteMovie(movie.id)}
                            >
                              <Trash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Film className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">No movies found</h3>
                <p className="text-gray-400 mb-4">Get started by adding your first movie</p>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setShowForm(true);
                    setIsSeries(false);
                  }}
                >
                  <Plus className="h-5 w-5 mr-2 inline-block" />
                  Add Movie
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <h2 className="text-xl font-bold p-6 border-b border-gray-800">TV Series List</h2>
            
            {seriesLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e50914]"></div>
              </div>
            ) : seriesList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black bg-opacity-50 text-left">
                    <tr>
                      <th className="p-4">Title</th>
                      <th className="p-4">Release Year</th>
                      <th className="p-4">Seasons</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Featured</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seriesList.map(series => (
                      <tr key={series.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                        <td className="p-4">
                          <div className="flex items-center">
                            <img 
                              src={series.posterUrl} 
                              alt={series.title}
                              className="w-12 h-16 object-cover rounded mr-3" 
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = 'https://images.unsplash.com/photo-1580130775562-0ef92da028de?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB0diUyMHNlcmllcyUyMHBvc3RlciUyMGRhcmt8ZW58MHx8fHwxNzQ1OTkzMjU1fDA&ixlib=rb-4.0.3';
                              }}
                            />
                            <span className="font-medium">{series.title}</span>
                          </div>
                        </td>
                        <td className="p-4">{series.releaseYear}</td>
                        <td className="p-4">
                          {series.seasons?.length || 0} {(series.seasons?.length || 0) === 1 ? 'Season' : 'Seasons'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            {series.rating}
                          </div>
                        </td>
                        <td className="p-4">
                          {series.featured ? (
                            <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded-full text-xs">
                              Featured
                            </span>
                          ) : (
                            <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded-full text-xs">
                              Regular
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button 
                              className="text-blue-400 hover:text-blue-300"
                              onClick={() => handleEditSeries(series)}
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button 
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleDeleteSeries(series.id)}
                            >
                              <Trash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Video className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">No TV series found</h3>
                <p className="text-gray-400 mb-4">Get started by adding your first TV series</p>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setShowForm(true);
                    setIsSeries(true);
                  }}
                >
                  <Plus className="h-5 w-5 mr-2 inline-block" />
                  Add TV Series
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
 
