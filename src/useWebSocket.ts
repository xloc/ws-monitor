import { useEffect, useState } from "react";

export const useWebSocket = (url: string, onMessage?: (message: any) => void) => {
  const [data, setData] = useState("");

  const [ws, setWs] = useState<WebSocket | undefined>();

  useEffect(() => {
    const socket = new WebSocket(url);
    socket.addEventListener('message', (event) => {
      const str = event.data;
      try {
        const parsed = JSON.parse(str);
        const pretty = JSON.stringify(parsed, null, '  ');
        setData(pretty);
        onMessage && onMessage(parsed);
      } catch (error) {
        if (error instanceof SyntaxError) {
          console.log({ str });
        }
        else throw error;
      }
    });

    socket.addEventListener("close", () => {
      console.log("ws closed");

    });

    setWs(socket);

    return () => {
      socket.onclose = function () { };
      socket.close();
    };
  }, []);

  return {
    json: data,
    close: () => {
      if (!ws) return;
      ws.onclose = function () { };
      ws.close();
    }
  };
};