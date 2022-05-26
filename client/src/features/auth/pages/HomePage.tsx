import { Button, Flex, SimpleGrid } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <Flex alignItems="center" justifyContent="center" height="100vh">
      <SimpleGrid columns={2} spacing={6}>
        <Button as={Link} to="/quiz">
          Quiz
        </Button>
        <Button as={Link} to="/quiz/admin">
          Quiz Admin
        </Button>
      </SimpleGrid>
    </Flex>
  );
}
