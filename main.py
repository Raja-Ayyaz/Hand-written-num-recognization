import os
import cv2
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf

# # Load the MNIST dataset
# mnist = tf.keras.datasets.mnist
# (x_train, y_train), (x_test, y_test) = mnist.load_data()
# # Load the MNIST dataset
# mnist = tf.keras.datasets.mnist
# (x_train, y_train), (x_test, y_test) = mnist.load_data()

# # Normalize the input data
# x_train = tf.keras.utils.normalize(x_train, axis=1)
# x_test = tf.keras.utils.normalize(x_test, axis=1)

# Define the model
# model = tf.keras.models.Sequential()
# model.add(tf.keras.layers.Flatten(input_shape=(28, 28)))  # Flatten the 28x28 images to a 1D array
# model.add(tf.keras.layers.Dense(128, activation=tf.nn.relu, kernel_regularizer=tf.keras.regularizers.L1(0.01)))  # First hidden layer with L1 regularization
# model.add(tf.keras.layers.Dropout(0.2))  # Dropout layer to prevent overfitting
# model.add(tf.keras.layers.Dense(128, activation=tf.nn.relu, kernel_regularizer=tf.keras.regularizers.L1(0.01)))  # Second hidden layer with L1 regularization
# model.add(tf.keras.layers.Dropout(0.2))  # Dropout layer to prevent overfitting
# model.add(tf.keras.layers.Dense(10, activation=tf.nn.softmax))  # Output layer with 10 classes

# Compile the model
# model.compile(optimizer=tf.keras.optimizers.Adam(lr=0.001), loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Train the model
# model.fit(x_train, y_train, epochs=10, batch_size=128, validation_data=(x_test, y_test))

# Save the trained model
# model.save('num_reader.model')
# Normalize the input data
# x_train = tf.keras.utils.normalize(x_train, axis=1)
# x_test = tf.keras.utils.normalize(x_test, axis=1)

# Define the model
# model = tf.keras.models.Sequential()
# model.add(tf.keras.layers.Flatten(input_shape=(28, 28)))  # Flatten the 28x28 images to a 1D array
# model.add(tf.keras.layers.Dense(128, activation=tf.nn.relu))  # First hidden layer
# model.add(tf.keras.layers.Dense(128, activation=tf.nn.relu))  # Second hidden layer
# model.add(tf.keras.layers.Dense(10, activation=tf.nn.softmax))  # Output layer with 10 classes

# Compile the model
# model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Train the model
# model.fit(x_train, y_train, epochs=5)

# Save the trained model
# model.save('num_reader.model')

model = tf.keras.models.load_model('num_reader.model')
image_number=1

while os.path.isfile(f"digits/digit{image_number}.png"):
    try:
        img = cv2.imread(f"digits/digit{image_number}.png")[:,:,0]
        img = np.invert(np.array([img]))
        prediction = model.predict(img)
        print(f"This digit is probably a {np.argmax(prediction)}")
        plt.imshow(img[0], cmap=plt.cm.binary)
        plt.show()
    except:
        print("Error!")
    finally:
        image_number += 1
