import React from "react";
import {Flex, Heading} from "@chakra-ui/react";

const Header = () => {
    return (
        <Flex
            as="nav"
            w="100%"
            padding="1rem"
            border-bottom="1px"
        >
            <Heading as="h1" size="sm" color="gray.900">Find My Bike</Heading>
        </Flex>
    );
};

export default Header;
