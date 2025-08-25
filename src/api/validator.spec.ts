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
      {},
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
  test("timeout", async () => {
    expect.assertions(1);
    axiosMock.post.mockRejectedValue({ code: "ECONNABORTED" });
    await validator(
      "token",
      "body",
      () => {
        expect(true).toBe(false);
      },
      () => {
        expect(true).toBe(false);
      },
      (reason) => {
        expect(reason).toBe("Request timed out. Please try again later.");
      }
    );
  });
});
