import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const CustomWebcam = () => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

  const retake = () => {
    setImgSrc(null);
  };

  return (
    <div className = "flex items-center justify-center mb-10 rounded">
      
      {imgSrc ? (
        <img src={imgSrc} alt="webcam capture" />
      ) : (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={900}
          height={900}
          videoConstraints={{ exact: "environment" }} // Use back camera
        />
      )}
      <div>
        {imgSrc ? (
          <button onClick={retake}></button>
        ) : (
          <button onClick={capture}></button>
        )}
      </div>
    </div>
  );
};

export default CustomWebcam;
