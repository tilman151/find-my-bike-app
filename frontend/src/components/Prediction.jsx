import React from "react";
import {QueryContext} from "./Contexts";
import {Badge, HStack} from "@chakra-ui/react";

const Prediction = ({prediction: {bike, frame, color}}) => {
    const [query,] = React.useContext(QueryContext)

    return (
        <HStack>
            <Badge colorScheme={(query.bike === bike) ? "green" : "gray"}>
                {bike}
            </Badge>
            <Badge colorScheme={(query.frame === frame) ? "green" : "gray"}>
                {frame}
            </Badge>
            <Badge colorScheme={(query.color === color) ? "green" : "gray"}>
                {color}
            </Badge>
        </HStack>
    )
}

export default Prediction