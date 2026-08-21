import { useEffect, useRef } from "react";

export default function MermaidContent({ html, className = undefined }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const nodes = containerRef.current?.querySelectorAll(
            ".mermaid:not([data-processed])",
        );
        if (!nodes?.length) {
            return;
        }

        async function renderMermaid() {
            const mermaid = (await import("mermaid")).default;
            mermaid.initialize({ startOnLoad: false });
            await mermaid.run({ nodes });
        }

        renderMermaid().catch((error) => {
            console.error("Failed to render Mermaid diagram", error);
        });
    }, [html]);

    return (
        <div
            ref={containerRef}
            className={className}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
