import cv2
import mediapipe as mp
import numpy as np
import base64
from flask import Flask, render_template
from flask_socketio import SocketIO, emit

LEFT_CHOICE_BOUNDARY = 0.35
RIGHT_CHOICE_BOUNDARY = 0.65
MIN_DETECTION_CONFIDENCE = 0.7
MIN_TRACKING_CONFIDENCE = 0.7

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-very-secret-key!'
socketio = SocketIO(app, async_mode='eventlet')

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    model_complexity=0,
    min_detection_confidence=MIN_DETECTION_CONFIDENCE,
    min_tracking_confidence=MIN_TRACKING_CONFIDENCE,
    max_num_hands=2
)

def decode_image(data_uri):
    try:
        encoded_data = data_uri.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('video_frame')
def handle_video_frame(data_uri):
    frame = decode_image(data_uri)
    if frame is None:
        return

    frame = cv2.flip(frame, 1)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    results = hands.process(rgb_frame)

    detected_choice = "NEUTRAL"
    if results.multi_hand_landmarks and results.multi_handedness:
        for i, hand_landmarks in enumerate(results.multi_hand_landmarks):
            hand_label = results.multi_handedness[i].classification[0].label
            wrist_x = hand_landmarks.landmark[mp_hands.HandLandmark.WRIST].x

            if hand_label == 'Left' and wrist_x < LEFT_CHOICE_BOUNDARY:
                detected_choice = "LEFT"
                break
            elif hand_label == 'Right' and wrist_x > RIGHT_CHOICE_BOUNDARY:
                detected_choice = "RIGHT"
                break
    
    emit('hand_update', {'choice': detected_choice})

if __name__ == '__main__':
    print("Starting Flask server with SocketIO...")
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
