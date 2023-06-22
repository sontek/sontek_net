import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from 'unified'
import markdown from 'remark-parse'
import remarkRehype from 'remark-rehype'
import hrehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'
import remarkMermaid from '@southball/remark-mermaid';
import highlight from 'rehype-highlight'
import langHCL from '../utils/terraform'

import { formatISO } from "date-fns";

const postsDirectory = path.join(process.cwd(), "posts");



async function getContent(matterResult) {
    const languages = {
        hcl: langHCL,
      }

    const content = await unified()
        .use(markdown)
        // .use(remarkGfm)
        .use(remarkMermaid)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(highlight, { languages: languages })
        .use(hrehypeStringify).process(
            matterResult.content
        ).then((file) => {
            return file.value;
        })
    return content;
}

function getAllFilesInDirectory(startingDirectory, prefix=null) {
    const dirents = fs.readdirSync(startingDirectory, { withFileTypes: true });
    let fileNames = [];
    dirents.map((dirent) => {
        if (dirent.isFile()) {
            let fileName = dirent.name;
            if (prefix) {
                fileName = `${prefix}/${fileName}`;
            }
            fileNames.push(fileName); 
        } else if (dirent.isDirectory()) {
            if (
                (dirent.name === 'drafts' && process.env.NODE_ENV === "development") ||
                dirent.name !== 'drafts'
            ) {
                const nextDirectory = path.join(startingDirectory, dirent.name);
                fileNames = fileNames.concat(getAllFilesInDirectory(nextDirectory, dirent.name));
            }
        }
    });
    return fileNames;
}

export async function getAllTags() {
    // Get file names under /posts
    const fileNames = getAllFilesInDirectory(postsDirectory);
    const tags = {};
    await Promise.all(
        fileNames.map(async (fileName) => {
            const id = fileName.replace(/\.md$/, "");
            const postData = await getPostData(id.split("/"));

            const oldTags = postData['tags'] || [];

            oldTags.forEach((tag) => {
                // first time we've see this tag
                if (!tags[tag]) {
                    tags[tag] = {
                        'count': 1,
                        'posts': [postData],
                    }
                } else {
                    tags[tag]['count'] += 1;
                    tags[tag]['posts'].push(postData);
                }
            });
        })
    );
    return tags;
}

export async function getRecentPosts() {
    // Get file names under /posts
    const fileNames = getAllFilesInDirectory(postsDirectory);
    const allPostsData = await Promise.all(
        fileNames.map(async (fileName) => {
            const id = fileName.replace(/\.md$/, "");
            const postData = await getPostData(id.split("/"));
            return postData;
        })
    );

    // Sort posts by date
    return allPostsData
        .sort(({ date: a }, { date: b }) => {
            if (a < b) {
                return 1;
            } else if (a > b) {
                return -1;
            } else {
                return 0;
            }
        })
        .slice(0, 10);
}

export function getAllPostIds() {
    const fileNames = getAllFilesInDirectory(postsDirectory);
    const finalData = fileNames.map((fileName) => {
        const clean = fileName.replace(/\.md$/, "");
        const segments = clean.split("/");

        return {
            params: {
                id: segments,
            },
        };
    });
    return finalData;
}

export async function getPostData(id) {
    const fileName = id.join("/");
    const fullPath = path.join(postsDirectory, `${fileName}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    const contentHtml = await getContent(matterResult);
    // Combine the data with the id and contentHtml
    let date;
    try {
        date = formatISO(matterResult.data.date);
    } catch {
        throw new Error(`Failed to format date for post ${fileName}`)
    }

    return {
        id,
        path: fileName,
        contentHtml,
        ...matterResult.data,
        date,
    };
}
