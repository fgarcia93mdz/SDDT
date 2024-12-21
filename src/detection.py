from ultralytics import YOLO
import cv2
import math
import yaml

class FireDetection:
    def __init__(self, config_path):
        with open(config_path, 'r') as file:
            config = yaml.safe_load(file)
        self.mode = config['mode']
        self.camera_url = config['camera']['url']
        self.camera_id = config['camera']['id']
        self.client_name = config['client']['name']
        self.emergency_numbers = config['client']['emergency_numbers']
        self.model = YOLO('models/BestModel.pt')
        self.classnames = ['Fire', 'Smoke']
        self.colors = {'Fire': (0, 0, 255), 'Smoke': (255, 0, 0)}
        self.sample_video_path = 'assets/samples/firevideo3.mp4'

    def detect_fire(self):
        if self.mode == 'development':
            cap = cv2.VideoCapture(self.sample_video_path)
        else:
            cap = cv2.VideoCapture(self.camera_url)

        if not cap.isOpened():
            print("Error: Cannot open video stream.")
            return

        while True:
            ret, frame = cap.read()
            if not ret:
                print("End of video stream or cannot read frame.")
                break

            cv2.imshow('Camera Stream', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

            blurred = cv2.GaussianBlur(frame, (5, 5), 0)
            h, w = frame.shape[:2]
            aspect_ratio = w / h
            frame = cv2.resize(blurred, (1280, int(1280 / aspect_ratio)))

            results = self.model(frame)
            for result in results:
                for box in result.boxes:
                    confidence = box.conf[0]
                    confidence = math.ceil(confidence * 100)
                    class_id = int(box.cls[0])

                    if confidence > 50:
                        x1, y1, x2, y2 = box.xyxy[0]
                        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                        class_name = self.classnames[class_id]
                        box_color = self.colors[class_name]

                        cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, thickness=2)
                        label = f'{class_name} {confidence}%'
                        font = cv2.FONT_HERSHEY_TRIPLEX
                        font_scale = 0.6
                        font_thickness = 1
                        text_size = cv2.getTextSize(label, font, font_scale, font_thickness)[0]
                        text_x = x1
                        text_y = y1 - 10 if y1 - 10 > 10 else y1 + 10
                        cv2.rectangle(frame, (text_x, text_y - text_size[1] - 5), 
                                      (text_x + text_size[0] + 5, text_y + 5), box_color, -1)
                        cv2.putText(frame, label, (text_x, text_y), font, font_scale, 
                                    (255, 255, 255), thickness=font_thickness, lineType=cv2.LINE_AA)

                        image_path = 'incendio.jpg'
                        cv2.imwrite(image_path, frame)
                        cv2.imshow('Incendio Detectado', frame)
                        cv2.waitKey(5000)
                        return image_path

        cap.release()
        cv2.destroyAllWindows()