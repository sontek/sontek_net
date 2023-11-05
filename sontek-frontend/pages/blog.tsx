import utilStyles from "../styles/util.module.css";
import { getRecentPosts, getAllTags } from "../src/lib/posts";
import { generateRSSFeed } from "../src/lib/rss";
import Date from "../src/components/date";
import TagList from "../src/components/taglist";
import Link from "next/link";
import Head from "next/head";
import Layout from "../src/components/layout";
import blogStyles from "../styles/blog.module.css";
import {htmlSubstring} from "../src/lib/html";

export async function getStaticProps() {
    const allTagData = await getAllTags();
    const allPostsData = await getRecentPosts();
    await generateRSSFeed()

    return {
        props: {
            allPostsData,
            allTagData,
        },
    };
}

export default function Home({ allPostsData, allTagData }) {
    const tags = Object.keys(allTagData);

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
                    <TagList tags={tags} />
                </div>
            </section>
            <section
                className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}
            >
                <h2 className={utilStyles.headingLg}>Articles</h2>
                <ul className={utilStyles.list}>
                    {allPostsData.map(({ path, date, title, contentHtml }) => {
                        return (
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
                                        Published on <Date dateString={date} />
                                    </small>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                htmlSubstring(contentHtml, 300) +
                                                "...",
                                        }}
                                    />
                                </article>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </Layout>
    );
}
