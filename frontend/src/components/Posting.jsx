import React, {useEffect, useState} from "react";
import {
    AspectRatio,
    Box,
    Center,
    Heading,
    Image,
    Spacer,
    Spinner,
    Stack,
    Text,
} from "@chakra-ui/react";
import InfiniteScroll from "react-infinite-scroll-component";
import moment from "moment";
import {PostingsContext, QueryContext} from "./Contexts";
import {apiGet} from "../utils";
import FeedbackButtons from "./FeedbackButtons";
import SearchBar from "./SearchBar";
import Prediction from "./Prediction";


const Posting = ({posting, prediction}) => {
    const handleClick = (event) => {
        window.open(posting.url, '_blank').focus();
    }

    let thumbnail_url
    if (posting.image_url.includes("$_59.JPG")) {
        thumbnail_url = posting.image_url.replace("$_59.JPG", "$_2.JPG")
    } else {
        thumbnail_url = posting.image_url
    }

    return (
        <Box target="_blank"
             borderWidth='1px'
             borderRadius='lg'
             overflow='hidden'
             p="0.5rem"
             _hover={{
                 background: "gray.50",
             }}
             onClick={handleClick}
        >
            <Stack direction={['column', 'row']}>
                <AspectRatio minW={["50px", "200px"]} ratio={4 / 3} mr="0.5rem">
                    <Image borderRadius='md' src={thumbnail_url} alt="Bike Thumbnail"/>
                </AspectRatio>
                <Stack spacing="0.5rem" pt="0.25rem">
                    <Heading size="md" color="gray.800">{posting.title}</Heading>
                    <Prediction prediction={prediction}/>
                    <Heading size="s" color="gray.800">{posting.location}</Heading>
                    <Text fontSize="s" color="gray.800">
                        {moment(posting.date, "YYYY-MM-DD").format("LL")}
                    </Text>
                </Stack>
                <Spacer/>
                <FeedbackButtons posting_id={posting.id} image_url={posting.image_url}/>
            </Stack>
        </Box>
    )
}


const Loading = () => {
    return (
        <Center p="1rem">
            <Spinner/>
        </Center>
    )
}


const Postings = ({marginTop}) => {
    const [postings, setPostings] = useState([])
    const [query, setQuery] = React.useState({bike: "", frame: "", color: ""})
    const fetchPostings = async (query, skip = null, limit = null) => {
        const extendedQuery = {...query, skip: skip, limit: limit}
        const response = await apiGet("posting", extendedQuery)
        const fetched = await response.json()
        setPostings(fetched.data)
    }

    const fetchMorePostings = async () => {
        const extendedQuery = {...query, skip: postings.length, limit: null}
        const response = await apiGet("posting", extendedQuery)
        const fetched = await response.json()
        setPostings(postings.concat(fetched.data))
    }

    useEffect(() => {
        fetchPostings({bike: "", frame: "", color: ""})
    }, [])
    return (
        <QueryContext.Provider value={{query, setQuery}}>
            <PostingsContext.Provider value={{postings, fetchPostings}}>
                <SearchBar/>
                <InfiniteScroll dataLength={postings.length} next={fetchMorePostings}
                                hasMore={true} loader={<Loading/>}>
                    <Stack spacing="0.5rem" pl="0.5rem" pr="0.5rem">
                        {postings.map((posting) => (
                            <Posting key={posting.id} posting={posting}
                                     prediction={posting.prediction}/>
                        ))}
                    </Stack>
                </InfiniteScroll>
            </PostingsContext.Provider>
        </QueryContext.Provider>
    )
}

export default Postings