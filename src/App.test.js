import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the home screen title", () => {
  render(<App />);
  expect(screen.getByText(/MazeDuel/i)).toBeInTheDocument();
});
