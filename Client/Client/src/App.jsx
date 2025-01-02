import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCanvas, setIsCanvas] = useState(true);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
    }
  }, [isCanvas]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPrediction(null);
  };

  const getPredictionFromCanvas = async () => {
    const canvas = canvasRef.current;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: canvas.toDataURL('image/png')
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
    <div className="container">
      <h1>Handwritten Digit Recognition</h1>
      
      <div className="toggle-section">
        <button 
          className={`toggle-btn ${isCanvas ? 'active' : ''}`}
          onClick={() => setIsCanvas(true)}
        >
          Draw Digit
        </button>
        <button 
          className={`toggle-btn ${!isCanvas ? 'active' : ''}`}
          onClick={() => setIsCanvas(false)}
        >
          Upload Image
        </button>
      </div>

      <div className="main-section">
        {isCanvas ? (
          <div className="canvas-section">
            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
            />
            <div className="canvas-controls">
              <button onClick={clearCanvas}>Clear</button>
              <button onClick={getPredictionFromCanvas} disabled={loading}>
                {loading ? 'Predicting...' : 'Predict Digit'}
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input"
            />
            {selectedImage && (
              <div className="preview-section">
                <img src={selectedImage} alt="Preview" className="image-preview" />
                <button onClick={getPrediction} disabled={loading}>
                  {loading ? 'Predicting...' : 'Predict Digit'}
                </button>
              </div>
            )}
          </div>
        )}

        {prediction && (
          <div className="result-section">
            <h2>Prediction Result</h2>
            {prediction.error ? (
              <p className="error">{prediction.error}</p>
            ) : (
              <div className="prediction-details">
                <p>Predicted Digit: <span className="prediction-value">{prediction.prediction}</span></p>
                <p>Confidence: <span className="confidence-value">{prediction.confidence.toFixed(2)}%</span></p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
