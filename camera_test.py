import cv2

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)  # Usa DirectShow en Windows
# cap = cv2.VideoCapture(0, cv2.CAP_GSTREAMER)  # Usa GStreamer

if not cap.isOpened():
    print("Error: Cannot open camera.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Cannot read frame.")
        break

    cv2.imshow('Camera Test', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()