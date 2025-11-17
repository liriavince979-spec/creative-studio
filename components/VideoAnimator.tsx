
import React, { useState, useCallback, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { AspectRatio } from '../types';
import Spinner from './Spinner';

const loadingMessages = [
  "Warming up the digital canvas...",
  "Teaching pixels to dance...",
  "Assembling cinematic sequences...",
  "Rendering your masterpiece, frame by frame...",
  "This can take a few minutes. Great art needs patience!",
  "Final touches and color grading...",
];

const VideoAnimator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>(loadingMessages[0]);

  const [isKeySelected, setIsKeySelected] = useState<boolean>(false);
  const [isCheckingKey, setIsCheckingKey] = useState<boolean>(true);
  
  const checkApiKey = useCallback(async () => {
    setIsCheckingKey(true);
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsKeySelected(hasKey);
    } else {
        // Fallback for when aistudio is not available
        setError("API selection provider is not available.");
    }
    setIsCheckingKey(false);
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      interval = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);
  
  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        // Assume key selection is successful to improve UX, as `hasSelectedApiKey` might have a delay.
        setIsKeySelected(true);
    } else {
        setError("Could not open API key selection.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      setError(null);
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateVideo = async () => {
    if (!imageFile) {
      setError('Please upload an image to animate.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedVideo(null);
    setLoadingMessage(loadingMessages[0]);

    try {
      const { base64, mimeType } = await fileToBase64(imageFile);
      const videoUrl = await generateVideo(prompt, base64, mimeType, aspectRatio);
      setGeneratedVideo(videoUrl);
    } catch (err) {
      let errorMessage = 'An unknown error occurred during video generation.';
      if (err instanceof Error) {
        errorMessage = err.message;
        if (err.message.includes('Requested entity was not found')) {
            errorMessage = "Your API key is invalid. Please select a valid key and try again.";
            setIsKeySelected(false); // Reset key state
        }
      }
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isCheckingKey) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  if (!isKeySelected) {
      return (
          <div className="text-center p-8 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-yellow-300">API Key Required for Veo</h3>
              <p className="mb-6 text-gray-300">
                  Video generation requires a Google AI API key with access to the Veo model. Please select your key to proceed.
                  You can manage billing for your projects in the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google AI documentation</a>.
              </p>
              <button
                  onClick={handleSelectKey}
                  className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
              >
                  Select API Key
              </button>
              {error && <p className="mt-4 text-red-400">{error}</p>}
          </div>
      );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Controls */}
      <div className="flex flex-col gap-6">
        <div>
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">
            1. Upload an image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-400">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} disabled={isLoading} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          {imageFile && <p className="text-sm text-gray-400 mt-2">Selected: {imageFile.name}</p>}
        </div>

        <div>
          <label htmlFor="video-prompt" className="block text-sm font-medium text-gray-300 mb-2">
            2. Describe the animation (optional)
          </label>
          <textarea
            id="video-prompt"
            name="video-prompt"
            rows={2}
            className="w-full bg-gray-900/50 border border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white p-3 transition"
            placeholder="e.g., Make the clouds move, gentle breeze."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">3. Select Aspect Ratio</label>
          <div className="flex gap-4">
            {(['16:9', '9:16'] as AspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition ${aspectRatio === ratio ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300'}`}
              >
                {ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <button
            onClick={handleGenerateVideo}
            disabled={isLoading || !imageFile}
            className="w-full lg:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? 'Animating...' : 'Animate Image'}
          </button>
        </div>
      </div>

      {/* Right Column: Preview & Output */}
      <div className="flex flex-col gap-4">
        {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}
        <div className="w-full aspect-video bg-gray-900/50 rounded-lg flex items-center justify-center border border-dashed border-gray-600 overflow-hidden">
            {isLoading ? (
            <div className="text-center p-4">
                <Spinner />
                <p className="mt-4 text-gray-300 font-medium">{loadingMessage}</p>
            </div>
            ) : generatedVideo ? (
                <video src={generatedVideo} controls autoPlay loop className="w-full h-full object-contain" />
            ) : imagePreview ? (
                <img src={imagePreview} alt="Upload preview" className="w-full h-full object-contain" />
            ) : (
                <div className="text-center text-gray-500 p-4">
                    <p className="font-semibold">Your animated video will appear here.</p>
                    <p className="text-sm mt-1">Upload an image to get started.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default VideoAnimator;
