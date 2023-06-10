import { FormData } from "@/types";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { FormState, UseFormRegister } from "react-hook-form";

export interface FormProps {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  register: UseFormRegister<FormData>;
  formState: FormState<FormData>;
  placeholder: string;
  result: string;
}

export default function Form({
  onSubmit,
  register,
  formState,
  placeholder,
  result,
}: FormProps) {
  const { errors } = formState;
  return (
    <form onSubmit={onSubmit}>
      <FormControl isInvalid={!!errors.body || !!errors.token} isRequired>
        <FormLabel>channel access token</FormLabel>
        <Input
          placeholder="CHANNEL ACCESS TOKEN"
          {...register("token", { required: true })}
        />
        <FormErrorMessage>
          {!!errors.token && "channel access token is required"}
        </FormErrorMessage>
        <FormLabel>messages(JSON)</FormLabel>
        <Textarea
          placeholder={placeholder}
          h="200"
          {...register("body", { required: true })}
        />
        <FormErrorMessage>
          {!!errors.body && "messages(JSON) is required"}
        </FormErrorMessage>
      </FormControl>
      <FormLabel>result</FormLabel>
      <Textarea value={result} h="100" />
      <Button
        mt={2}
        bg="#4299E1"
        color="white"
        isLoading={formState.isSubmitting}
        type="submit"
      >
        validate
      </Button>
    </form>
  );
}
