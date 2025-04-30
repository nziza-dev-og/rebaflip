import  { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Series, Season, Episode } from '../types';

export function useSeries() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllSeries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const q = query(collection(db, 'series'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log("No series found in the database");
        setSeriesList([]);
        return;
      }
      
      const seriesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled Series',
          description: data.description || 'No description available',
          genre: data.genre || ['Unknown'],
          releaseYear: data.releaseYear || new Date().getFullYear(),
          rating: data.rating || 0,
          posterUrl: data.posterUrl || 'https://images.unsplash.com/photo-1580130775562-0ef92da028de?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB0diUyMHNlcmllcyUyMHBvc3RlciUyMGRhcmt8ZW58MHx8fHwxNzQ1OTkzMjU1fDA&ixlib=rb-4.0.3&fit=fillmax&h=900&w=600',
          bannerUrl: data.bannerUrl,
          featured: data.featured || false,
          seasons: data.seasons || [],
          createdAt: data.createdAt || new Date()
        } as Series;
      });
      
      // Sort by creation date, newest first
      seriesData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log(`Fetched ${seriesData.length} series`);
      setSeriesList(seriesData);
    } catch (err: any) {
      console.error("Error fetching series:", err);
      setError('Failed to fetch series: ' + err.message);
      setSeriesList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedSeries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const q = query(collection(db, 'series'), where('featured', '==', true));
      const snapshot = await getDocs(q);
      
      const seriesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled Series',
          description: data.description || 'No description available',
          genre: data.genre || ['Unknown'],
          releaseYear: data.releaseYear || new Date().getFullYear(),
          rating: data.rating || 0,
          posterUrl: data.posterUrl || 'https://images.unsplash.com/photo-1580130775562-0ef92da028de?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB0diUyMHNlcmllcyUyMHBvc3RlciUyMGRhcmt8ZW58MHx8fHwxNzQ1OTkzMjU1fDA&ixlib=rb-4.0.3&fit=fillmax&h=900&w=600',
          bannerUrl: data.bannerUrl,
          featured: true,
          seasons: data.seasons || [],
          createdAt: data.createdAt || new Date()
        } as Series;
      });
      
      // Sort by creation date, newest first
      seriesData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log(`Fetched ${seriesData.length} featured series`);
      setSeriesList(seriesData);
    } catch (err: any) {
      console.error("Error fetching featured series:", err);
      setError('Failed to fetch featured series: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSeriesByGenre = useCallback(async (genre: string) => {
    try {
      setLoading(true);
      setError(null);
      const q = query(collection(db, 'series'), where('genre', 'array-contains', genre));
      const snapshot = await getDocs(q);
      
      const seriesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled Series',
          description: data.description || 'No description available',
          genre: data.genre || ['Unknown'],
          releaseYear: data.releaseYear || new Date().getFullYear(),
          rating: data.rating || 0,
          posterUrl: data.posterUrl || 'https://images.unsplash.com/photo-1580130775562-0ef92da028de?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB0diUyMHNlcmllcyUyMHBvc3RlciUyMGRhcmt8ZW58MHx8fHwxNzQ1OTkzMjU1fDA&ixlib=rb-4.0.3&fit=fillmax&h=900&w=600',
          bannerUrl: data.bannerUrl,
          featured: data.featured || false,
          seasons: data.seasons || [],
          createdAt: data.createdAt || new Date()
        } as Series;
      });
      
      console.log(`Fetched ${seriesData.length} series in ${genre} genre`);
      setSeriesList(seriesData);
    } catch (err: any) {
      console.error(`Error fetching ${genre} series:`, err);
      setError(`Failed to fetch ${genre} series: ` + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSeriesById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const docRef = doc(db, 'series', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`Fetched series with id: ${id}`);
        
        // Create a complete series object with defaults for missing fields
        const series: Series = {
          id: docSnap.id,
          title: data.title || 'Untitled Series',
          description: data.description || 'No description available',
          genre: data.genre || ['Unknown'],
          releaseYear: data.releaseYear || new Date().getFullYear(),
          rating: data.rating || 0,
          posterUrl: data.posterUrl || 'https://images.unsplash.com/photo-1580130775562-0ef92da028de?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB0diUyMHNlcmllcyUyMHBvc3RlciUyMGRhcmt8ZW58MHx8fHwxNzQ1OTkzMjU1fDA&ixlib=rb-4.0.3&fit=fillmax&h=900&w=600',
          bannerUrl: data.bannerUrl,
          featured: data.featured || false,
          seasons: data.seasons || [],
          createdAt: data.createdAt || new Date()
        };
        
        return series;
      } else {
        console.log(`Series with id ${id} not found`);
        setError('Series not found');
        return null;
      }
    } catch (err: any) {
      console.error(`Error fetching series ${id}:`, err);
      setError('Failed to fetch series: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = async (file: File, path: string, onProgress?: (progress: number) => void): Promise<string> => {
    try {
      const timestamp = new Date().getTime();
      const fileName = `${path}/${timestamp}_${file.name.replace(/\s+/g, '_')}`;
      
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            if (onProgress) onProgress(progress);
          },
          (error) => {
            console.error('Error uploading file:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('File uploaded. Download URL:', downloadURL);
              resolve(downloadURL);
            } catch (err) {
              console.error('Error getting download URL:', err);
              reject(err);
            }
          }
        );
      });
    } catch (err) {
      console.error('Error initiating upload:', err);
      throw err;
    }
  };

  const addSeries = async (series: Omit<Series, 'id' | 'createdAt'>, posterFile: File | null) => {
    try {
      setLoading(true);
      setError(null);
      
      let posterUrl = series.posterUrl;
      
      // If a poster file is provided, upload it
      if (posterFile) {
        posterUrl = await uploadFile(posterFile, 'series_posters');
      }
      
      // Add series to Firestore
      const docRef = await addDoc(collection(db, 'series'), {
        ...series,
        posterUrl,
        createdAt: serverTimestamp()
      });
      
      console.log(`Added new series with id: ${docRef.id}`);
      
      const newSeries = {
        id: docRef.id,
        ...series,
        posterUrl,
        createdAt: new Date()
      };
      
      setSeriesList(prev => [newSeries, ...prev]);
      return newSeries;
    } catch (err: any) {
      console.error("Error adding series:", err);
      setError('Failed to add series: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSeries = async (id: string, updates: Partial<Series>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update series in Firestore
      const seriesRef = doc(db, 'series', id);
      await updateDoc(seriesRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log(`Updated series with id: ${id}`);
      
      // Update local state
      setSeriesList(prev => 
        prev.map(series => 
          series.id === id ? { ...series, ...updates } : series
        )
      );
      
      return true;
    } catch (err: any) {
      console.error(`Error updating series ${id}:`, err);
      setError('Failed to update series: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteSeries = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Delete series from Firestore
      await deleteDoc(doc(db, 'series', id));
      
      console.log(`Deleted series with id: ${id}`);
      
      // Update local state
      setSeriesList(prev => prev.filter(series => series.id !== id));
      
      return true;
    } catch (err: any) {
      console.error(`Error deleting series ${id}:`, err);
      setError('Failed to delete series: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSeries();
  }, [fetchAllSeries]);

  return {
    seriesList,
    loading,
    error,
    fetchAllSeries,
    fetchFeaturedSeries,
    fetchSeriesByGenre,
    fetchSeriesById,
    addSeries,
    updateSeries,
    deleteSeries,
    uploadFile
  };
}
 
