import {Select, Stack} from "@chakra-ui/react";
import React from "react";

export const AspectSelects = ({onChange, direction}) => {
    return (
        <Stack p="0.5rem" direction={direction} w="100%">
            <Select
                className="bike-select"
                variant="flushed"
                placeholder="Select Bike Type"
                aria-label="Select Bike Type"
                onChange={onChange}
            >
                <option value="bike">Bike</option>
                <option value="children">Children Bike</option>
                <option value="cargo">Cargo Bike</option>
            </Select>
            <Select
                className="frame-select"
                variant="flushed"
                placeholder="Select Frame"
                aria-label="Select Frame"
                onChange={onChange}
            >
                <option value="diamond">Diamond</option>
                <option value="trapeze">Trapeze</option>
                <option value="swan_neck">Swan Neck</option>
                <option value="low_entry">Low Entry</option>
                <option value="x">X Frame</option>
                <option value="y">Y Frame</option>
            </Select>
            <Select
                className="color-select"
                variant="flushed"
                placeholder="Select Color"
                aria-label="Select Color"
                onChange={onChange}
            >
                <option value="black">Black</option>
                <option value="white">White</option>
                <option value="gray">Gray</option>
                <option value="blue">Blue</option>
                <option value="red">Red</option>
                <option value="yellow">Yellow</option>
                <option value="green">Green</option>
            </Select>/>
        </Stack>
    )
}