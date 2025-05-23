import  { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SeriesCard from '../components/SeriesCard';
import { useSeries } from '../hooks/useSeries';

const genres = ['Drama', 'Comedy', 'Action', 'Sci-Fi', 'Fantasy', 'Horror', 'Thriller', 'Mystery', 'Crime'];

// Generate years from 1990 to current year
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1990; year--) {
    years.push(year);
  }
  return years;
};

const years = generateYears();

export default function SeriesPage() {
  const location = useLocation();
  const { seriesList, loading, fetchAllSeries, fetchSeriesByGenre } = useSeries();
  const [filteredSeries, setFilteredSeries] = useState(seriesList);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const genre = params.get('genre');
    const year = params.get('year');
    
    if (genre && genres.includes(genre)) {
      setActiveGenre(genre);
      fetchSeriesByGenre(genre);
    } else {
      fetchAllSeries();
    }
    
    if (year && !isNaN(Number(year))) {
      setSelectedYear(Number(year));
    }
  }, [location, fetchAllSeries, fetchSeriesByGenre]);
  
  useEffect(() => {
    let filtered = [...seriesList];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(series => 
        series.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        series.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply year filter
    if (selectedYear) {
      filtered = filtered.filter(series => series.releaseYear === selectedYear);
    }
    
    setFilteredSeries(filtered);
  }, [seriesList, searchTerm, selectedYear]);
  
  const handleGenreFilter = (genre: string) => {
    if (activeGenre === genre) {
      setActiveGenre(null);
      fetchAllSeries();
    } else {
      setActiveGenre(genre);
      fetchSeriesByGenre(genre);
    }
  };
  
  const handleYearFilter = (year: number) => {
    if (selectedYear === year) {
      setSelectedYear(null);
    } else {
      setSelectedYear(year);
    }
  };
  
  const clearFilters = () => {
    setActiveGenre(null);
    setSelectedYear(null);
    setSearchTerm('');
    fetchAllSeries();
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">TV Series</h1>
          
          <div className="w-full md:w-auto flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <input
              type="text"
              placeholder="Search series..."
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Filters</h3>
              {(activeGenre || selectedYear) && (
                <button 
                  onClick={clearFilters}
                  className="text-sm text-[#e50914] hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
            
            <div className="mb-6">
              <h4 className="text-md font-medium mb-3">Genres</h4>
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
            
            <div>
              <h4 className="text-md font-medium mb-3">Release Year</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {years.slice(0, 24).map(year => (
                  <button
                    key={year}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedYear === year ? 'bg-[#e50914] text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    onClick={() => handleYearFilter(year)}
                  >
                    {year}
                  </button>
                ))}
              </div>
              
              {years.length > 24 && (
                <div className="mt-2 text-right">
                  <button 
                    className="text-sm text-gray-400 hover:text-white"
                    onClick={() => document.getElementById('year-select')?.focus()}
                  >
                    More years
                  </button>
                </div>
              )}
              
              <div className="mt-4">
                <select 
                  id="year-select"
                  className="input-field bg-gray-800 text-sm"
                  value={selectedYear || ''}
                  onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Select specific year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div>
            {(activeGenre || selectedYear || searchTerm) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-gray-400">Active filters:</span>
                {activeGenre && (
                  <span className="bg-[#e50914]/20 text-[#e50914] px-3 py-1 rounded-full text-sm">
                    {activeGenre}
                  </span>
                )}
                {selectedYear && (
                  <span className="bg-[#e50914]/20 text-[#e50914] px-3 py-1 rounded-full text-sm">
                    {selectedYear}
                  </span>
                )}
                {searchTerm && (
                  <span className="bg-[#e50914]/20 text-[#e50914] px-3 py-1 rounded-full text-sm">
                    "{searchTerm}"
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-400">
            {filteredSeries.length} {filteredSeries.length === 1 ? 'series' : 'series'} found
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e50914]"></div>
          </div>
        ) : filteredSeries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredSeries.map(series => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-900 rounded-lg">
            <h3 className="text-xl font-medium mb-2">No series found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
            <button 
              onClick={clearFilters}
              className="btn-primary"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
 
