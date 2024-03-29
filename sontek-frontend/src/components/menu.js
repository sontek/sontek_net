import Link from "next/link";

export default function Menu() {
    return (
        <>
            <div className="grid">
                <div className="col">
                    <header id="banner" className="body">
                        <h1>
                            <Link href="/">
                                <a>sontek.net</a>
                            </Link>
                        </h1>
                    </header>
                </div>
                <div className="col menu">
                    <nav>
                        <ul>
                            <li>
                                <Link href="/">
                                    <a>Home</a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog">
                                    <a>Blog</a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/resume">
                                    <a>Resume</a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/about">
                                    <a>About</a>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
}
