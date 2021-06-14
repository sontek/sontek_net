import Link from "next/link";

export default function Menu() {
    return (
        <>
            <div class="grid">
                <div class="col">
                    <header id="banner" class="body">
                        <h1>
                            <a href="/">sontek.net</a>
                        </h1>
                    </header>
                </div>
                <div class="col menu">
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
