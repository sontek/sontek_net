function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

export function transformMermaidNodes(node) {
    if (node.type === "code" && node.lang === "mermaid") {
        return {
            type: "html",
            value: `<pre class="mermaid">${escapeHtml(node.value)}</pre>`,
        };
    }

    if (node.children) {
        node.children = node.children.map(transformMermaidNodes);
    }

    return node;
}

export default function remarkMermaid() {
    return transformMermaidNodes;
}

export function replaceMermaidForStaticConsumers(html) {
    return html.replace(
        /<pre class="mermaid">[\s\S]*?<\/pre>/g,
        "<p><em>Mermaid diagram — view the article to render it.</em></p>",
    );
}
