import React from "react";
import { Heading, Flex } from "@chakra-ui/react";

const Header = () => {
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1rem"
      border-bottom="1px"
    >
      <Flex align="center" mr={5}>
        <Heading as="h1" size="sm" color="#222222">Find My Bike</Heading>
      </Flex>
    </Flex>
  );
};

export default Header;
