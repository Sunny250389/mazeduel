import { calculateMazeBounds } from "./RunScreen";

describe("calculateMazeBounds", () => {
  test("fits the run screen maze inside an 800x450 iframe", () => {
    const bounds = calculateMazeBounds(800, 450, {
      hudHeight: 42,
      dpadHeight: 174,
      quitHeight: 24,
    });

    expect(bounds.maxWidth).toBe(776);
    expect(bounds.maxHeight).toBe(210);
  });

  test("keeps a minimum visible maze area", () => {
    const bounds = calculateMazeBounds(260, 240, {
      hudHeight: 60,
      dpadHeight: 120,
      quitHeight: 30,
    });

    expect(bounds.maxWidth).toBe(236);
    expect(bounds.maxHeight).toBe(160);
  });
});
