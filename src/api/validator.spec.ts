/**
 * @jest-environment node
 */
// Runs the real axios against an intercepted HTTP layer (nock), so an axios
// update that changes the request or the error shape fails here.
import nock from "nock";
import { validator } from "./validator";

const LINE_API = "https://api.line.me";
const VALIDATE_PATH = "/v2/bot/message/validate/reply";
const body = { messages: [{ type: "text", text: "Hello, world" }] };

const lineApi = () =>
  nock(LINE_API)
    .matchHeader("authorization", "Bearer token")
    .matchHeader("content-type", /application\/json/)
    .post(VALIDATE_PATH, body);

describe("validator", () => {
  beforeAll(() => {
    nock.disableNetConnect();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });
  afterAll(() => {
    nock.enableNetConnect();
    jest.restoreAllMocks();
  });

  test("success", async () => {
    const scope = lineApi().reply(200, {});
    const success = jest.fn();
    const invalid = jest.fn();
    const error = jest.fn();

    await validator("token", body, success, invalid, error);

    expect(scope.isDone()).toBe(true);
    expect(success).toHaveBeenCalledTimes(1);
    expect(success.mock.calls[0][0].status).toBe(200);
    expect(invalid).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  test("invalid", async () => {
    const validateError = {
      message: "The request body has 1 error(s)",
      details: [{ message: "Invalid type", property: "messages[0].type" }],
    };
    const scope = lineApi().reply(400, validateError);
    const success = jest.fn();
    const invalid = jest.fn();
    const error = jest.fn();

    await validator("token", body, success, invalid, error);

    expect(scope.isDone()).toBe(true);
    expect(invalid).toHaveBeenCalledWith(validateError);
    expect(success).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  test("timeout", async () => {
    // validator's timeout is 5000ms; nock fires the socket timeout right away
    // when the delay exceeds it, and axios has to turn that into ECONNABORTED.
    lineApi().delay(6000).reply(200, {});
    const success = jest.fn();
    const invalid = jest.fn();
    const error = jest.fn();

    await validator("token", body, success, invalid, error);

    expect(error).toHaveBeenCalledWith(
      "Request timed out. Please try again later."
    );
    expect(success).not.toHaveBeenCalled();
    expect(invalid).not.toHaveBeenCalled();
  });

  test("unknown error", async () => {
    lineApi().replyWithError({ code: "ECONNRESET", message: "socket hang up" });
    const success = jest.fn();
    const invalid = jest.fn();
    const error = jest.fn();

    await validator("token", body, success, invalid, error);

    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0][0].code).toBe("ECONNRESET");
    expect(success).not.toHaveBeenCalled();
    expect(invalid).not.toHaveBeenCalled();
  });
});
