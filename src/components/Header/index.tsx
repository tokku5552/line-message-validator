import { Box, Heading } from "@chakra-ui/react";

export default function Header() {
  return (
    <Box bg="#4299E1" w="100%" p={4} color="white">
      <Heading as="h3" size="xl" isTruncated>
        LINE Message Validator
      </Heading>
    </Box>
  );
}
