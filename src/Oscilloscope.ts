import classNames from "classnames";
import _ from "lodash";
import { linspace } from "./linspace";
import { Range } from "./Range";
import { Record } from "./Record";
import { calcTicks } from "./ticks";
import wave from './wave.json';



export class Oscilloscope {
  records: Record[];
  drawRequestID?: number;

  tRange = new Range(-1, 12);
  vRange = new Range(-1, 1);

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

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'white';

    const drawLoop = () => {
      ctx.clearRect(0, 0, width, height);
      this.draw(ctx, width, height);

      requestAnimationFrame(drawLoop);
    };

    this.drawRequestID = requestAnimationFrame(drawLoop);
  }

  stop() {
    this.drawRequestID && cancelAnimationFrame(this.drawRequestID);
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.beginPath();

    ctx.strokeStyle = "navy";
    ctx.lineWidth = 3;

    let i = bisect_left(wave, (o) => o.t, this.tRange.st);
    for (; i < wave.length; i++) {
      const pt = wave[i];
      if (pt.t > this.tRange.ed) break;

      const x = w * this.tRange.normalize(pt.t);
      const y = h - h * this.vRange.normalize(pt.bb);

      ctx.lineTo(x, y);
    }

    ctx.stroke();

    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1;

    // draw horizontal ticks;
    calcTicks(this.tRange, 10).forEach(v => {
      const x = w * this.tRange.normalize(v);
      ctx.beginPath();
      ctx.lineTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.font = "25px Arial";
      ctx.fillText(v.toFixed(3), x, h - 10);
    });

  }
}


function bisect_left<T>(arr: T[], key: (arg: T) => number, t: number): number {
  let lo = 0, hi = arr.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (t < key(arr[mid])) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}
