import { describe, expect, it } from "vitest";

import { getPageRange } from "@/lib/constants";

describe("getPageRange", () => {
  it("computes an inclusive from/to range for page 1", () => {
    expect(getPageRange(1, 15)).toEqual({ from: 0, to: 14, currentPage: 1 });
  });

  it("computes the range for a later page", () => {
    expect(getPageRange(3, 15)).toEqual({ from: 30, to: 44, currentPage: 3 });
  });

  it("clamps page numbers below 1", () => {
    expect(getPageRange(0, 15)).toEqual({ from: 0, to: 14, currentPage: 1 });
    expect(getPageRange(-5, 15)).toEqual({ from: 0, to: 14, currentPage: 1 });
  });

  it("respects a custom page size", () => {
    expect(getPageRange(2, 10)).toEqual({ from: 10, to: 19, currentPage: 2 });
  });
});
