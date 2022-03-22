import React, {useEffect, useState} from "react";
import {
    Badge,
    Box,
    Button,
    Center,
    Divider,
    Flex,
    Heading,
    HStack,
    IconButton,
    Image,
    Select,
    Spacer,
    Stack,
} from "@chakra-ui/react";
import {SearchIcon} from "@chakra-ui/icons"


const PostingsContext = React.createContext({});


function SearchBar() {
    const [query, setQuery] = React.useState({bike: "", frame: "", color: ""})
    const context = React.useContext(PostingsContext)

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
        context.fetchPostings(query)
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


const toQueryString = (obj) => {
    const bike = obj.bike ? `bike=${obj.bike}` : "";
    const frame = obj.frame ? `&frame=${obj.frame}` : "";
    const color = obj.color ? `&color=${obj.color}` : "";
    return bike + frame + color
}


function Prediction({prediction: {bike, frame, color}}) {
    return (
        <HStack>
            <Badge>{bike}</Badge>
            <Badge>{frame}</Badge>
            <Badge>{color}</Badge>
        </HStack>
    )
}


function FeedbackButtons() {
    const handleMyBikeClick = (event) => {
        console.log("Clicked My Bike")
        event.stopPropagation()
    }
    const handleThisIsWrongClick = (event) => {
        console.log("Clicked This is Wrong")
        event.stopPropagation()
    }

    return (
        <Center>
            <Stack>
                <Button colorScheme="teal" variant="outline"
                        onClick={handleMyBikeClick}>My Bike</Button>
                <Button colorScheme="red" variant="ghost"
                        onClick={handleThisIsWrongClick}>This is Wrong</Button>
            </Stack>
        </Center>
    )
}


function Posting({posting, prediction}) {
    const handleClick = (event) => {
        window.open(posting.url, '_blank').focus();
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
            <Flex>
                <Image h="100%" minH="100px" borderRadius='md' src={posting.image_url}
                       alt="Bike"/>
                <Divider orientation="vertical" m="0.5rem"/>
                <Stack spacing="0.5rem">
                    <Heading size="lg">{posting.title}</Heading>
                    <Prediction prediction={prediction}/>
                    <Heading size="s">{posting.location}</Heading>
                </Stack>
                <Spacer/>
                <FeedbackButtons/>
            </Flex>
        </Box>
    )
}


const apiCall = async (endpoint, query) => {
    const headers = {access_token: process.env.REACT_APP_API_KEY}
    const queryString = toQueryString(query)
    const backendUrl = `${process.env.REACT_APP_BACKEND_URL}/${endpoint}?${queryString}`
    return await fetch(backendUrl, {headers})
}


export default function Postings({marginTop}) {
    const [postings, setPostings] = useState([])
    const fetchPostings = async (query) => {
        const response = await apiCall("posting", query)
        const postings = await response.json()
        setPostings(postings.data)
    }
    useEffect(() => {
        fetchPostings({bike: "", frame: "", color: ""})
    }, [])
    return (
        <PostingsContext.Provider value={{postings, fetchPostings}}>
            <SearchBar/>
            <Stack spacing="0.5rem" pl="0.5rem" pr="0.5rem">
                {postings.map((posting) => (
                    <Posting key={posting.title} posting={posting}
                             prediction={posting.prediction}/>
                ))}
            </Stack>
        </PostingsContext.Provider>
    )
}
