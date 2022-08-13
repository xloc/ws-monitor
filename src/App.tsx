import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import _ from "lodash";
import { useWebSocket } from './useWebSocket';
import { Record } from './Record';
import { Oscilloscope } from './Oscilloscope';



function App() {
  const [sequence, setSequence] = useState<Record[]>([]);
  const canvasRef = useRef(null);

  const { json, close } = useWebSocket('ws://10.0.0.5/ws', (message) => {
    setSequence((prev) => ([...prev, ...message]));
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current as HTMLCanvasElement;
    const scale = window.devicePixelRatio;
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;

    const osc = new Oscilloscope();

    canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      event = event as WheelEvent;
      osc.tRange.zoom(event.deltaY * 0.01);
    }, { passive: false });

    osc.animate(canvas);

    return () => {
      osc.stop();
    };
  }, [canvasRef]);


  return (
    <div className="w-screen h-screen justify-center items-center relative">
      <ul className='m-3 absolute'>
        <li><button
          className='p-2 rounded-lg shadow-lg'
          onClick={() => { close(); }}>Disconnect
        </button></li>

      </ul>
      <canvas className='w-screen h-screen absolute' ref={canvasRef}></canvas>
    </div >
  );
}

export default App;
