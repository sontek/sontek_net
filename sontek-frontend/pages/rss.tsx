import { getRSSFeed } from "../src/lib/rss";

function RSSFeed({ rssFeed }) {
    return rssFeed;
}

export async function getStaticProps() {
    const rssFeed = await getRSSFeed();
    return {
        props: {
            rssFeed: rssFeed,
        },
    };
}

export default RSSFeed;
