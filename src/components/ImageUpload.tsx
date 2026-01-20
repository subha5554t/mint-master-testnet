import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Camera, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { validateImageUrl } from '@/lib/imageValidation';

interface ImageUploadProps {
  value: string;
  onChange: (imageUrl: string) => void;
  disabled?: boolean;
}

type InputMode = 'upload' | 'url';

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Max 5MB for reasonable gas costs
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
      setPreviewError(false);
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [disabled, processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setUrlError('Please enter a URL');
      return;
    }
    
    const validation = validateImageUrl(urlInput.trim());
    
    if (!validation.isValid) {
      setUrlError(validation.error || 'Invalid URL');
      return;
    }
    
    setUrlError(null);
    onChange(validation.sanitizedUrl || urlInput.trim());
    setPreviewError(false);
  };

  const handleUrlChange = (value: string) => {
    setUrlInput(value);
    // Clear error when user starts typing
    if (urlError) {
      setUrlError(null);
    }
  };

  const handleRemove = () => {
    onChange('');
    setUrlInput('');
    setPreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUrlError(null);
  };

  // Sample images for quick selection
  const sampleImages = [
    'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400',
    'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400',
    'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=400',
    'https://images.unsplash.com/photo-1569437061241-a848be43cc82?w=400',
  ];

  // Validate sample image URLs (these are trusted sources)
  const handleSampleImageClick = (url: string) => {
    setUrlError(null);
    onChange(url);
    setPreviewError(false);
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2 bg-secondary rounded-lg p-1">
        <button
          type="button"
          onClick={() => setInputMode('upload')}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            inputMode === 'upload'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setInputMode('url')}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            inputMode === 'url'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          URL
        </button>
      </div>

      {/* Current Image Preview */}
      {value && !previewError && (
        <div className="relative">
          <div className="aspect-square rounded-xl overflow-hidden bg-secondary border-2 border-primary/30">
            <img
              src={value}
              alt="NFT Preview"
              className="w-full h-full object-cover"
              onError={() => setPreviewError(true)}
            />
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Upload Area */}
      {(!value || previewError) && inputMode === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`
            aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer
            flex flex-col items-center justify-center gap-4 p-6
            ${isDragging 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-primary/50 hover:bg-secondary/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
            isDragging ? 'bg-primary/20' : 'bg-secondary'
          }`}>
            {isDragging ? (
              <Upload className="w-8 h-8 text-primary animate-bounce" />
            ) : (
              <Camera className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          
          <div className="text-center">
            <p className="font-medium text-foreground">
              {isDragging ? 'Drop your image here' : 'Upload Image'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Drag & drop or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled}
            className="hidden"
          />
        </div>
      )}

      {/* URL Input */}
      {(!value || previewError) && inputMode === 'url' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://... or ipfs://..."
              disabled={disabled}
              className={`flex-1 px-4 py-3 rounded-lg bg-secondary border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                urlError ? 'border-destructive' : 'border-border'
              }`}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={disabled || !urlInput.trim()}
              variant="outline"
            >
              Add
            </Button>
          </div>
          
          {/* URL Validation Error */}
          {urlError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {urlError}
            </div>
          )}

          {/* Sample Images Grid */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Or pick a sample:</p>
            <div className="grid grid-cols-3 gap-2">
              {sampleImages.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSampleImageClick(url)}
                  disabled={disabled}
                  className="aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary/50 transition-all hover:scale-105 disabled:opacity-50"
                >
                  <img src={url} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview Error State */}
      {previewError && value && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
          <ImageIcon className="w-8 h-8 text-destructive mx-auto mb-2 opacity-50" />
          <p className="text-sm text-destructive">Unable to load image</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
