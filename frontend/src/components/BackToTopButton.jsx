import React from 'react'
import {IconButton, Portal} from "@chakra-ui/react"
import {ArrowUpIcon} from "@chakra-ui/icons"

const ScrollButton = () => {

    const [visible, setVisible] = React.useState(false)

    const toggleVisible = () => {
        const scrolled = document.documentElement.scrollTop
        if (scrolled > 300) {
            setVisible(true)
        } else if (scrolled <= 300) {
            setVisible(false)
        }
    }

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    window.addEventListener('scroll', toggleVisible)

    return (
        <Portal>
            <IconButton icon={<ArrowUpIcon/>} aria-label="Back to top"
                        display={visible ? "inline" : "none"} position="fixed"
                        bottom="1rem" right="1rem" size="lg" boxShadow="lg"
                        colorScheme="blue"
                        onClick={scrollToTop}/>
        </Portal>
    )
}

export default ScrollButton
