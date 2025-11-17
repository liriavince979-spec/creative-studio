
import React, { useState, useCallback } from 'react';
import { generateImage } from '../services/geminiService';
import Spinner from './Spinner';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const base64Image = await generateImage(prompt);
      setGeneratedImage(`data:image/jpeg;base64,${base64Image}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if(error) setError(null);
  };
  
  return (
    <div className="flex flex-col gap-6">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
          Describe the image you want to create
        </label>
        <textarea
          id="prompt"
          name="prompt"
          rows={3}
          className="w-full bg-gray-900/50 border border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white p-3 transition"
          placeholder="e.g., A cinematic shot of a futuristic city at sunset, with flying cars and neon lights."
          value={prompt}
          onChange={handlePromptChange}
          disabled={isLoading}
        />
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleGenerateImage}
          disabled={isLoading || !prompt.trim()}
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}

      <div className="w-full aspect-square bg-gray-900/50 rounded-lg flex items-center justify-center border border-dashed border-gray-600 overflow-hidden">
        {isLoading ? (
          <div className="text-center">
            <Spinner />
            <p className="mt-2 text-gray-400">Creating your vision...</p>
          </div>
        ) : generatedImage ? (
          <img src={generatedImage} alt={prompt} className="w-full h-full object-contain" />
        ) : (
          <div className="text-center text-gray-500">
            <p>Your generated image will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
