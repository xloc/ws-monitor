import { describe, expect, it } from "vitest";
import { linspace } from "./linspace";


describe.concurrent('suite', () => {
  it('concurrent test 1', async () => {
    expect(linspace(0, 5, 6)).toStrictEqual([0, 1, 2, 3, 4, 5]);
  });
});
