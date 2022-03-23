import React from "react";
import {PostingsContext, QueryContext} from "./Contexts";
import {HStack, IconButton, Select} from "@chakra-ui/react";
import {SearchIcon} from "@chakra-ui/icons";

export function SearchBar() {
    const {query, setQuery} = React.useContext(QueryContext)
    const {postings, fetchPostings} = React.useContext(PostingsContext)

    const handleBikeInput = (event) => {
        setQuery({...query, bike: event.target.value})
    }

    const handleFrameInput = (event) => {
        setQuery({...query, frame: event.target.value})
    }

    const handleColorInput = (event) => {
        setQuery({...query, color: event.target.value})
    }

    const handleSubmit = (event) => {
        fetchPostings(query)
        event.preventDefault();
    }

    return (
        <form>
            <HStack pl="0.5rem" pr="0.5rem" pb="0.5rem" h={14}>
                <Select
                    variant="flushed"
                    placeholder="Select Bike Type"
                    aria-label="Select Bike Type"
                    onChange={handleBikeInput}
                >
                    <option value="bike">Bike</option>
                    <option value="children">Children Bike</option>
                    <option value="cargo">Cargo Bike</option>
                </Select>
                <Select
                    variant="flushed"
                    placeholder="Select Frame"
                    aria-label="Select Frame"
                    onChange={handleFrameInput}
                >
                    <option value="diamond">Diamond</option>
                    <option value="trapeze">Trapeze</option>
                    <option value="swan_neck">Swan Neck</option>
                    <option value="low_entry">Low Entry</option>
                    <option value="x">X Frame</option>
                    <option value="y">Y Frame</option>
                </Select>
                <Select
                    variant="flushed"
                    placeholder="Select Color"
                    aria-label="Select Color"
                    onChange={handleColorInput}
                >
                    <option value="black">Black</option>
                    <option value="white">White</option>
                    <option value="gray">Gray</option>
                    <option value="blue">Blue</option>
                    <option value="red">Red</option>
                    <option value="yellow">Yellow</option>
                    <option value="green">Green</option>
                </Select>
                <IconButton aria-label='Search Postings' icon={<SearchIcon/>}
                            onClick={handleSubmit}/>
            </HStack>
        </form>
    )
}