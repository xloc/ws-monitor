import classNames from 'classnames';
import { useEffect, useState } from 'react';
import _ from "lodash";


const useWebSocket = (url: string, onMessage?: (message: any) => void) => {
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

interface Record {
  [key: string]: number;
}

function App() {
  const [sequence, setSequence] = useState<Record[]>([]);

  const { json, close } = useWebSocket('ws://10.0.0.5/ws', (message) => {
    setSequence((prev) => ([...prev, ...message]));
  });

  return (
    <div className="flex h-screen justify-center items-center">
      <div className='flex flex-col items-center'>
        <h1 className="text-5xl">Hello World!</h1>
        <button
          className='h-10 w-40 text-lg rounded-lg bg-slate-600 text-white m-3'
          onClick={() => { close(); }}>Close WebSocket</button>
        <pre className='border rounded-md w-[30rem] h-[20rem] overflow-y-scroll'>
          {/* {json} */}
          {JSON.stringify(sequence, null, 2)}
        </pre>
      </div>

    </div >
  );
}

export default App;
