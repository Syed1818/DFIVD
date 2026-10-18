import { createContext, useContext, useState, useEffect } from 'react';

const DetectionContext = createContext();

const API_BASE = "http://localhost:8000/api";

export function DetectionProvider({ children }) {
  const [videoState, setVideoState] = useState({
    file: null,
    previewUrl: null,
    loading: false,
    progress: 0,
    result: null,
    error: "",
    logs: [],
    apiOnline: false
  });

  const [imageState, setImageState] = useState({
    file: null,
    previewUrl: null,
    loading: false,
    progress: 0,
    result: null,
    error: "",
    logs: [],
    apiOnline: false
  });

  // Check API health globally
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(res => {
        const isOk = res.ok;
        setVideoState(s => ({ ...s, apiOnline: isOk }));
        setImageState(s => ({ ...s, apiOnline: isOk }));
      })
      .catch(() => {
        setVideoState(s => ({ ...s, apiOnline: false }));
        setImageState(s => ({ ...s, apiOnline: false }));
      });
  }, []);

  const analyzeVideo = async () => {
    if (!videoState.file) return;
    
    setVideoState(prev => ({
      ...prev,
      loading: true,
      progress: 5,
      result: null,
      error: "",
      logs: ["Initiating secure connection...", "Uploading media payload..."]
    }));

    const formData = new FormData();
    formData.append("file", videoState.file);

    try {
      const response = await fetch(`${API_BASE}/analyze`, { method: "POST", body: formData });
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Detector API returned invalid JSON.");
      }

      if (!response.ok) throw new Error(data?.detail || "API unavailable.");

      if (data.status === "done") {
        setVideoState(prev => ({
          ...prev,
          loading: false,
          progress: 100,
          result: data.result,
          logs: [...prev.logs, "Analysis complete."]
        }));
        return;
      }

      const jobId = data.job_id;
      setVideoState(prev => ({
        ...prev,
        logs: [...prev.logs, `Job initialized (ID: ${jobId})`, "Establishing telemetry stream..."]
      }));

      // Poll for status
      const poll = async () => {
        try {
          const res = await fetch(`${API_BASE}/status/${jobId}`);
          const msgData = await res.json();
          
          if (msgData.status === "processing") {
            setVideoState(prev => ({
              ...prev,
              progress: Math.min(prev.progress + 5, 95),
              logs: [...prev.logs, "Processing in progress..."]
            }));
            setTimeout(poll, 2000);
          } 
          else if (msgData.status === "done") {
            setVideoState(prev => ({
              ...prev,
              loading: false,
              progress: 100,
              result: msgData.result,
              logs: [...prev.logs, "Sequence analysis complete.", "Compiling probability matrix..."]
            }));
          }
          else if (msgData.status === "error") {
            setVideoState(prev => ({
              ...prev,
              loading: false,
              error: msgData.error || "Analysis failed.",
              logs: [...prev.logs, `[ERROR] ${msgData.error || "Unknown error occurred"}`]
            }));
          }
        } catch {
          setVideoState(prev => ({
            ...prev,
            loading: false,
            error: "Telemetry stream error.",
            logs: [...prev.logs, "[WARNING] Telemetry stream connection error."]
          }));
        }
      };

      setTimeout(poll, 2000);

    } catch (err) {
      setVideoState(prev => ({
        ...prev,
        loading: false,
        error: err.message,
        logs: [...prev.logs, `[CRITICAL FAILURE] ${err.message}`]
      }));
    }
  };

  const analyzeImage = async () => {
    if (!imageState.file) return;
    
    setImageState(prev => ({
      ...prev,
      loading: true,
      progress: 10,
      result: null,
      error: "",
      logs: ["Initiating spatial context capture...", "Transmitting payload..."]
    }));

    const formData = new FormData();
    formData.append("file", imageState.file);

    try {
      const response = await fetch(`${API_BASE}/analyze`, { method: "POST", body: formData });
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Detector API returned invalid JSON.");
      }

      if (!response.ok) throw new Error(data?.detail || "API unavailable.");

      if (data.status === "done") {
        setImageState(prev => ({
          ...prev,
          loading: false,
          progress: 100,
          result: data.result,
          logs: [...prev.logs, "Spatial rendering complete.", "Generating forensic heatmaps..."]
        }));
      } else {
        setImageState(prev => ({
          ...prev,
          loading: false,
          error: "Unexpected background task state for image.",
        }));
      }
    } catch (err) {
      setImageState(prev => ({
        ...prev,
        loading: false,
        error: err.message,
        logs: [...prev.logs, `[CRITICAL FAILURE] ${err.message}`]
      }));
    }
  };

  const setVideoFile = (file) => {
    if (videoState.previewUrl) URL.revokeObjectURL(videoState.previewUrl);
    setVideoState(prev => ({
      ...prev,
      file,
      previewUrl: file ? URL.createObjectURL(file) : null,
      result: null,
      error: "",
      logs: [],
      progress: 0
    }));
  };

  const setImageFile = (file) => {
    if (imageState.previewUrl) URL.revokeObjectURL(imageState.previewUrl);
    setImageState(prev => ({
      ...prev,
      file,
      previewUrl: file ? URL.createObjectURL(file) : null,
      result: null,
      error: "",
      logs: [],
      progress: 0
    }));
  };

  return (
    <DetectionContext.Provider value={{
      videoState,
      setVideoFile,
      analyzeVideo,
      imageState,
      setImageFile,
      analyzeImage,
      resetVideo: () => setVideoFile(null),
      resetImage: () => setImageFile(null)
    }}>
      {children}
    </DetectionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDetection = () => useContext(DetectionContext);
