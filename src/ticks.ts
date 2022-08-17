import _ from "lodash";
import { bisectLeft } from "./bisect";
import { linspace } from "./linspace";
import { Range } from "./Range";

export const calcScaleOffset = (range: Range, threshold = 10) => {
  let offset;
  const mean = range.center;
  if (Math.abs(mean) / range.span < threshold) {
    offset = 0;
  } else {
    offset = Math.pow(10,
      Math.floor(
        Math.log10(Math.abs(mean))
      )
    ) * Math.sign(mean);
  }

  let scale = Math.pow(10,
    Math.floor(
      Math.log10(range.span)
    )
  );

  return { offset, scale };
};

const nDecimalPlaces = (n: number) => {
};


if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('calcScaleOffset', () => {
    expect(calcScaleOffset(new Range(0, 10))).toStrictEqual({ offset: 0, scale: 10 });
    expect(calcScaleOffset(new Range(0, 50))).toStrictEqual({ offset: 0, scale: 10 });
    expect(calcScaleOffset(new Range(0, 100))).toStrictEqual({ offset: 0, scale: 100 });
    expect(calcScaleOffset(new Range(100, 101))).toStrictEqual({ offset: 100, scale: 1 });
    expect(calcScaleOffset(new Range(10, 11))).toStrictEqual({ offset: 10, scale: 1 });
  });
}


export const calcTicks = (range: Range, nTicks: number) => {
  // range = nonsigular(range);

  // TODO:
  // nonsingular, ensure one point in the scene, exponential scale rather than linear now

  let { offset, scale } = calcScaleOffset(range, 9);
  const rawStep = range.span / nTicks;
  let stepScale = Math.pow(10, Math.floor(Math.log10(rawStep)));
  let ticks = [1, 2, 5, 10];

  let step: number;
  step = rawStep / stepScale;
  if (Number.isFinite(step) && !Number.isNaN(step) && step) {
    step = _(ticks)
      .map((v) => ({ d: Math.abs(v - step), v }))
      .minBy((v) => v.d)!.v;
    step *= stepScale;
  }


  let v;

  v = range.st;
  v = Math.ceil(v / scale) * scale;
  const st = v;

  v = range.ed;
  v = Math.floor(v / scale) * scale;
  const ed = v;

  return { ticks: [..._.range(st, range.st, -step), ..._.range(st, range.ed, step)], offset, scale, st, ed, step };
};



export const nonsigular = (range: Range, expander = 0.01, tiny = 1e-15) => {
  const maxAbs = Math.max(Math.abs(range.st), Math.abs(range.ed));
  if (maxAbs < tiny) {
    return new Range(-expander, expander);
  } else if (range.span < tiny * maxAbs) {
    return new Range(range.st - expander, range.ed + expander);
  } else {
    return range;
  }

};
