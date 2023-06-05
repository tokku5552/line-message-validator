import axios from "axios";
import { validator } from "./validator";

jest.mock("axios");
const axiosMock = axios as jest.Mocked<typeof axios>;
describe("validator", () => {
  test("success", async () => {
    expect.assertions(1);
    axiosMock.post.mockResolvedValue({});
    await validator(
      "token",
      "body",
      () => {
        expect(true).toBe(true);
      },
      () => {
        expect(true).toBe(false);
      },
      () => {
        expect(true).toBe(false);
      }
    );
  });
});
