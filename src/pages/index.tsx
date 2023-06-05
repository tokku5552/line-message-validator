import { validator } from "@/api/validator";
import { Form, Header } from "@/components";
import { placeholder } from "@/data/placeholder";
import { FormData } from "@/types";
import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function Home() {
  const [result, setResult] = useState("");
  const { register, setValue, handleSubmit, formState } = useForm<FormData>();

  const onSubmit = handleSubmit(async (data) => {
    await chrome.storage.local.set(data);
    await validator(
      data.token,
      JSON.parse(data.body),
      () => setResult("Success!"),
      (validateError) => setResult(JSON.stringify(validateError, null, 2)),
      (_) => setResult("unknown error")
    );
  });

  useEffect(() => {
    chrome.storage.local.get(["token", "body"], (items) => {
      const data = items as FormData;
      const body = data && data.body ? data.body : placeholder;
      setValue("token", data.token);
      setValue("body", body);
    });
  }, [setValue]);

  return (
    <>
      <Box w="540px">
        <Header />
        <Form
          onSubmit={onSubmit}
          register={register}
          formState={formState}
          placeholder={placeholder}
          result={result}
        />
      </Box>
    </>
  );
}
