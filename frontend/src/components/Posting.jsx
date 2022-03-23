import React, {useEffect, useRef, useState} from "react";
import {
    AspectRatio,
    Badge,
    Box,
    Button,
    Center,
    Heading,
    HStack,
    IconButton,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Spacer,
    Spinner,
    Stack,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import {SearchIcon} from "@chakra-ui/icons"
import InfiniteScroll from "react-infinite-scroll-component";
import moment from "moment";


const PostingsContext = React.createContext({});
const QueryContext = React.createContext({})


function SearchBar() {
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


const toQueryString = (obj) => {
    const bike = obj.bike ? `bike=${obj.bike}` : "";
    const frame = obj.frame ? `&frame=${obj.frame}` : "";
    const color = obj.color ? `&color=${obj.color}` : "";
    const skip = obj.skip ? `&skip=${obj.skip}` : "";
    const limit = obj.limit ? `&limit=${obj.limit}` : "";
    return bike + frame + color + skip + limit
}


function Prediction({prediction: {bike, frame, color}}) {
    const {query, setQuery} = React.useContext(QueryContext)

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


function FeedbackButtons({posting_id, image_url}) {
    const {isOpen, onOpen, onClose} = useDisclosure()

    const handleMyBikeClick = (event) => {
        console.log("Clicked My Bike")
        event.stopPropagation()
    }
    const openCorrectionModal = (event) => {
        console.log(`Clicked Report Error for posting ${posting_id}`)
        onOpen()
        event.stopPropagation()
    }

    const submitCorrection = async (correction) => {
        if (correction !== undefined) {
            const payload = {posting_id: posting_id, correction: correction}
            console.log(payload)
            await apiPost("correction", payload)
        }
        onClose()
    }

    return (
        <Center>
            <Stack direction={['row', 'column']}>
                <Button colorScheme="teal" variant="outline"
                        onClick={handleMyBikeClick}>That's my Bike</Button>
                <CorrectionModal isOpen={isOpen} onClose={submitCorrection}
                                 image_url={image_url}/>
                <Button colorScheme="red" variant="ghost"
                        onClick={openCorrectionModal}>Report Error</Button>
            </Stack>
        </Center>
    )
}


const CorrectionModal = ({isOpen, onClose, image_url}) => {
    const bike_select = useRef()
    const frame_select = useRef()
    const color_select = useRef()

    const submitOnClose = () => {
        onClose({
            "bike": bike_select.current.value,
            "frame": frame_select.current.value,
            "color": color_select.current.value
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Create a Correction</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Image borderRadius='md' src={image_url} alt="Bike to correct"/>
                    <Stack p="0.5rem">
                        <Select
                            ref={bike_select}
                            variant="flushed"
                            placeholder="Select Bike Type"
                            aria-label="Select Bike Type"
                        >
                            <option value="bike">Bike</option>
                            <option value="children">Children Bike</option>
                            <option value="cargo">Cargo Bike</option>
                        </Select>
                        <Select
                            ref={frame_select}
                            variant="flushed"
                            placeholder="Select Frame"
                            aria-label="Select Frame"
                        >
                            <option value="diamond">Diamond</option>
                            <option value="trapeze">Trapeze</option>
                            <option value="swan_neck">Swan Neck</option>
                            <option value="low_entry">Low Entry</option>
                            <option value="x">X Frame</option>
                            <option value="y">Y Frame</option>
                        </Select>
                        <Select
                            ref={color_select}
                            variant="flushed"
                            placeholder="Select Color"
                            aria-label="Select Color"
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
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme='blue' mr={3} onClick={submitOnClose}>
                        Submit
                    </Button>
                    <Button variant='ghost'>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}


function Posting({posting, prediction}) {
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


const apiGet = async (endpoint, query) => {
    const headers = {access_token: process.env.REACT_APP_API_KEY}
    const queryString = toQueryString(query)
    const backendUrl = `${process.env.REACT_APP_BACKEND_URL}/${endpoint}?${queryString}`
    return await fetch(backendUrl, {headers})
}


const apiPost = async (endpoint, payload) => {
    const headers = {
        access_token: process.env.REACT_APP_API_KEY,
        "Content-Type": "application/json"
    }
    const backendUrl = `${process.env.REACT_APP_BACKEND_URL}/${endpoint}`
    return await fetch(backendUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
    })
}


export default function Postings({marginTop}) {
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
