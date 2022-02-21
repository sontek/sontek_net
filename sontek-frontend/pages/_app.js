import "../styles/global.css";
import "highlight.js/styles/base16/gruvbox-dark-pale.css";
import { usePanelbear } from '@panelbear/panelbear-nextjs';

export default function App({ Component, pageProps }) {
    usePanelbear('JE5hcutbMFz');
    return <Component {...pageProps} />;
}
