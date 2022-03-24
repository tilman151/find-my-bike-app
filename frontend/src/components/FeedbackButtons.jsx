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
    Stack,
    useDisclosure
} from "@chakra-ui/react";
import {apiPost} from "../utils";
import {AspectSelects} from "./AspectSelects";

const FeedbackButtons = ({posting_id, image_url}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()

    const handleMyBikeClick = (event) => {
        console.log("Clicked My Bike")
        event.stopPropagation()
    }
    const openCorrectionModal = (event) => {
        onOpen()
        event.stopPropagation()
    }

    const submitCorrection = async (correction) => {
        if (correction !== undefined) {
            const payload = {posting_id: posting_id, correction: correction}
            await apiPost("correction", payload)
        }
        onClose()
    }

    return (
        <Center>
            <Stack direction={['row', 'column']}>
                <Button colorScheme="teal" variant="outline" display="none"
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
    const correction = useRef({bike: "", frame: "", color: ""})
    const submitButton = useRef()

    const selectOnChange = (event) => {
        const targetClass = event.target.className
        if (targetClass.includes("bike-select")) {
            correction.current.bike = event.target.value
        }
        if (targetClass.includes("frame-select")) {
            correction.current.frame = event.target.value
        }
        if (targetClass.includes("color-select")) {
            correction.current.color = event.target.value
        }
        submitButton.current.disabled = !(correction.current.bike &&
            correction.current.frame &&
            correction.current.color);
    }

    const submitOnClose = () => {
        onClose(correction.current)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Create a Correction</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Image borderRadius='md' mb="1rem" src={image_url}
                           alt="Bike to correct"/>
                    <AspectSelects onChange={selectOnChange} direction="column"/>
                </ModalBody>

                <ModalFooter>
                    <Button ref={submitButton} disabled="true" colorScheme='blue' mr={3}
                            onClick={submitOnClose}>
                        Submit
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default FeedbackButtons