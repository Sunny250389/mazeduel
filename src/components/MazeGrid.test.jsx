import { render } from "@testing-library/react";
import MazeGrid from "./MazeGrid";
import { T } from "../utils/mazeGenerator";

function makeGrid(size) {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => T.PATH));
}

test("scales maze tiles to fit an 800x450 iframe-sized area", () => {
  const size = 21;
  const { container } = render(
    <MazeGrid
      grid={makeGrid(size)}
      width={size}
      height={size}
      player={{ x: 0, y: 0 }}
      maxWidth={800}
      maxHeight={450}
    />
  );

  const firstTile = container.querySelector("div div div");
  expect(firstTile.style.width).toBe("21px");
  expect(firstTile.style.height).toBe("21px");
});