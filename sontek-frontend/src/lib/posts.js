import fs from "fs";
import path from "path";
import matter from "gray-matter";
import remark from "remark";
import html from "remark-html";
import highlight from "remark-highlight.js";

import { formatISO } from "date-fns";

const postsDirectory = path.join(process.cwd(), "posts");

async function getContent(matterResult) {
  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .use(highlight)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();
  return contentHtml;
}

export async function getRecentPosts() {
    // Get file names under /posts
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = await Promise.all(fileNames.map(async (fileName) => {
      const id = fileName.replace(/\.md$/, "");
      const postData = await getPostData(id);
      return postData;
    }));

    // Sort posts by date
    return allPostsData.sort(({ date: a }, { date: b }) => {
        if (a < b) {
            return 1;
        } else if (a > b) {
            return -1;
        } else {
            return 0;
        }
    }).slice(0, 10);
}

export function getAllPostIds() {
    const fileNames = fs.readdirSync(postsDirectory);

    // Returns an array that looks like this:
    // [
    //   {
    //     params: {
    //       id: 'ssg-ssr'
    //     }
    //   },
    //   {
    //     params: {
    //       id: 'pre-rendering'
    //     }
    //   }
    // ]
    return fileNames.map((fileName) => {
        return {
            params: {
                id: fileName.replace(/\.md$/, ""),
            },
        };
    });
}

export async function getPostData(id) {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    const contentHtml = await getContent(matterResult);
    // Combine the data with the id and contentHtml
    const date = formatISO(matterResult.data.date);

    return {
        id,
        contentHtml,
        ...matterResult.data,
        date,
    };
}
