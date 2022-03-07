import React, { useEffect, useState } from "react";
import {
  Select,
  Stack,
  HStack,
  IconButton,
  Box,
  Heading,
  Center, Badge,
} from "@chakra-ui/react";
import {SearchIcon} from "@chakra-ui/icons"

import {
  PostingsContextType,
  IPosting,
  PostingQueryType,
  IPredictions
} from '../@types/posting';

const PostingsContext = React.createContext<PostingsContextType | undefined>(undefined);


function usePostingsContext() {
  const context = React.useContext(PostingsContext)
  if (context === undefined) {
    throw new Error("usePostingsContext must be within PostingsProvider")
  }

  return context
}


function SearchBar() {
  const [query, setQuery] = React.useState<PostingQueryType>({bike: "", frame: "", color: ""})
  const {postings, fetchPostings} = usePostingsContext()

  const handleBikeInput = (event: React.ChangeEvent<HTMLSelectElement>)  => {
    setQuery({...query, bike: event.target.value})
  }

  const handleFrameInput = (event: React.ChangeEvent<HTMLSelectElement>)  => {
    setQuery({...query, frame: event.target.value})
  }

  const handleColorInput = (event: React.ChangeEvent<HTMLSelectElement>)  => {
    setQuery({...query, color: event.target.value})
  }

  const handleSubmit = (event: React.FormEvent) => {
    fetchPostings(query)
    event.preventDefault();
  }

  return (
    <form>
      <HStack pl="0.5rem" pr="0.5rem" pb="0.5rem">
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
        <IconButton aria-label='Search Postings' icon={<SearchIcon />} onClick={handleSubmit}/>
      </HStack>
    </form>
  )
}


const toQueryString = (obj: PostingQueryType): string => {
  const bike = obj.bike ? `bike=${obj.bike}` : "";
  const frame = obj.frame ? `&frame=${obj.frame}` : "";
  const color = obj.color ? `&color=${obj.color}` : "";
  return bike + frame + color
}


interface IPostingProps {
  title: string;
  prediction: IPredictions;
}


function Posting(props: IPostingProps) {
  return (
    <Box borderWidth='1px' borderRadius='lg' overflow='hidden' p="0.5rem">
      <HStack>
        <Center h="100%" minH="100px" w="100px" bg="tomato">Dummy</Center>
        <Stack spacing="0.5rem">
          <Heading size="lg">{props.title}</Heading>
          <HStack>
            <Badge>{props.prediction.bike}</Badge>
            <Badge>{props.prediction.frame}</Badge>
            <Badge>{props.prediction.color}</Badge>
          </HStack>
          <Heading size="s">Berlin</Heading>
        </Stack>
      </HStack>
    </Box>
  )
}


export default function Postings() {
  const [postings, setPostings] = useState<IPosting[]>([])
  const fetchPostings = async (query: PostingQueryType) => {
    const response = await fetch(`https://serene-citadel-42839.herokuapp.com/posting?${toQueryString(query)}`)
    const postings = await response.json()
    setPostings(postings.data)
  }
  useEffect(() => {
    fetchPostings({bike: "", frame: "", color: ""})
  }, [])
  return (
    <PostingsContext.Provider value={{postings, fetchPostings}}>
      <SearchBar/>
      <Stack spacing={5} pl="0.5rem" pr="0.5rem">
        {postings.map((posting) => (
          <Posting title={posting.title} prediction={posting.prediction}/>
        ))}
      </Stack>
    </PostingsContext.Provider>
  )
}
