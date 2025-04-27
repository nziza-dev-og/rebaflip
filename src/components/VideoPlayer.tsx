import  { useEffect, useRef, useState } from 'react';
import { Download, Settings } from 'lucide-react';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  autoplay?: boolean;
  controls?: boolean;
  className?: string;
  downloadEnabled?: boolean;
  movieTitle?: string;
}

export default function VideoPlayer({
  src,
  poster,
  onPlay,
  onPause,
  onEnded,
  autoplay = false,
  controls = true,
  className = 'video-container',
  downloadEnabled = true,
  movieTitle = 'movie'
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    
    const videoElement = videoRef.current;
    
    // Set up event handlers
    if (onPlay) videoElement.addEventListener('play', onPlay);
    if (onPause) videoElement.addEventListener('pause', onPause);
    if (onEnded) videoElement.addEventListener('ended', onEnded);
    
    const handleError = (e: Event) => {
      console.error('Video error:', e);
      setError('Failed to load video. Please try again later.');
      if (onEnded) onEnded();
    };
    
    videoElement.addEventListener('error', handleError);
    
    // Clean up event handlers
    return () => {
      if (onPlay) videoElement.removeEventListener('play', onPlay);
      if (onPause) videoElement.removeEventListener('pause', onPause);
      if (onEnded) videoElement.removeEventListener('ended', onEnded);
      videoElement.removeEventListener('error', handleError);
    };
  }, [onPlay, onPause, onEnded]);

  // Handle video source URL - use proxy if needed to avoid CORS issues
  const getSourceUrl = (url: string) => {
    if (!url) return '';
    
    try {
      // Validate the URL
      new URL(url);
      
      // If URL is already using proxy or is a YouTube embed, return as is
      if (url.includes('hooks.jdoodle.net/proxy') || url.includes('youtube.com/embed')) {
        return url;
      }
      
      // For YouTube links that aren't embeds, convert them to embed format
      if (url.includes('youtube.com/watch') || url.includes('youtu.be')) {
        const videoId = url.includes('youtube.com/watch') 
          ? new URL(url).searchParams.get('v')
          : url.split('/').pop();
        
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      // For commondatastorage links, they work without a proxy
      if (url.includes('commondatastorage.googleapis.com')) {
        return url;
      }
      
      // For direct video files (mp4, etc), use proxy to avoid CORS
      return `https://hooks.jdoodle.net/proxy?url=${encodeURIComponent(url)}`;
    } catch (err) {
      console.error('Invalid URL:', url);
      setError('Invalid video URL');
      return '';
    }
  };

  const handleDownload = async () => {
    if (!src || isDownloading) return;
    
    try {
      setIsDownloading(true);
      
      // For YouTube videos, we can't download directly
      if (src.includes('youtube.com') || src.includes('youtu.be')) {
        setError('Download not available for YouTube videos');
        setIsDownloading(false);
        return;
      }
      
      // Create a direct download link for the video
      const url = getSourceUrl(src);
      
      // Create anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${movieTitle.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Delay resetting isDownloading to show feedback to user
      setTimeout(() => {
        setIsDownloading(false);
      }, 1500);
    } catch (err) {
      console.error('Error downloading video:', err);
      setError('Failed to download video. Please try again later.');
      setIsDownloading(false);
    }
  };

  if (error) {
    return (
      <div className={className + " flex items-center justify-center bg-gray-900"}>
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">Error: {error}</p>
          <button 
            className="btn-secondary"
            onClick={() => onEnded && onEnded()}
          >
            Back to movie
          </button>
        </div>
      </div>
    );
  }

  // Handle empty source URLs
  if (!src) {
    return (
      <div className={className + " flex items-center justify-center bg-gray-900"}>
        <div className="text-center p-4">
          <p className="mb-2">No video source available</p>
          <button 
            className="btn-secondary"
            onClick={() => onEnded && onEnded()}
          >
            Back to movie
          </button>
        </div>
      </div>
    );
  }

  // Determine if we should use iframe (for YouTube) or video element
  const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');
  const processedUrl = getSourceUrl(src);
  
  if (!processedUrl) {
    return (
      <div className={className + " flex items-center justify-center bg-gray-900"}>
        <div className="text-center p-4">
          <p className="mb-2">Unable to process video URL</p>
          <button 
            className="btn-secondary"
            onClick={() => onEnded && onEnded()}
          >
            Back to movie
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className={className + " relative"}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {isYouTube ? (
        // For YouTube videos, use iframe
        <iframe
          src={processedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
      ) : (
        // For direct video files, use HTML5 video
        <video
          ref={videoRef}
          poster={poster}
          controls={controls}
          autoPlay={autoplay}
          className="w-full h-full"
          preload="metadata"
        >
          <source src={processedUrl} type="video/mp4" />
          <source src={processedUrl} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      )}
      
      {/* Custom controls overlay */}
      {downloadEnabled && !isYouTube && showControls && (
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg overflow-hidden transition-opacity duration-300">
          <button 
            className={`px-3 py-2 flex items-center text-white hover:bg-white/10 transition-colors ${isDownloading ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={handleDownload}
            disabled={isDownloading}
            title="Download this video"
          >
            <Download className="h-5 w-5 mr-2" />
            {isDownloading ? 'Downloading...' : 'Download'}
          </button>
        </div>
      )}
    </div>
  );
}
 