from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import tensorflow as tf
import base64
import os

app = Flask(__name__)
CORS(app)

# Get the absolute path to the model file
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, 'num_reader.keras')

print(f"Looking for model at: {model_path}")
print("Loading model...")

try:
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")
    
    model = tf.keras.models.load_model(model_path)
    print("Model loaded successfully!")
    # Test prediction to ensure model works
    test_input = np.zeros((1, 28, 28))
    test_pred = model.predict(test_input, verbose=0)
    print("Model test prediction successful!")
except Exception as e:
    print(f"Error loading model: {str(e)}")
    model = None

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'Server is running',
        'model_loaded': model is not None
    })

def preprocess_base64_image(base64_string):
    # Decode base64 image
    img_data = base64.b64decode(base64_string.split(',')[1])
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    
    # Resize to 28x28
    img = cv2.resize(img, (28, 28))
    
    # Normalize and invert if needed
    img = img.astype('float32') / 255.0
    if np.mean(img) > 0.5:
        img = 1 - img
    
    return img

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        error_msg = "Model not loaded. Please check server logs."
        print(error_msg)
        return jsonify({'error': error_msg}), 500
    
    try:
        # Get the image from the request
        data = request.json
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data received'}), 400
            
        image_data = data['image']
        
        # Preprocess the image
        img = preprocess_base64_image(image_data)
        
        # Debug print
        print(f"Preprocessed image shape: {img.shape}")
        
        # Reshape for prediction
        img = np.expand_dims(img, axis=0)
        
        # Get prediction
        prediction = model.predict(img, verbose=0)
        predicted_digit = int(np.argmax(prediction))
        confidence = float(np.max(prediction) * 100)
        
        print(f"Prediction successful: digit={predicted_digit}, confidence={confidence}%")
        
        return jsonify({
            'prediction': predicted_digit,
            'confidence': confidence
        })
    
    except Exception as e:
        error_msg = f"Prediction error: {str(e)}"
        print(error_msg)
        return jsonify({'error': error_msg}), 500

if __name__ == '__main__':
    print("Starting Flask server...")
    print("Access the server at http://localhost:5000")
    app.run(debug=True, port=5000, host='0.0.0.0')
