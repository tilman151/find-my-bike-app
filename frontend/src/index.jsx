import * as React from 'react'
import {render} from 'react-dom';
import {ChakraProvider} from '@chakra-ui/react'

function App() {
    return (
        <ChakraProvider>
            <p>Find-My-Bike is under maintenance.</p>
        </ChakraProvider>
    )
}

const rootElement = document.getElementById("root")
render(<App/>, rootElement)
