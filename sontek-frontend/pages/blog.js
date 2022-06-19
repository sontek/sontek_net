import utilStyles from "../styles/util.module.css";
import { getRecentPosts, getAllTags } from "../src/lib/posts";
import Date from "../src/components/date";
import Link from "next/link";
import Head from "next/head";
import Layout from "../src/components/layout";
import blogStyles from "../styles/blog.module.css";

export async function getStaticProps() {
    const allTagData = await getAllTags();
    const allPostsData = await getRecentPosts();
    return {
        props: {
            allPostsData,
            allTagData,
        },
    };
}

export default function Home({ allPostsData, allTagData }) {
    return (
        <Layout>
            <Head>
                <title>sontek.net - Blog index!</title>
            </Head>
            <section
                className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}
            >
                <h2 className={utilStyles.headingLg}>Tags</h2>
                <div className={blogStyles.tags}>
                    {Object.keys(allTagData).map((tag) => {
                        return (
                            <Link href={`/blog/tags/${tag}`} key={tag}>
                                <a className={blogStyles.tag}>
                                    {tag}
                                </a>
                            </Link>
                        );
                    })}
                </div>
            </section>
            <section
                className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}
            >
                <h2 className={utilStyles.headingLg}>Articles</h2>
                <ul className={utilStyles.list}>
                    {allPostsData.map(({ path, date, title, contentHtml }) => (
                        <li key={path}>
                            <article className={blogStyles.hentry}>
                                <header>
                                    <h3 className="entry-title">
                                        <Link href={`/blog/${path}`}>
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
                                            contentHtml.substring(0, 300) +
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
