import React, { useState, useRef } from 'react';
import { generateImageDescription } from '../services/gemini';
import { Upload, Image as ImageIcon, X, Loader2, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const VisionApp: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('Describe this image in detail.');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Strip prefix for API
        const base64Data = base64String.split(',')[1];
        setSelectedImage(base64Data);
        setAnalysis(''); // Clear previous analysis
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    try {
      const result = await generateImageDescription(selectedImage, prompt);
      setAnalysis(result);
    } catch (error) {
      setAnalysis("Error analyzing image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setAnalysis('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-tower-900 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <EyeIcon className="mr-3 text-emerald-400" size={28} />
            The Observatory
          </h2>
          <p className="text-tower-400">Upload visuals for advanced object recognition and analysis.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Upload & Preview */}
          <div className="space-y-6">
            <div className={`
              border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all h-80 relative overflow-hidden
              ${selectedImage ? 'border-emerald-500/50 bg-black/20' : 'border-tower-700 bg-tower-800/30 hover:bg-tower-800/50 hover:border-emerald-500/30 cursor-pointer'}
            `}
            onClick={() => !selectedImage && fileInputRef.current?.click()}
            >
              {selectedImage ? (
                <>
                  <img 
                    src={`data:image/png;base64,${selectedImage}`} 
                    alt="Uploaded" 
                    className="w-full h-full object-contain p-2" 
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); clearImage(); }}
                    className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-red-500/80 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </>
              ) : (
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-tower-800 rounded-full flex items-center justify-center mx-auto mb-4 text-tower-400">
                    <Upload size={32} />
                  </div>
                  <p className="text-white font-medium mb-1">Upload Image</p>
                  <p className="text-tower-500 text-sm">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload} 
              />
            </div>

            <div className="bg-tower-800/50 p-4 rounded-xl border border-tower-700">
              <label className="block text-xs font-semibold text-tower-400 uppercase tracking-wider mb-2">
                Instruction
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1 bg-tower-900 border border-tower-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedImage || isLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-tower-700 disabled:text-tower-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="bg-tower-800/30 rounded-2xl border border-tower-700 p-6 min-h-[320px]">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></span>
              Analysis Log
            </h3>
            
            {isLoading ? (
               <div className="flex flex-col items-center justify-center h-48 space-y-4">
                 <Loader2 size={32} className="animate-spin text-emerald-500" />
                 <span className="text-tower-400 text-sm animate-pulse">Scanning visual data...</span>
               </div>
            ) : analysis ? (
              <div className="prose prose-invert prose-sm max-w-none text-tower-200">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-tower-600">
                <ImageIcon size={48} className="mb-4 opacity-20" />
                <p>Waiting for input...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EyeIcon = ({className, size}: {className?: string, size?: number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
)

export default VisionApp;
