import Layout from "../../src/components/layout";
import Date from "../../src/components/date";
import TagList from "../../src/components/taglist";
import { getAllPostIds, getPostData } from "../../src/lib/posts";
import utilStyles from "../../styles/util.module.css";
import blogStyles from "../../styles/blog.module.css";

import Head from "next/head";

export async function getStaticPaths() {
    const paths = getAllPostIds();
    return {
        paths,
        fallback: false,
    };
}

export async function getStaticProps({ params }) {
    const postData = await getPostData(params.id);
    return {
        props: {
            postData,
        },
    };
}

export default function Post({ postData }) {
    return (
        <Layout>
            <Head>
                <title>{postData.title}</title>
            </Head>
            <article className={blogStyles.article}>
                <div className={utilStyles.lightText}>
                    Published on <Date dateString={postData.date} />
                </div>
                <h1 className={utilStyles.headingXl}>{postData.title}</h1>
                <div className={utilStyles.lightText}>
                    Tagged with: <TagList tags={postData.tags} />
                </div>
                <div
                    dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
                />
            </article>
        </Layout>
    );
}
