import _ from "lodash";
import { Record } from "./Record";
import wave from './wave.json';

class Range {
  constructor(public st: number, public ed: number) { }

  public get span(): number {
    return this.ed - this.st;
  }

  normalize(value: number): number {
    value = _.clamp(value, this.st, this.ed);
    value = (value - this.st) / this.span;
    return value
  }
}


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

    ctx.lineWidth = 1;
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'white';

    const drawLoop = () => {
      ctx.clearRect(0, 0, width, height);
      this.draw(ctx, width, height);
    };

    this.drawRequestID = requestAnimationFrame(drawLoop);
  }

  stop() {
    this.drawRequestID && cancelAnimationFrame(this.drawRequestID);
  }

  draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.beginPath();

    let i = bisect_left(wave, (o) => o.t, this.tRange.st);
    for (; i < wave.length; i++) {
      const pt = wave[i];
      if (pt.t > this.tRange.ed) break;

      const x = w * this.tRange.normalize(pt.t);
      const y = h - h * this.vRange.normalize(pt.bb);

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
