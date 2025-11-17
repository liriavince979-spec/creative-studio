
import React, { useState } from 'react';
import ImageGenerator from './components/ImageGenerator';
import VideoAnimator from './components/VideoAnimator';
import ImageIcon from './components/icons/ImageIcon';
import VideoIcon from './components/icons/VideoIcon';

type Tab = 'image' | 'video';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('image');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'image':
        return <ImageGenerator />;
      case 'video':
        return <VideoAnimator />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabName: Tab; label: string; icon: React.ReactNode }> = ({ tabName, label, icon }) => {
    const isActive = activeTab === tabName;
    return (
      <button
        onClick={() => setActiveTab(tabName)}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 rounded-t-lg ${
          isActive
            ? 'bg-gray-800 text-indigo-400 border-b-2 border-indigo-400'
            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
        }`}
      >
        {icon}
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            Creative Studio AI
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Bring your ideas to life with generative images and videos.
          </p>
        </header>

        <main className="bg-gray-800/50 rounded-xl shadow-2xl backdrop-blur-sm border border-gray-700/50">
          <div className="border-b border-gray-700">
            <nav className="flex" aria-label="Tabs">
              <TabButton tabName="image" label="Generate Image" icon={<ImageIcon />} />
              <TabButton tabName="video" label="Animate Image" icon={<VideoIcon />} />
            </nav>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            {renderTabContent()}
          </div>
        </main>
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
