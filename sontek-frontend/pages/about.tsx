import Head from "next/head";
import Layout from "../src/components/layout";
import Image from "../src/components/image";

export default function About() {
    return (
        <Layout>
            <Head>
                <title>sontek.net - About John Anderson!</title>
            </Head>
            <div className="center">
                <div>
                    <Image
                        priority
                        height="467"
                        width="700"
                        src="/images/family_small.jpg"
                        alt={"Picture of John with Family"}
                    />
                </div>
                <small>
                    I&apos;m a father of two who lives in Luquillo, Puerto Rico and
                    loves to hack on opensource
                </small>
            </div>
            <br />
            <div>
                <p>
                    I&apos;m comfortable with everything from writing CSS and
                    React.js to building custom linux distributions and turning
                    them into AMIs or docker images.
                </p>
                <p>
                    I&apos;ve been a professional software developer since 2005 but
                    spent plenty of time hacking on opensource and tinkering
                    with linux as a young whipper-snapper before I ever got paid
                    for it. I spenty many years in datacenters racking and
                    configuring servers. I currently run my own homelab and
                    half-rack out of a datacenter.
                </p>
                <p>
                    My technology stack of choice is Python, Rust, React.js, and
                    Postgres but I&apos;m not very picky. I&apos;ve worked professionally
                    with PHP, C#, and Perl as well.
                </p>
            </div>
            <div>
                <h2>Contact Information</h2>
                <dl>
                    <dt>E-mail</dt>
                    <dd>john@sontek.net</dd>
                    <dt>Twitter</dt>
                    <dd>
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href="https://twitter.com/sontek/"
                        >
                            @sontek
                        </a>
                    </dd>
                    <dt>linkedin</dt>
                    <dd>
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href="https://www.linkedin.com/in/sontek"
                        >
                            @sontek
                        </a>
                    </dd>
                    <dt>github</dt>
                    <dd>
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href="https://www.github.com/sontek"
                        >
                            @sontek
                        </a>
                    </dd>
                    <dt>youtube</dt>
                    <dd>
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href="https://www.youtube.com/sontek"
                        >
                            @sontek
                        </a>
                    </dd>
                </dl>
            </div>
        </Layout>
    );
}
