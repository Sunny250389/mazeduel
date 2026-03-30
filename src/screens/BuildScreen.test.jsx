import { calculateBuildCellSize } from "./BuildScreen";

describe("calculateBuildCellSize", () => {
  test("fits a 21x21 build grid inside an 800x450 iframe area", () => {
    expect(calculateBuildCellSize(21, 800, 450)).toBe(21);
  });

  test("uses height as the limiting factor when vertical space is tighter", () => {
    expect(calculateBuildCellSize(21, 800, 240)).toBe(11);
  });
});