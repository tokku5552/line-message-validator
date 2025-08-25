import axios, { AxiosResponse } from "axios";
import { ValidateError } from "../types";
import { logger } from "@/logger";

export const validator = async (
  token: string,
  body: string,
  success: (response: AxiosResponse) => void,
  invalid: (validateError: ValidateError) => void,
  error: (reason: any) => void
) => {
  const maskToken = (t: string) =>
    t ? `${t.slice(0, 4)}****${t.slice(-4)}` : "";
  logger.debug(
    `validator token=${maskToken(token)},body=${JSON.stringify(body)}`
  );
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  await axios
    .post("https://api.line.me/v2/bot/message/validate/reply", body, {
      headers: headers,
    })
    .then((response) => {
      success(response);
    })
    .catch((reason) => {
      logger.error(reason);
      if (!!reason && !!reason.response && !!reason.response.data) {
        const validateError: ValidateError = reason.response.data;
        invalid(validateError);
      } else {
        error(reason);
      }
    });
};
