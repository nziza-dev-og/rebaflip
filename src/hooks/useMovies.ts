import  { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Movie } from '../types';

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Simple query without compound index requirement
      const q = query(collection(db, 'movies'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log("No movies found in the database");
        setMovies([]);
        return;
      }
      
      const moviesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure all required fields exist
        title: doc.data().title || 'Untitled Movie',
        description: doc.data().description || 'No description available',
        genre: doc.data().genre || ['Unknown'],
        releaseYear: doc.data().releaseYear || new Date().getFullYear(),
        rating: doc.data().rating || 0,
        duration: doc.data().duration || 'Unknown',
        posterUrl: doc.data().posterUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&h=900',
        videoUrl: doc.data().videoUrl || '',
        featured: doc.data().featured || false,
        createdAt: doc.data().createdAt || new Date()
      })) as Movie[];
      
      // Sort locally to avoid Firestore index requirements
      moviesData.sort((a, b) => {
        // Handle cases where createdAt might be a Firestore timestamp
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log(`Fetched ${moviesData.length} movies`);
      setMovies(moviesData);
    } catch (err: any) {
      console.error("Error fetching movies:", err);
      setError('Failed to fetch movies: ' + err.message);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Simple query with just the featured filter
      const q = query(collection(db, 'movies'), where('featured', '==', true));
      const snapshot = await getDocs(q);
      
      const moviesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure all required fields exist
        title: doc.data().title || 'Untitled Movie',
        description: doc.data().description || 'No description available',
        genre: doc.data().genre || ['Unknown'],
        releaseYear: doc.data().releaseYear || new Date().getFullYear(),
        rating: doc.data().rating || 0,
        duration: doc.data().duration || 'Unknown',
        posterUrl: doc.data().posterUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&h=900',
        videoUrl: doc.data().videoUrl || '',
        featured: true,
        createdAt: doc.data().createdAt || new Date()
      })) as Movie[];
      
      // Sort locally
      moviesData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log(`Fetched ${moviesData.length} featured movies`);
      setMovies(moviesData);
    } catch (err: any) {
      console.error("Error fetching featured movies:", err);
      setError('Failed to fetch featured movies: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMoviesByGenre = useCallback(async (genre: string) => {
    try {
      setLoading(true);
      setError(null);
      const q = query(collection(db, 'movies'), where('genre', 'array-contains', genre));
      const snapshot = await getDocs(q);
      
      const moviesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure all required fields exist
        title: doc.data().title || 'Untitled Movie',
        description: doc.data().description || 'No description available',
        genre: doc.data().genre || ['Unknown'],
        releaseYear: doc.data().releaseYear || new Date().getFullYear(),
        rating: doc.data().rating || 0,
        duration: doc.data().duration || 'Unknown',
        posterUrl: doc.data().posterUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&h=900',
        videoUrl: doc.data().videoUrl || '',
        featured: doc.data().featured || false,
        createdAt: doc.data().createdAt || new Date()
      })) as Movie[];
      
      // Sort locally
      moviesData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log(`Fetched ${moviesData.length} movies in ${genre} genre`);
      setMovies(moviesData);
    } catch (err: any) {
      console.error(`Error fetching ${genre} movies:`, err);
      setError(`Failed to fetch ${genre} movies: ` + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMovieById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const docRef = doc(db, 'movies', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const movieData = docSnap.data();
        console.log(`Fetched movie with id: ${id}`);
        
        // Create a complete movie object with defaults for missing fields
        const movie: Movie = {
          id: docSnap.id,
          title: movieData.title || 'Untitled Movie',
          description: movieData.description || 'No description available',
          genre: movieData.genre || ['Unknown'],
          releaseYear: movieData.releaseYear || new Date().getFullYear(),
          rating: movieData.rating || 0,
          duration: movieData.duration || 'Unknown',
          posterUrl: movieData.posterUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&h=900',
          videoUrl: movieData.videoUrl || '',
          featured: movieData.featured || false,
          createdAt: movieData.createdAt || new Date()
        };
        
        return movie;
      } else {
        console.log(`Movie with id ${id} not found`);
        setError('Movie not found');
        return null;
      }
    } catch (err: any) {
      console.error(`Error fetching movie ${id}:`, err);
      setError('Failed to fetch movie: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addMovie = async (movie: Omit<Movie, 'id' | 'createdAt'>, posterFile: File) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use provided poster URL directly since storage upload is not needed here
      const posterUrl = movie.posterUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&h=900";
      
      // Add movie to Firestore - posterUrl will be the direct URL from Unsplash or admin provided
      const docRef = await addDoc(collection(db, 'movies'), {
        ...movie,
        posterUrl,
        createdAt: serverTimestamp()
      });
      
      console.log(`Added new movie with id: ${docRef.id}`);
      
      const newMovie = {
        id: docRef.id,
        ...movie,
        posterUrl,
        createdAt: new Date()
      };
      
      setMovies(prev => [newMovie, ...prev]);
      return newMovie;
    } catch (err: any) {
      console.error("Error adding movie:", err);
      setError('Failed to add movie: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateMovie = async (id: string, updates: Partial<Movie>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update movie in Firestore
      const movieRef = doc(db, 'movies', id);
      await updateDoc(movieRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log(`Updated movie with id: ${id}`);
      
      // Update local state
      setMovies(prev => 
        prev.map(movie => 
          movie.id === id ? { ...movie, ...updates } : movie
        )
      );
      
      return true;
    } catch (err: any) {
      console.error(`Error updating movie ${id}:`, err);
      setError('Failed to update movie: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteMovie = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Delete movie from Firestore
      await deleteDoc(doc(db, 'movies', id));
      
      console.log(`Deleted movie with id: ${id}`);
      
      // Update local state
      setMovies(prev => prev.filter(movie => movie.id !== id));
      
      return true;
    } catch (err: any) {
      console.error(`Error deleting movie ${id}:`, err);
      setError('Failed to delete movie: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load movies on component mount
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return {
    movies,
    loading,
    error,
    fetchMovies,
    fetchFeaturedMovies,
    fetchMoviesByGenre,
    fetchMovieById,
    addMovie,
    updateMovie,
    deleteMovie
  };
}
 