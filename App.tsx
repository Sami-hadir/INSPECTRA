
import React, { useState, useRef, useCallback } from 'react';
import { analyzeImageForProducts } from './services/geminiService';
import type { Product } from './types';
import { UploadIcon, CameraIcon, WarningIcon, ResetIcon } from './components/icons';
import CameraCapture from './components/CameraCapture';
import ProductCard from './components/ProductCard';

const App: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setImageSrc(null);
    setProducts(null);
    setIsLoading(false);
    setError(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleImageAnalysis = useCallback(async (dataUrl: string) => {
    setIsLoading(true);
    setError(null);
    setProducts(null);

    const mimeType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
    const base64Image = dataUrl.split(',')[1];
    
    try {
      const result = await analyzeImageForProducts(base64Image, mimeType);
      setProducts(result);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('אירעה שגיאה לא צפויה.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImageSrc(dataUrl);
        handleImageAnalysis(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (imageDataUrl: string) => {
    setShowCamera(false);
    setImageSrc(imageDataUrl);
    handleImageAnalysis(imageDataUrl);
  };

  const InitialScreen = () => (
    <div className="text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-4">
        מנתח מוצרים חכם
      </h1>
      <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
        צלם או העלה תמונה של מוצרים, והבינה המלאכותית תזהה אותם עבורך ותסמן מוצרים עם אזהרות.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 transition-all duration-300 transform hover:scale-105"
        >
          <UploadIcon className="w-6 h-6" />
          <span>העלאת תמונה</span>
        </button>
        <button
          onClick={() => setShowCamera(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
        >
          <CameraIcon className="w-6 h-6" />
          <span>צילום תמונה</span>
        </button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
    </div>
  );

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400 mb-4"></div>
        <p className="text-xl text-gray-300">מנתח את התמונה באמצעות Gemini...</p>
        <p className="text-gray-500">זה עשוי לקחת מספר רגעים.</p>
    </div>
  );

  const ResultsScreen = () => (
    <div className="w-full">
      <div className="relative mb-6">
        <img src={imageSrc!} alt="Uploaded product" className="rounded-xl shadow-2xl max-h-[40vh] w-auto mx-auto border-4 border-gray-700" />
        <button
            onClick={resetState}
            className="absolute top-2 right-2 p-2 bg-gray-800/70 text-white rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
            aria-label="התחל מחדש"
          >
            <ResetIcon className="h-6 w-6" />
        </button>
      </div>

      {isLoading && <LoadingSpinner />}

      {error && (
        <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative flex items-start gap-3">
            <WarningIcon className="h-6 w-6 flex-shrink-0" />
            <div>
              <strong className="font-bold">שגיאה! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
        </div>
      )}

      {products && (
        <div>
          <h2 className="text-3xl font-bold text-center mb-6 text-cyan-400">מוצרים שזוהו</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-lg">לא זוהו מוצרים בתמונה.</p>
          )}
        </div>
      )}
    </div>
  );
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-7xl mx-auto flex flex-col items-center">
        {!imageSrc ? <InitialScreen /> : <ResultsScreen />}
        {showCamera && <CameraCapture onCapture={handleCapture} onClose={() => setShowCamera(false)} />}
      </main>
    </div>
  );
};

export default App;
