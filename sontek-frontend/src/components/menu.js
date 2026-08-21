import Link from "next/link";

export default function Menu() {
    return (
        <>
            <div className="grid">
                <div className="col">
                    <header id="banner" className="body">
                        <h1>
                            <Link href="/">sontek.net</Link>
                        </h1>
                    </header>
                </div>
                <div className="col menu">
                    <nav>
                        <ul>
                            <li>
                                <Link href="/">Home</Link>
                            </li>
                            <li>
                                <Link href="/blog">Blog</Link>
                            </li>
                            <li>
                                <Link href="/resume">Resume</Link>
                            </li>
                            <li>
                                <Link href="/about">About</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
}
