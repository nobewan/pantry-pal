from picamera2 import Picamera2
import cv2

picam2 = Picamera2()

# Configure preview resolution
config = picam2.create_preview_configuration(
    main={"size": (640, 480)}
)
picam2.configure(config)

picam2.start()

while True:
    frame = picam2.capture_array()

    # Convert RGB -> BGR for OpenCV
    frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

    cv2.imshow("IMX500 Preview", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cv2.destroyAllWindows()
picam2.stop()