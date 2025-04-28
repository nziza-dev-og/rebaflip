import  { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Film, File as FileIcon } from 'lucide-react';

interface FileUploadPreviewProps {
  accept: string;
  onChange: (file: File | null) => void;
  value: File | null;
  label: string;
  fileTypes: string;
  isVideo?: boolean;
  isImage?: boolean;
  uploading?: boolean;
  progress?: number;
}

export default function FileUploadPreview({
  accept,
  onChange,
  value,
  label,
  fileTypes,
  isVideo = false,
  isImage = false,
  uploading = false,
  progress = 0
}: FileUploadPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      onChange(file);
      
      // Create preview for images
      if (isImage && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.match(accept.replace(/,/g, '|').replace(/\*/g, '.*'))) {
        onChange(file);
        
        // Create preview for images
        if (isImage && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };
  
  const clearFile = () => {
    onChange(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium">
        {label}
      </label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      
      {value ? (
        <div className="p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium truncate max-w-xs">{value.name}</span>
            <button 
              type="button" 
              className="text-gray-400 hover:text-white"
              onClick={clearFile}
              disabled={uploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {isImage && preview && (
            <div className="mb-3 rounded overflow-hidden h-40 flex items-center justify-center">
              <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain" />
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-400">
            {isVideo ? (
              <Film className="h-4 w-4 mr-2" />
            ) : (
              <FileIcon className="h-4 w-4 mr-2" />
            )}
            <span className="mr-2">{(value.size / (1024 * 1024)).toFixed(2)} MB</span>
            <span>{value.type}</span>
          </div>
          
          {uploading && (
            <div className="mt-2">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#e50914] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-[#e50914] bg-[#e50914]/10' 
              : 'border-gray-700 hover:border-gray-500'
          }`}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-500 mb-2" />
          <p className="text-sm text-gray-400 mb-2">
            Drag and drop your {isVideo ? 'video' : isImage ? 'image' : 'file'} here or click to browse
          </p>
          <p className="text-xs text-gray-500">
            {fileTypes}
          </p>
        </div>
      )}
    </div>
  );
}
 
