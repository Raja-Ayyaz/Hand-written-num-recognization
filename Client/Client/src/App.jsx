import { useState, useRef } from 'react'
import CanvasDraw from 'react-canvas-draw'

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCanvas, setIsCanvas] = useState(true);
  const canvasRef = useRef(null);

  const clearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
      setPrediction(null);
    }
  };

  const getPredictionFromCanvas = async () => {
    if (!canvasRef.current) return;
    
    setLoading(true);
    try {
      // Get the canvas data as base64
      const canvasData = canvasRef.current.getDataURL('png', false, '#FFFFFF');
      
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: canvasData
        }),
      });
      
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error('Error:', error);
      setPrediction({ error: 'Failed to get prediction' });
    }
    setLoading(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
      setPrediction(null);
    };
    
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const getPrediction = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    try {
      console.log("fetching Data to predict")
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: selectedImage
        }),
      });
      
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error('Error:', error);
      setPrediction({ error: 'Failed to get prediction' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Handwritten Digit Recognition
        </h1>
        
        <div className="flex justify-center space-x-4 mb-8">
          <button 
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 
              ${isCanvas 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setIsCanvas(true)}
          >
            Draw Digit
          </button>
          <button 
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 
              ${!isCanvas 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setIsCanvas(false)}
          >
            Upload Image
          </button>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-2xl">
          {isCanvas ? (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-2 w-[280px] h-[280px] mx-auto">
                <CanvasDraw
                  ref={canvasRef}
                  brushColor="#000000"
                  brushRadius={8}
                  canvasWidth={280}
                  canvasHeight={280}
                  backgroundColor="#FFFFFF"
                  hideGrid={true}
                  lazyRadius={0}
                  immediateLoading={true}
                />
              </div>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={clearCanvas}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                >
                  Clear
                </button>
                <button 
                  onClick={getPredictionFromCanvas}
                  disabled={loading}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Predicting...' : 'Predict Digit'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full max-w-xs text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
              </div>
              {selectedImage && (
                <div className="space-y-4">
                  <div className="max-w-xs mx-auto">
                    <img src={selectedImage} alt="Preview" className="rounded-lg w-full" />
                  </div>
                  <div className="flex justify-center">
                    <button 
                      onClick={getPrediction}
                      disabled={loading}
                      className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Predicting...' : 'Predict Digit'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {prediction && (
            <div className="mt-8 p-6 bg-gray-700 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Prediction Result</h2>
              {prediction.error ? (
                <p className="text-red-400">{prediction.error}</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-200">
                    Predicted Digit: 
                    <span className="ml-2 text-2xl font-bold text-blue-400">
                      {prediction.prediction}
                    </span>
                  </p>
                  <p className="text-gray-200">
                    Confidence: 
                    <span className="ml-2 text-lg font-semibold text-green-400">
                      {prediction.confidence.toFixed(2)}%
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
