import React, { useEffect, useRef, useState } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

function Plank() {
  // Refs for the video and canvas
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // State for feedback and timing
  const [feedbackMessage, setFeedbackMessage] = useState('Get ready for the plank!');
  const [totalPlankTime, setTotalPlankTime] = useState(0);

  // Variables for timing logic
  let x = 0;
  let a = 0;
  let y = 0;
  let start = 0;
  let stop = 0;
  let begain = 0;
  let stopHolder = 0;

  useEffect(() => {
    // 1. Initialize Pose
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    // Pose config
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    // 2. Define onResults callback
    pose.onResults(onResults);

    // 3. Initialize camera
    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    // Cleanup if needed when unmounted
    return () => {
      // e.g., stop camera if you want
    };
    // eslint-disable-next-line
  }, []);

  // Calculate the angle between three points (a-b-c)
  function calculateJointAngle(a, b, c) {
    // Points a, b, c are [x, y]
    const radians =
      Math.atan2(c[1] - b[1], c[0] - b[0]) -
      Math.atan2(a[1] - b[1], a[0] - b[0]);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360.0 - angle;
    }
    return angle;
  }

  // Our main callback when Mediapipe Pose has results
  function onResults(results) {
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');

    // 1. Draw the video
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    // 2. Make sure we have any pose landmarks
    if (!results.poseLandmarks) {
      setFeedbackMessage('No pose detected — please step into the frame.');
      canvasCtx.restore();
      return;
    }

    // 3. Check for specific required landmarks
    const landmarks = results.poseLandmarks;
    const REQUIRED_INDICES = [12, 14, 24, 26, 28]; // right shoulder, elbow, hip, knee, ankle
    const allLandmarksPresent = REQUIRED_INDICES.every((idx) => landmarks[idx]);
    if (!allLandmarksPresent) {
      setFeedbackMessage(
        'Missing one or more key landmarks (shoulder, elbow, hip, knee, ankle).'
      );
      canvasCtx.restore();
      return;
    }

    // 4. Extract normalized coordinates for these points
    const shoulder = [landmarks[12].x, landmarks[12].y];
    const elbow = [landmarks[14].x, landmarks[14].y];
    const hip = [landmarks[24].x, landmarks[24].y];
    const knee = [landmarks[26].x, landmarks[26].y];
    const ankle = [landmarks[28].x, landmarks[28].y];

    // 5. Convert to actual canvas coordinates
    const canvasWidth = canvasElement.width;
    const canvasHeight = canvasElement.height;
    const points = {
      shoulder: {
        x: shoulder[0] * canvasWidth,
        y: shoulder[1] * canvasHeight,
      },
      elbow: {
        x: elbow[0] * canvasWidth,
        y: elbow[1] * canvasHeight,
      },
      hip: {
        x: hip[0] * canvasWidth,
        y: hip[1] * canvasHeight,
      },
      knee: {
        x: knee[0] * canvasWidth,
        y: knee[1] * canvasHeight,
      },
      ankle: {
        x: ankle[0] * canvasWidth,
        y: ankle[1] * canvasHeight,
      },
    };

    // Utility: check if a point is within canvas
    function isInCanvas(pt) {
      return (
        pt.x >= 0 &&
        pt.x <= canvasWidth &&
        pt.y >= 0 &&
        pt.y <= canvasHeight
      );
    }

    // 6. Verify all required joints are in the visible canvas
    const allInCanvas = Object.values(points).every((pt) => isInCanvas(pt));
    if (!allInCanvas) {
      setFeedbackMessage('Your joints are out of the frame — move or adjust camera!');
      canvasCtx.restore();
      return;
    }

    // 7. Calculate angles using the normalized coords
    const backAngle = calculateJointAngle(shoulder, hip, knee);
    const legAngle = calculateJointAngle(hip, knee, ankle);
    const armAngle = calculateJointAngle(elbow, shoulder, hip);

    // 8. Check plank conditions
    if (
      backAngle >= 160 && backAngle <= 180 &&
      legAngle >= 160 && legAngle <= 180 &&
      armAngle >= 60 && armAngle <= 140
    ) {
      // Proper plank form
      setFeedbackMessage('Hold steady!');

      // Timing logic
      if (a === 0) {
        start = Date.now();
        a++;
      }
      if (y === 0) {
        begain = Date.now();
      }
      if (y === 0 && stop !== 0) {
        stopHolder += Number(((begain - stop) / 1000).toFixed(1));
        y++;
      }
      if (stop !== 0) {
        setTotalPlankTime(
          (
            Number(((Date.now() - start) / 1000).toFixed(1)) - stopHolder
          ).toFixed(1)
        );
      } else {
        setTotalPlankTime(((Date.now() - start) / 1000).toFixed(1));
      }
      x = 0;
    } else {
      // User is not in a correct plank
      setFeedbackMessage('Adjust your plank position!');
      if (x === 0 && a !== 0) {
        stop = Date.now();
        x++;
        y = 0;
      }
    }

    // 9. Optionally draw all landmarks as red circles
    drawLandmarks(canvasCtx, landmarks);
    canvasCtx.restore();
  }

  // Function to draw circles for each detected landmark
  function drawLandmarks(ctx, landmarks) {
    ctx.fillStyle = 'red';
    for (let i = 0; i < landmarks.length; i++) {
      const x = landmarks[i].x * canvasRef.current.width;
      const y = landmarks[i].y * canvasRef.current.height;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Plank Detector</h1>
      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{ border: '1px solid black' }}
      />
      <h2>{feedbackMessage}</h2>
      <h3>Total Plank Time: {totalPlankTime} seconds</h3>
    </div>
  );
}

export default Plank;