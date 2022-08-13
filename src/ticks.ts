import { linspace } from "./linspace";
import { Range } from "./Range";

export const calcScaleOffset = (range: Range, n = 1, threshold = 10) => {
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
      Math.log10(range.span / n)
    )
  );

  return { offset, scale };
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
  range = nonsigular(range);

  const { offset, scale } = calcScaleOffset(range, 9);
  const rawStep = range.span / nTicks;

  let st = range.st - offset;
  let ed = range.ed - offset;
  [st, ed] = [range.st, range.ed]
    .map(v => v - offset)
    .map(v => Math.round(v * scale) / scale)
    .map(v => v + offset);

  return linspace(st, ed, nTicks);
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
