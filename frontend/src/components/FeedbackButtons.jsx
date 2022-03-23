import React, {useRef} from "react";
import {
    Button,
    Center,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Stack,
    useDisclosure
} from "@chakra-ui/react";
import {apiPost} from "../utils";

const FeedbackButtons = ({posting_id, image_url}) => {
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

export default FeedbackButtons