import os
import cv2
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf

# Load the MNIST dataset
# mnist = tf.keras.datasets.mnist
# (x_train, y_train), (x_test, y_test) = mnist.load_data()

# # Normalize the input data
# x_train = tf.keras.utils.normalize(x_train, axis=1)
# x_test = tf.keras.utils.normalize(x_test, axis=1)

# # Define the improved model
# model = tf.keras.models.Sequential([
#     tf.keras.layers.Flatten(input_shape=(28, 28)),
#     tf.keras.layers.Dense(256, activation='relu'),
#     tf.keras.layers.Dropout(0.2),
#     tf.keras.layers.Dense(128, activation='relu'),
#     tf.keras.layers.Dropout(0.2),
#     tf.keras.layers.Dense(128, activation='relu'),
#     tf.keras.layers.Dropout(0.1),
#     tf.keras.layers.Dense(10, activation='softmax')
# ])

# # Compile the model with better parameters
# model.compile(
#     optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
#     loss='sparse_categorical_crossentropy',
#     metrics=['accuracy']
# )

# # Train the model with more epochs and validation
# model.fit(
#     x_train, 
#     y_train,
#     epochs=1
# )

# # Save the trained model (change the extension to .keras)
# model.save('Recognize.keras')

# Load the model for predictions (change the extension to .keras)
model = tf.keras.models.load_model('num_reader.keras')

def preprocess_image(image_path):
    # Read and preprocess the image
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise Exception("Image not found or cannot be read")
    
    # Resize to 28x28 if necessary
    if img.shape != (28, 28):
        img = cv2.resize(img, (28, 28))
    
    # Normalize and invert if needed
    img = img.astype('float32') / 255.0
    if np.mean(img) > 0.5:  # If background is white
        img = 1 - img
    
    return img

# Prediction loop
image_number = 1
while os.path.isfile(f"digits/digit{image_number}.png"):
    try:
        img_path = f"digits/digit{image_number}.png"
        img = preprocess_image(img_path)
        
        # Reshape for prediction
        img = np.expand_dims(img, axis=0)
        
        # Get prediction
        prediction = model.predict(img, verbose=0)
        predicted_digit = np.argmax(prediction)
        confidence = np.max(prediction) * 100
        
        print(f"Digit {image_number}: Predicted {predicted_digit} with {confidence:.2f}% confidence")
        
        # Display the image
        plt.imshow(img[0], cmap='gray')
        plt.title(f"Predicted: {predicted_digit}")
        plt.show()
        
    except Exception as e:
        print(f"Error processing image {image_number}: {str(e)}")
    
    image_number += 1
