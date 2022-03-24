import * as React from 'react'
import {render} from 'react-dom';
import {ChakraProvider} from '@chakra-ui/react'

import Header from "./components/Header";
import Postings from "./components/Posting";
import BackToTopButton from "./components/BackToTopButton";

function App() {
    return (
        <ChakraProvider>
            <Header/>
            <BackToTopButton/>
            <Postings/>
        </ChakraProvider>
    )
}

const rootElement = document.getElementById("root")
render(<App/>, rootElement)