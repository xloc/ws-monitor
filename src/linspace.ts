import _ from "lodash";

export const linspace = (st: number, ed: number, n: number) => {
  const step = (ed - st) / (n - 1);
  return _.range(n).map(i => i * step);
};

