import blogStyles from "../../styles/blog.module.css";
import Link from "next/link";

export default function TagList({ tags }) {
    return tags.map((tag) => {
        return (
            <Link href={`/blog/tags/${tag}`} key={tag}>
                <a className={blogStyles.tag}>
                    {tag}
                </a>
            </Link>
        );
    })
}
