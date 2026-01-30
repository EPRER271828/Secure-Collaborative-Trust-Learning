import { useState, useEffect } from 'react';

export function useRealTimeData() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Connect to the master stream we built in app.py
    // Replace the hardcoded localhost line with this:
    // Use process.env for Create React App
    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const eventSource = new EventSource(`${API_BASE_URL}/api/stream`);

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
      } catch (err) {
        console.error("Failed to parse stream data", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection Error:", err);
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  return data;
}