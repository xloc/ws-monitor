import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import _ from "lodash";
import { useWebSocket } from './useWebSocket';
import wave from './wave.json';


class Oscilloscope {
  records: Record[];
  drawRequestID?: number;
  tRange: number = 10;
  tEnd: number = 11;
  vRange: number = 4;
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
      this.draw(ctx, 0, 0, width, height);
    };

    this.drawRequestID = requestAnimationFrame(drawLoop);
  }

  stop() {
    this.drawRequestID && cancelAnimationFrame(this.drawRequestID);
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.beginPath();
    // ctx.lineTo(0, 0);
    // ctx.lineTo(w / 2, h / 3);
    // ctx.lineTo(w, h);

    const getT: any = (o: { t: number }) => o.t;

    let i = wave.length - 1;
    let tStart = getT(wave[i]) - this.tRange;
    if (this.tEnd !== Infinity) {
      i = bisect_left(wave, getT, this.tEnd);
      tStart = getT(wave[i]) - this.tRange;
    }
    for (; i >= 0 && tStart < getT(wave[i]); i--) {
      const pt = wave[i];
      const value = pt.bb;
      const t = pt.t;

      const x = w - t * w / this.tRange;
      const y = h - value * h / this.vRange - h / 2;

      ctx.lineTo(x, y);
    }

    ctx.stroke();
  }
}

function bisect_left<T>(arr: T[], key: (arg: T) => number, t: number): number {
  let lo = 0, hi = arr.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (t < key(arr[mid])) {
      hi = mid;
    } else {
      lo = mid + 1
    }
  }
  return lo;
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


  useEffect(() => {
    (wave as { aa: number }[])
      .map(({ aa }) => {
        return aa;
      });

  }, [])



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
