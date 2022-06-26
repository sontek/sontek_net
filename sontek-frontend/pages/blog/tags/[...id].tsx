import Layout from "../../../src/components/layout";
import Head from "next/head";
import { getAllTags } from "../../../src/lib/posts";
import utilStyles from "../../../styles/util.module.css";
import blogStyles from "../../../styles/blog.module.css";
import Link from "next/link";
import Date from "../../../src/components/date";

export async function getStaticPaths() {
    const tags = await getAllTags();
    const paths = Object.keys(tags).map((tag) => {
        return {
            params: {
                id: [tag],
            }
        }
    });
    return {
        paths: paths,
        fallback: false,
    }
}

export async function getStaticProps({ params }) {
    const allTagData = await getAllTags();
    return {
        props: {
            id: params.id,
            allTagData,
        },
    };
}


export default function TagList({ id, allTagData }) {
    const allPostsData = allTagData[id]['posts'];
    return (
        <Layout>
            <Head>
                <title>Welcome</title>
            </Head>
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
                                        contentHtml.substring(0, 400) +
                                        "...",
                                }}
                            />
                        </article>
                    </li>
                ))}
            </ul>
        </Layout>
    );
}
