import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import _ from "lodash";
import { useWebSocket } from './useWebSocket';


class Oscilloscope {
  records: Record[];
  drawRequestID?: number;
  tRange: number = 20;
  vRange: number = 2;
  vCenter: number = 0;


  constructor() {
    this.records = [];
  }

  append(record: Record) {
    this.records.push(record);
  }

  animate(canvas: HTMLCanvasElement) {
    const { width, height } = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 1;
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'white';

    const drawLoop = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.lineTo(0, 0);
      ctx.lineTo(width / 2, height / 3 * 2);
      ctx.lineTo(width, height);
      ctx.stroke();
    };

    this.drawRequestID = requestAnimationFrame(drawLoop);
  }

  stop() {
    this.drawRequestID && cancelAnimationFrame(this.drawRequestID);
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, w: number) {

  }
}





interface Record {
  [key: string]: number;
}

function App() {
  const [sequence, setSequence] = useState<Record[]>([]);
  const canvasRef = useRef(null);

  const { json, close } = useWebSocket('ws://10.0.0.5/ws', (message) => {
    setSequence((prev) => ([...prev, ...message]));
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const osc = new Oscilloscope();

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
