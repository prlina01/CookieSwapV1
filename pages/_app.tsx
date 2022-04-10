import '../styles/globals.css'
import type { AppProps } from 'next/app'
import {Container, NextUIProvider} from '@nextui-org/react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <Component {...pageProps} />
  )
}


export default MyApp
