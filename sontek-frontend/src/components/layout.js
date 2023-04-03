import Menu from "../components/menu";
import Head from "next/head";

export default function Layout({ children }) {
    return (
        <div>
            <Head>
                <link rel="alternate" type="application/rss+xml" title="Blog Feed" href="/rss/" />
            </Head>
            <Menu />
            <div className="container">{children}</div>
        </div>
    );
}
