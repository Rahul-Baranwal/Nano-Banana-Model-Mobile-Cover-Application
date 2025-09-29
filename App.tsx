
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { PreviewArea } from './components/PreviewArea';
import { generateMockups } from './services/geminiService';
import type { MockupResult } from './types';
import { Angle } from './types';
import { PhoneSelector } from './components/PhoneSelector';
import { ApplyIcon } from './components/icons';

const App: React.FC = () => {
  const [phoneImage, setPhoneImage] = useState<string | null>(null);
  const [designImage, setDesignImage] = useState<string | null>(null);
  const [mockups, setMockups] = useState<MockupResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');

  const handleApplyDesign = useCallback(async () => {
    if (!phoneImage || !designImage) {
      setError('Please provide both a phone image and a design image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setMockups(null);
    setProgressMessage('Generating mockups... this can take a moment.');

    try {
      const result = await generateMockups(phoneImage, designImage);
      if (!result[Angle.Flat] && !result[Angle.Tilted] && !result[Angle.Perspective3D]) {
        throw new Error("The AI failed to generate any images. Please try a different design or phone image.");
      }
      setMockups(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  }, [phoneImage, designImage]);

  const handlePhoneSelect = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoneImage(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setError('Could not load the selected phone model. Please try again.');
      console.error(err);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Controls */}
            <div className="flex flex-col gap-6">
              <PhoneSelector onSelect={handlePhoneSelect} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UploadZone
                  title="1. Upload Your Phone"
                  description="Upload a clear photo of your phone's back."
                  onFileUpload={setPhoneImage}
                  uploadedImage={phoneImage}
                />
                <UploadZone
                  title="2. Upload Your Design"
                  description="Upload a logo, artwork, or pattern."
                  onFileUpload={setDesignImage}
                  uploadedImage={designImage}
                />
              </div>
              <div className="mt-2">
                <button
                  onClick={handleApplyDesign}
                  disabled={!phoneImage || !designImage || isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-600/30"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <ApplyIcon />
                      Apply Design & Generate Mockup
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Preview */}
            <div>
              <PreviewArea
                mockups={mockups}
                isLoading={isLoading}
                initialImage={phoneImage}
                error={error}
                progressMessage={progressMessage}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
