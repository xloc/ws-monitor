import classNames from "classnames";
import _ from "lodash";
import { bisectLeft } from "./bisect";
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

    let i = bisectLeft(wave, (o) => o.t, this.tRange.st);
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

    ctx.textAlign = "right";
    ctx.fillText(`${this.tRange.span}`, w, 100);

    // draw horizontal ticks;
    const result = calcTicks(this.tRange, 10);
    ctx.fillText(`offset: ${result.offset}, scale: ${result.scale}`, w, 150);
    ctx.fillText(`st: ${result.st.toFixed(3)}, ed: ${result.ed.toFixed(3)}`, w, 200);
    ctx.fillText(`step: ${result.step}`, w, 250);

    result.ticks.forEach((v) => {
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



