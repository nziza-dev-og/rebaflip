import  { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Plus, Edit, Trash, Star, AlertCircle, Info, Upload, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useMovies } from '../hooks/useMovies';
import { Movie } from '../types';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { movies, loading, fetchMovies, addMovie, updateMovie, deleteMovie, uploadMovieFile } = useMovies();
  
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [formData, setFormData] = useState({
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // File upload states
  const [movieFile, setMovieFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showLocalUpload, setShowLocalUpload] = useState(false);
  
  const movieFileInputRef = useRef<HTMLInputElement>(null);
  
  const [availableGenres] = useState([
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 
    'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Western', 'Animation'
  ]);

  // Validate that the user is an admin
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch movies on component mount
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Update form data when editing a movie
  useEffect(() => {
    if (editingMovie) {
      setFormData({
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
    } else {
      resetForm();
    }
  }, [editingMovie]);

  const resetForm = () => {
    setFormData({
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
    setEditingMovie(null);
    setMovieFile(null);
    setUploadProgress(0);
    setShowLocalUpload(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGenreChange = (genre: string) => {
    setFormData(prev => {
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
      setFormData(prev => ({ ...prev, videoUrl: '' }));
    }
  };

  const handleUploadClick = () => {
    if (movieFileInputRef.current) {
      movieFileInputRef.current.click();
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Movie title is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Movie description is required');
      return false;
    }
    
    if (formData.genre.length === 0) {
      setError('Select at least one genre');
      return false;
    }
    
    if (!formData.duration.trim()) {
      setError('Movie duration is required');
      return false;
    }
    
    // Require either a videoUrl or a movie file
    if (!formData.videoUrl.trim() && !movieFile) {
      setError('Please provide either a video URL or upload a movie file');
      return false;
    }
    
    // For new movies, require either a poster file or direct URL
    if (!editingMovie && !posterFile && !formData.posterUrl.trim()) {
      setError('Please upload a poster image or provide a URL');
      return false;
    }
    
    // For URL validation of posterUrl (if provided)
    if (formData.posterUrl.trim() && !isValidUrl(formData.posterUrl)) {
      setError('Poster URL is not valid');
      return false;
    }
    
    // For URL validation of videoUrl (if provided and not uploading a file)
    if (formData.videoUrl.trim() && !isValidUrl(formData.videoUrl) && !movieFile) {
      setError('Video URL is not valid');
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Define a function to handle upload progress
      const onProgress = (progress: number) => {
        setUploadProgress(progress);
      };
      
      // If a movie file is selected, upload it to storage first
      let finalVideoUrl = formData.videoUrl;
      if (movieFile) {
        const uploadedUrl = await uploadMovieFile(movieFile, formData.title, onProgress);
        if (uploadedUrl) {
          finalVideoUrl = uploadedUrl;
        } else {
          throw new Error('Failed to upload movie file');
        }
      }
      
      if (editingMovie) {
        // Updating existing movie
        const success = await updateMovie(editingMovie.id, {
          ...formData,
          videoUrl: finalVideoUrl,
          posterUrl: formData.posterUrl || posterPreview // Use existing preview if no new URL
        });
        
        if (success) {
          setSuccess('Movie updated successfully');
          setShowForm(false);
          resetForm();
        }
      } else {
        // Adding new movie
        // If a poster file was selected, we would normally upload it to storage
        // but since we're not handling storage uploads, we'll use the direct URL
        // or a fallback Unsplash URL
        
        const posterUrl = formData.posterUrl || 
                        "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&h=900";
        
        const dummyFile = new File([""], "poster.jpg", { type: "image/jpeg" });
        const newMovie = await addMovie({
          ...formData,
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

  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
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
              resetForm();
            }}
          >
            {showForm ? 'Cancel' : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Add Movie
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
            <h2 className="text-xl font-bold mb-6">{editingMovie ? 'Edit Movie' : 'Add New Movie'}</h2>
            
            <form onSubmit={handleSubmit}>
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
                      value={formData.title}
                      onChange={handleChange}
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
                      value={formData.description}
                      onChange={handleChange}
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
                            formData.genre.includes(genre) 
                              ? 'bg-[#e50914] text-white' 
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                          onClick={() => handleGenreChange(genre)}
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
                        value={formData.releaseYear}
                        onChange={handleChange}
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
                        value={formData.duration}
                        onChange={handleChange}
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
                        value={formData.rating}
                        onChange={handleChange}
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
                        checked={formData.featured}
                        onChange={handleChange}
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
                        value={formData.posterUrl}
                        onChange={handleChange}
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
                          value={formData.videoUrl}
                          onChange={handleChange}
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
                    
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <h3 className="text-md font-medium mb-2">Video Format Guide</h3>
                      <p className="text-sm text-gray-300 mb-2">
                        Supported video formats for best playback experience:
                      </p>
                      <ul className="text-sm text-gray-400 list-disc pl-5 space-y-1">
                        <li>MP4 videos (direct URLs or file upload)</li>
                        <li>YouTube links</li>
                        <li>WebM videos</li>
                        <li>HLS streams (.m3u8)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
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
                      {editingMovie ? 'Updating...' : 'Uploading...'}
                    </span>
                  ) : (
                    editingMovie ? 'Update Movie' : 'Add Movie'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <h2 className="text-xl font-bold p-6 border-b border-gray-800">Movie List</h2>
          
          {loading ? (
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
                            onClick={() => handleEdit(movie)}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleDelete(movie.id)}
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
                onClick={() => setShowForm(true)}
              >
                <Plus className="h-5 w-5 mr-2 inline-block" />
                Add Movie
              </button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
 
