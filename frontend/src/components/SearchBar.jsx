import React from "react";
import {PostingsContext, QueryContext} from "./Contexts";
import {Flex, IconButton} from "@chakra-ui/react";
import {SearchIcon} from "@chakra-ui/icons";
import {AspectSelects} from "./AspectSelects";

const SearchBar = () => {
    const {query, setQuery} = React.useContext(QueryContext)
    const {postings, fetchPostings} = React.useContext(PostingsContext)

    const updateQuery = (event) => {
        const targetClass = event.target.className
        if (targetClass.includes("bike-select")) {
            setQuery({...query, bike: event.target.value})
        }
        if (targetClass.includes("frame-select")) {
            setQuery({...query, frame: event.target.value})
        }
        if (targetClass.includes("color-select")) {
            setQuery({...query, color: event.target.value})
        }
    }

    const handleSubmit = (event) => {
        fetchPostings(query)
        event.preventDefault();
    }

    return (
        <Flex>
            <AspectSelects onChange={updateQuery} direction="row"/>
            <IconButton m="0.5rem" aria-label='Search Postings' icon={<SearchIcon/>}
                        onClick={handleSubmit}/>
        </Flex>
    )
}

export default SearchBar