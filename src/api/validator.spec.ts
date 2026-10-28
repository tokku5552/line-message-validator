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
  test("invalid", async () => {
    expect.assertions(1);
    const validateError = {
      message: "The request body has 1 error(s)",
      details: [{ message: "must be specified", property: "messages[0].text" }],
    };
    axiosMock.post.mockRejectedValue({ response: { data: validateError } });
    await validator(
      "token",
      {},
      () => {
        expect(true).toBe(false);
      },
      (error) => {
        expect(error).toEqual(validateError);
      },
      () => {
        expect(true).toBe(false);
      }
    );
  });
  test("unknown error", async () => {
    expect.assertions(1);
    const reason = new Error("Network Error");
    axiosMock.post.mockRejectedValue(reason);
    await validator(
      "token",
      {},
      () => {
        expect(true).toBe(false);
      },
      () => {
        expect(true).toBe(false);
      },
      (error) => {
        expect(error).toBe(reason);
      }
    );
  });
});
