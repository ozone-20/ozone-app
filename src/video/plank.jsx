// import React, { useEffect, useRef, useState, useCallback } from "react";
// // If you installed via npm, you can import from "@mediapipe/tasks-vision" 
// // For demonstration, we keep the Skypack import:
// import {
//   PoseLandmarker,
//   FilesetResolver,
//   DrawingUtils,
// } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

// const Plank = () => {
//   // State to hold the loaded pose landmarker.
//   const [poseLandmarker, setPoseLandmarker] = useState(null);
//   // State to track whether we are in IMAGE or VIDEO mode.
//   const [runningMode, setRunningMode] = useState("IMAGE");
//   // State to track if the webcam is currently running.
//   const [webcamRunning, setWebcamRunning] = useState(false);

//   // Refs for webcam video and canvas.
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   // Ref to store the last video time so that we only process new frames.
//   const lastVideoTimeRef = useRef(-1);

//   // When the component mounts (or runningMode changes), create the PoseLandmarker.
//   useEffect(() => {
//     const createPoseLandmarker = async () => {
//       console.log("Loading the pose landmarker...");
//       try {
//         const vision = await FilesetResolver.forVisionTasks(
//           "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
//         );

//         // Force CPU if GPU is problematic, by switching delegate: "CPU"
//         const poseLM = await PoseLandmarker.createFromOptions(vision, {
//           baseOptions: {
//             modelAssetPath:
//               "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
//             delegate: "GPU",
//             // delegate: "CPU", // Uncomment if your GPU has issues
//           },
//           runningMode,
//           numPoses: 2,
//         });

//         console.log("Pose landmarker loaded successfully!");
//         setPoseLandmarker(poseLM);
//       } catch (error) {
//         console.error("Error loading pose landmarker:", error);
//       }
//     };

//     createPoseLandmarker();
//   }, [runningMode]);

//   // ----- Demo 1: Detecting poses on images -----
//   const handleImageClick = async (e) => {
//     if (!poseLandmarker) {
//       console.warn("Wait for poseLandmarker to load before clicking!");
//       return;
//     }

//     // If the model is running in VIDEO mode, switch back to IMAGE mode.
//     if (runningMode === "VIDEO") {
//       console.log("Switching model to IMAGE mode for image detection...");
//       setRunningMode("IMAGE");
//       await poseLandmarker.setOptions({ runningMode: "IMAGE" });
//     }

//     // Remove any existing canvas overlays in the image container.
//     const container = e.currentTarget.parentElement;
//     container.querySelectorAll(".canvas-overlay").forEach((canvas) => {
//       canvas.remove();
//     });

//     // Run detection on the clicked image.
//     poseLandmarker.detect(e.currentTarget, (result) => {
//       console.log("Image detection result:", result);

//       // Create a canvas overlay on the image.
//       const overlayCanvas = document.createElement("canvas");
//       overlayCanvas.className = "canvas-overlay";
//       overlayCanvas.width = e.currentTarget.naturalWidth;
//       overlayCanvas.height = e.currentTarget.naturalHeight;
//       // Position the canvas absolutely over the image.
//       overlayCanvas.style.position = "absolute";
//       overlayCanvas.style.left = "0px";
//       overlayCanvas.style.top = "0px";
//       overlayCanvas.style.width = `${e.currentTarget.width}px`;
//       overlayCanvas.style.height = `${e.currentTarget.height}px`;
//       container.appendChild(overlayCanvas);

//       const canvasCtx = overlayCanvas.getContext("2d");
//       const drawingUtils = new DrawingUtils(canvasCtx);

//       // Draw landmarks and connectors for each detected pose.
//       for (const landmark of result.landmarks) {
//         drawingUtils.drawLandmarks(landmark, {
//           radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
//         });
//         drawingUtils.drawConnectors(
//           landmark,
//           PoseLandmarker.POSE_CONNECTIONS
//         );
//       }
//     });
//   };

//   // ----- Demo 2: Webcam continuous detection -----
//   const enableCam = async () => {
//     if (!poseLandmarker) {
//       console.warn("Wait! poseLandmarker not loaded yet.");
//       return;
//     }

//     // Toggle on/off logic:
//     if (webcamRunning) {
//       console.log("Turning off webcam...");
//       setWebcamRunning(false);
//       if (videoRef.current && videoRef.current.srcObject) {
//         const tracks = videoRef.current.srcObject.getTracks();
//         tracks.forEach((track) => track.stop());
//       }
//     } else {
//       console.log("Requesting webcam access...");
//       setWebcamRunning(true);

//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         if (videoRef.current) {
//           // Assign the stream to the video element
//           videoRef.current.srcObject = stream;
//           // Some browsers need an explicit play():
//           await videoRef.current.play();

//           // Start predictions once the video is loaded
//           videoRef.current.addEventListener("loadeddata", () => {
//             console.log("Video is loaded; starting predictions...");
//             predictWebcam();
//           });
//         }
//       } catch (err) {
//         console.error("Error accessing webcam:", err);
//       }
//     }
//   };

//   const predictWebcam = useCallback(async () => {
//     if (!videoRef.current || !canvasRef.current || !poseLandmarker) {
//       console.warn("Missing references or poseLandmarker not ready.");
//       return;
//     }

//     // See how often we're calling this
//     console.log("predictWebcam called...");

//     const video = videoRef.current;
//     const canvas = canvasRef.current;

//     // Confirm the video is actually playing by logging currentTime
//     console.log("Video currentTime:", video.currentTime);

//     // Switch to VIDEO mode if it's in IMAGE mode
//     if (runningMode === "IMAGE") {
//       console.log("Switching model to VIDEO mode...");
//       setRunningMode("VIDEO");
//       await poseLandmarker.setOptions({ runningMode: "VIDEO" });
//     }

//     // Only run detection if there's a new video frame
//     const startTimeMs = performance.now();
//     if (lastVideoTimeRef.current !== video.currentTime) {
//       lastVideoTimeRef.current = video.currentTime;
//       poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
//         console.log("Detection result:", result);

//         const ctx = canvas.getContext("2d");
//         ctx.save();
//         // Clear previous drawings
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         const drawingUtils = new DrawingUtils(ctx);
//         // Draw pose landmarks and connectors
//         for (const landmark of result.landmarks) {
//           drawingUtils.drawLandmarks(landmark, {
//             radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
//           });
//           drawingUtils.drawConnectors(
//             landmark,
//             PoseLandmarker.POSE_CONNECTIONS
//           );
//         }
//         ctx.restore();
//       });
//     } else {
//       console.log("No new video frame; skipping detection...");
//     }

//     // Keep predicting if the webcam is on
//     if (webcamRunning) {
//       window.requestAnimationFrame(predictWebcam);
//     } else {
//       console.log("Webcam off; stopping the prediction loop.");
//     }
//   }, [poseLandmarker, runningMode, webcamRunning]);

//   return (
//     <div className="p-8">
//       <h1 className="text-3xl font-bold text-teal-700 mb-4">
//         Pose detection using the MediaPipe PoseLandmarker task
//       </h1>

//       <section id="demos">
//         {/* Demo 1: Image detection */}
//         <h2 className="text-2xl font-semibold mt-8">Demo: Detecting Images</h2>
//         <p className="mb-4">
//           <b>Click on an image below</b> to see the key landmarks of the body.
//         </p>
//         <div className="flex flex-wrap gap-4">
//           <div className="relative cursor-pointer w-full md:w-1/2">
//             <img
//               src="https://assets.codepen.io/9177687/woman-ge0f199f92_640.jpg"
//               alt="Detect pose"
//               className="w-full"
//               crossOrigin="anonymous"
//               onClick={handleImageClick}
//             />
//           </div>
//           <div className="relative cursor-pointer w-full md:w-1/2">
//             <img
//               src="https://assets.codepen.io/9177687/woman-g1af8d3deb_640.jpg"
//               alt="Detect pose"
//               className="w-full"
//               crossOrigin="anonymous"
//               onClick={handleImageClick}
//             />
//           </div>
//         </div>

//         {/* Demo 2: Webcam detection */}
//         <h2 className="text-2xl font-semibold mt-8">
//           Demo: Webcam continuous pose landmarks detection
//         </h2>
//         <p className="mb-4">
//           Stand in front of your webcam to get real-time pose detection.
//           <br />
//           Click <b>enable webcam</b> below and grant access to the webcam if
//           prompted.
//         </p>
//         <div id="liveView" className="relative">
//           <button
//             id="webcamButton"
//             onClick={enableCam}
//             className="bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2 px-4 rounded mb-4"
//           >
//             {webcamRunning ? "DISABLE PREDICTIONS" : "ENABLE WEBCAM"}
//           </button>
//           <div className="relative inline-block">
//             {/* 
//               Add muted to the video for autoplay 
//               and remove flipping if you prefer
//             */}
//             <video
//               id="webcam"
//               ref={videoRef}
//               muted
//               width="480"
//               height="360"
//               autoPlay
//               playsInline
//               style={{
//                 transform: "scaleX(-1)", // remove if you don't want mirror
//                 objectFit: "cover",
//               }}
//               className="bg-black"
//             ></video>
//             <canvas
//               id="output_canvas"
//               ref={canvasRef}
//               width="480"
//               height="360"
//               style={{
//                 position: "absolute",
//                 left: 0,
//                 top: 0,
//                 transform: "scaleX(-1)", // remove if you don't want mirror
//               }}
//             ></canvas>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Plank;

// PoseTracker.jsx
// import React, { useEffect, useRef, useState } from 'react';
// // import { Pose } from '@mediapipe/pose';
// import { Pose, POSE_CONNECTIONS, POSE_LANDMARKS } from "@mediapipe/pose";
// import { Camera } from '@mediapipe/camera_utils';
// import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

// // Utility function: Calculate angle between three points
// const calculateJointAngle = (a, b, c) => {
//   const radians =
//     Math.atan2(c.y - b.y, c.x - b.x) -
//     Math.atan2(a.y - b.y, a.x - b.x);
//   let angle = Math.abs((radians * 180) / Math.PI);
//   if (angle > 180) {
//     angle = 360 - angle;
//   }
//   return angle;
// };

// const PoseTracker = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   // State to hold feedback and timing info
//   const [feedbackMessage, setFeedbackMessage] = useState('Get ready for the plank!');
//   const [startTime, setStartTime] = useState(null);
//   const [holdDuration, setHoldDuration] = useState(0);
//   const [totalPlankTime, setTotalPlankTime] = useState(0);
//   const [readyToStart, setReadyToStart] = useState(false);

//   useEffect(() => {
//     // Initialize MediaPipe Pose
//     const pose = new Pose({
//       locateFile: (file) =>
//         `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
//     });
//     pose.setOptions({
//       modelComplexity: 1,
//       smoothLandmarks: true,
//       enableSegmentation: false,
//       minDetectionConfidence: 0.7,
//       minTrackingConfidence: 0.7,
//     });

//     pose.onResults((results) => {
//       // Draw the image and landmarks on the canvas
//       const canvasElement = canvasRef.current;
//       const canvasCtx = canvasElement.getContext('2d');
//       canvasCtx.save();
//       canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
//       canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

//       if (results.poseLandmarks) {
//         drawConnectors(canvasCtx, results.poseLandmarks, Pose.POSE_CONNECTIONS, {
//           color: '#00FF00',
//           lineWidth: 4,
//         });
//         drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });

//         // Example: Calculate angles using landmarks
//         const landmarks = results.poseLandmarks;

//         const shoulder = results.poseLandmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
//         const hip = results.poseLandmarks[POSE_LANDMARKS.RIGHT_HIP];
//         const ankle = results.poseLandmarks[POSE_LANDMARKS.RIGHT_ANKLE];
//         const knee = results.poseLandmarks[POSE_LANDMARKS.RIGHT_KNEE];
//         const elbow = results.poseLandmarks[POSE_LANDMARKS.RIGHT_ELBOW];
//         // const shoulder = landmarks[Pose.POSE_LANDMARKS.RIGHT_SHOULDER];
//         // const hip = landmarks[Pose.POSE_LANDMARKS.RIGHT_HIP];
//         // const ankle = landmarks[Pose.POSE_LANDMARKS.RIGHT_ANKLE];
//         // const knee = landmarks[Pose.POSE_LANDMARKS.RIGHT_KNEE];
//         // const elbow = landmarks[Pose.POSE_LANDMARKS.RIGHT_ELBOW];

//         const backAngle = calculateJointAngle(shoulder, hip, ankle);
//         const legAngle = calculateJointAngle(hip, knee, ankle);
//         const armAngle = calculateJointAngle(elbow, shoulder, hip);

//         // Check for proper plank position
//         if (backAngle >= 160 && backAngle <= 180 &&
//           legAngle >= 160 && legAngle <= 180 &&
//           armAngle >= 60 && armAngle <= 140) {
//           if (!readyToStart) {
//             setReadyToStart(true);
//             setStartTime(Date.now());
//             setFeedbackMessage('Hold steady!');
//           } else {
//             // Update hold duration in real time
//             setHoldDuration((Date.now() - startTime) / 1000);
//           }
//         } else {
//           if (readyToStart) {
//             // Add the hold duration to the total plank time
//             setTotalPlankTime(prev => prev + holdDuration);
//             setHoldDuration(0);
//             setStartTime(null);
//           }
//           setReadyToStart(false);
//           setFeedbackMessage('Adjust your plank position!');
//         }
//       }
//       canvasCtx.restore();
//     });

//     // Start the webcam using MediaPipe's Camera utility
//     if (videoRef.current) {
//       const camera = new Camera(videoRef.current, {
//         onFrame: async () => {
//           await pose.send({ image: videoRef.current });
//         },
//         width: 640,
//         height: 480,
//       });
//       camera.start();
//     }
//   }, [readyToStart, holdDuration, startTime]);

//   // Optionally, display the total time
//   const totalTime = totalPlankTime + (readyToStart ? holdDuration : 0);

//   return (
//     <div>
//       <h2>{feedbackMessage}</h2>
//       <h3>Total Time: {Math.floor(totalTime)} sec</h3>
//       {/* Hidden video element for processing */}
//       <video ref={videoRef} style={{ display: 'none' }} />
//       {/* Canvas to display the annotated video */}
//       <canvas ref={canvasRef} width={640} height={480} style={{ border: '1px solid black' }} />
//     </div>
//   );
// };

// export default PoseTracker;

import React, { useRef, useEffect, useState } from 'react';
import { Pose, POSE_CONNECTIONS, POSE_LANDMARKS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

function plank() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // For demonstration, we’ll keep a simple “status” message
  const [statusMessage, setStatusMessage] = useState('Initializing...');

  useEffect(() => {
    // 1. Create a new Pose instance
    const pose = new Pose({
      locateFile: (file) => {
        // Point to the official CDN so the WASM and supporting files can be fetched
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    // 2. Handle Pose results
    pose.onResults((results) => {
      // Logging for debugging
      console.log('Pose results:', results);

      // If no landmarks detected, do nothing
      if (!results.poseLandmarks) {
        setStatusMessage('No pose detected yet...');
        return;
      }

      setStatusMessage('Pose detected!');

      // 2A. Draw the results to our canvas
      const canvasElement = canvasRef.current;
      const canvasCtx = canvasElement.getContext('2d');

      // Clear the canvas
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Draw the camera image
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      // Draw the pose landmarks
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 4,
      });
      drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: '#FF0000',
        lineWidth: 2,
      });

      canvasCtx.restore();
    });

    // 3. Setup the camera using MediaPipe’s Camera utility
    if (videoRef.current) {
      // Provide the video element and the frame callback
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          // Send the current frame to the Pose model
          await pose.send({ image: videoRef.current });
        },
        width: 640,  // Ensure non-zero dimensions
        height: 480, // Ensure non-zero dimensions
      });
      camera.start().then(() => {
        setStatusMessage('Camera started. Looking for a pose...');
      }).catch((err) => {
        console.error('Camera start failed:', err);
        setStatusMessage('Camera start failed. Check console for details.');
      });
    }
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Pose Tracker</h1>
      <p>{statusMessage}</p>

      {/* The video element is hidden but used as the source for our Pose model. */}
      <video ref={videoRef} style={{ display: 'none' }} />

      {/* The canvas displays the annotated frames. */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{ border: '1px solid black' }}
      />
    </div>
  );
}

export default plank;