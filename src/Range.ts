import _ from "lodash";

export
  class Range {
  constructor(public st: number, public ed: number) { }

  public get span(): number {
    return this.ed - this.st;
  }

  public get center(): number {
    return (this.st + this.ed) / 2;
  }

  public set span(value: number) {
    const center = this.center;
    this.st = center - value / 2;
    this.ed = center + value / 2;
  }

  public zoom(v: number) {
    this.st -= v / 2;
    this.ed += v / 2;
  }

  public shift(length: number) {
    this.st += length;
    this.ed += length;
  }


  normalize(value: number): number {
    value = _.clamp(value, this.st, this.ed);
    value = (value - this.st) / this.span;
    return value;
  }
}