import * as React from 'react'
import {render} from 'react-dom';
import {ChakraProvider} from '@chakra-ui/react'

import Header from "./components/Header";
import Postings from "./components/Posting";

function App() {
    return (
        <ChakraProvider>
            <Header/>
            <Postings/>
        </ChakraProvider>
    )
}

const rootElement = document.getElementById("root")
render(<App/>, rootElement)