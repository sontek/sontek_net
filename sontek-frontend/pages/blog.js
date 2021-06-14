import utilStyles from "../styles/util.module.css";
import { getRecentPosts } from "../src/lib/posts";
import Date from "../src/components/date";
import Link from "next/link";
import Head from "next/head";
import Layout from "../src/components/layout";
import blogStyles from "../styles/blog.module.css";
import cn from "classnames";

export async function getStaticProps() {
    const allPostsData = await getRecentPosts();
    return {
        props: {
            allPostsData,
        },
    };
}

export default function Home({ allPostsData }) {
    return (
        <Layout>
            <Head>
                <title>sontek.net - Blog index!</title>
            </Head>
            <section
                className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}
            >
                <h2 className={utilStyles.headingLg}>All Articles</h2>
                <ul className={utilStyles.list}>
                    {allPostsData.map(({ id, date, title, contentHtml }) => (
                        <li key={id}>
                            <article className={blogStyles.hentry}>
                                <header>
                                    <h3 className="entry-title">
                                        <Link href={`/posts/${id}`}>
                                            <a>{title}</a>
                                        </Link>
                                    </h3>
                                </header>
                                <br />
                                <small className={utilStyles.lightText}>
                                    <Date dateString={date} />
                                </small>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            contentHtml.substring(0, 200) +
                                            "...",
                                    }}
                                />
                            </article>
                        </li>
                    ))}
                </ul>
            </section>
        </Layout>
    );
}
