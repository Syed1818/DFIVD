import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const { data } = await axios.post(`${API}/api/analyze`, fd);
      if (data.status === "done") {
        setResult(data.result);
      } else {
        // Poll for video
        const jobId = data.job_id;
        const poll = setInterval(async () => {
          const { data: s } = await axios.get(`${API}/api/status/${jobId}`);
          if (s.status === "done") {
            clearInterval(poll);
            setResult(s.result);
            setLoading(false);
          } else if (s.status === "error") {
            clearInterval(poll);
            setResult({ error: s.error });
            setLoading(false);
          }
        }, 2000);
        return;
      }
    } catch (e) {
      setResult({ error: e.message });
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Deepfake & AI-Gen Detector</h1>
      <input type="file" onChange={(e) => setFile(e.target.files[0])}
             accept="video/*,image/*" />
      <button onClick={analyze} disabled={!file || loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {result && (
        <div style={{
          marginTop: 20, padding: 20, background: "#f5f5f5", borderRadius: 8
        }}>
          <h2>{result.prediction || result.error}</h2>
          {Object.entries(result).map(([k, v]) =>
            k !== "prediction" && (
              <div key={k} style={{ display: "flex",
                                     justifyContent: "space-between" }}>
                <span>{k.replace(/_/g, " ")}</span>
                <span>{String(v)}</span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}