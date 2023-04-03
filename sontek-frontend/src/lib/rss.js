import fs from 'fs';
import RSS from "rss";
import { getRecentPosts } from "./posts";

export async function generateRSSFeed() {
    const site_url = process.env["HOST"];

    const feedOptions = {
        title: "sontek.net Blog posts",
        description:
            "Blog about SRE, Kubernetes, Python, GoLang, and anything development related.",
        site_url: site_url,
        feed_url: `${site_url}/rss.xml`,
        image_url: `${site_url}/logo.png`,
        pubDate: new Date(),
        copyright: `All rights reserved ${new Date().getFullYear()}, @sontek`,
    };
    const feed = new RSS(feedOptions);

    const allPosts = await getRecentPosts();
    allPosts.map((post) => {
        feed.item({
            title: post.title,
            description: post.contentHtml,
            url: `${site_url}/blog/${post.path}`,
            date: post.date,
        });
    });
    fs.writeFileSync('./public/rss.xml', feed.xml({ indent: true }));
}
