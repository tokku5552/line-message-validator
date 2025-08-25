import axios from "axios";
import { ValidateError } from "../types";
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

  test("validation error", async () => {
    expect.assertions(1);
    const validateError: ValidateError = {
      message: "invalid",
      details: [{ message: "detail", property: "prop" }],
    };
    axiosMock.post.mockRejectedValue({ response: { data: validateError } });
    await validator(
      "token",
      "body",
      () => {
        expect(true).toBe(false);
      },
      (error) => {
        expect(error).toBe(validateError);
      },
      () => {
        expect(true).toBe(false);
      }
    );
  });

  test("network error", async () => {
    expect.assertions(1);
    const networkError = new Error("network error");
    axiosMock.post.mockRejectedValue(networkError);
    await validator(
      "token",
      "body",
      () => {
        expect(true).toBe(false);
      },
      () => {
        expect(true).toBe(false);
      },
      (error) => {
        expect(error).toBe(networkError);
      }
    );
  });
});
