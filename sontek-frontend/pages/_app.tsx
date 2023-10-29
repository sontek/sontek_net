import "../styles/global.css";
// import "highlight.js/styles/base16/gruvbox-dark-pale.css";
// import "highlight.js/styles/base16/hardcore.css";
// import "highlight.js/styles/base16/circus.css";
import "highlight.js/styles/atom-one-dark.css";
import { usePanelbear } from '@panelbear/panelbear-nextjs';
import { AppProps } from 'next/app';


export default function App({ Component, pageProps }: AppProps) {
    usePanelbear('JE5hcutbMFz');
    return <Component {...pageProps} />;
}
