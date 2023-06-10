import { render } from "@testing-library/react";
import Header from ".";

describe("Header", () => {
  test("rendering", () => {
    const { container } = render(<Header />);

    expect(container.innerHTML).toMatch("LINE Message Validator");
  });
});
