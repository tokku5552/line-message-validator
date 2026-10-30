// Popup page: chrome.storage, react-hook-form, Chakra UI and the validator
// wired together. Kept outside src/pages so Next does not treat it as a route.
import { validator } from "@/api/validator";
import Home from "@/pages/index";
import { placeholder } from "@/data/placeholder";
import { ChakraProvider } from "@chakra-ui/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/api/validator");
const validatorMock = validator as jest.MockedFunction<typeof validator>;

const storage = {
  get: jest.fn(),
  set: jest.fn(),
};

const renderHome = (stored: Record<string, string>) => {
  storage.get.mockImplementation((_keys, callback) => callback(stored));
  return render(
    <ChakraProvider>
      <Home />
    </ChakraProvider>
  );
};

const tokenInput = () =>
  screen.getByPlaceholderText("CHANNEL ACCESS TOKEN") as HTMLInputElement;
// Both labels sit in one FormControl, so query the textarea by the name that
// react-hook-form's register() sets.
const bodyInput = () =>
  document.querySelector('textarea[name="body"]') as HTMLTextAreaElement;
const submit = () =>
  fireEvent.click(screen.getByRole("button", { name: "validate" }));

describe("Home", () => {
  beforeEach(() => {
    (global as any).chrome = { storage: { local: storage } };
    storage.get.mockReset();
    storage.set.mockReset().mockResolvedValue(undefined);
    validatorMock.mockReset();
  });

  test("restores the token and body from chrome.storage", async () => {
    renderHome({ token: "saved-token", body: '{"messages":[]}' });

    await waitFor(() => expect(tokenInput().value).toBe("saved-token"));
    expect(bodyInput().value).toBe('{"messages":[]}');
  });

  test("falls back to the placeholder when nothing is stored", async () => {
    renderHome({});

    await waitFor(() => expect(bodyInput().value).toBe(placeholder));
    expect(tokenInput().value).toBe("");
  });

  test("shows a required error and does not validate without a token", async () => {
    renderHome({});
    await waitFor(() => expect(bodyInput().value).toBe(placeholder));

    // A button click is stopped by the native `required` check, so submit the
    // form directly to exercise react-hook-form's own required rule.
    fireEvent.submit(tokenInput().form!);

    expect(
      await screen.findByText("channel access token is required")
    ).toBeTruthy();
    expect(storage.set).not.toHaveBeenCalled();
    expect(validatorMock).not.toHaveBeenCalled();
  });

  test("saves the input, validates the parsed body and shows success", async () => {
    validatorMock.mockImplementation(async (_token, _body, success) => {
      success({} as any);
    });
    renderHome({});
    await waitFor(() => expect(bodyInput().value).toBe(placeholder));

    fireEvent.change(tokenInput(), { target: { value: "token" } });
    submit();

    await waitFor(() =>
      expect(screen.getByDisplayValue("Success!")).toBeTruthy()
    );
    expect(storage.set).toHaveBeenCalledWith({
      token: "token",
      body: placeholder,
    });
    expect(validatorMock).toHaveBeenCalledWith(
      "token",
      JSON.parse(placeholder),
      expect.any(Function),
      expect.any(Function),
      expect.any(Function)
    );
  });

  test("shows the validation error returned by the LINE API", async () => {
    const validateError = {
      message: "The request body has 1 error(s)",
      details: [{ message: "Invalid type", property: "messages[0].type" }],
    };
    validatorMock.mockImplementation(
      async (_token, _body, _success, invalid) => {
        invalid(validateError);
      }
    );
    renderHome({ token: "token" });
    await waitFor(() => expect(tokenInput().value).toBe("token"));

    submit();

    await waitFor(() =>
      expect(
        screen.getByDisplayValue(/The request body has 1 error\(s\)/)
      ).toBeTruthy()
    );
    expect(
      (screen.getByDisplayValue(/messages\[0\]\.type/) as HTMLTextAreaElement)
        .value
    ).toBe(JSON.stringify(validateError, null, 2));
  });
});
