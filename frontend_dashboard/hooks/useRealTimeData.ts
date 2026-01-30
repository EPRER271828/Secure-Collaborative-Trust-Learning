import { useState, useEffect } from 'react';

export function useRealTimeData() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Priority: 1. Vercel Env Var -> 2. Localhost Fallback
    const API_BASE_URL = "https://revocative-bigotedly-veronica.ngrok-free.dev";
    
    const connectStream = () => {
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
        console.error("SSE Connection Error. Attempting to reconnect...", err);
        eventSource.close();
        // Reconnect after 3 seconds if the tunnel drops
        setTimeout(connectStream, 3000);
      };

      return eventSource;
    };

    const es = connectStream();
    return () => es.close();
  }, []);

  return data;
}