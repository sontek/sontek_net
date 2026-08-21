import assert from "node:assert/strict";
import test from "node:test";

import {
    replaceMermaidForStaticConsumers,
    transformMermaidNodes,
} from "../src/lib/remark-mermaid.mjs";

test("converts Mermaid blocks without invoking an external renderer", () => {
    const tree = {
        type: "root",
        children: [
            { type: "code", lang: "mermaid", value: "A --> B & C" },
            { type: "code", lang: "js", value: "const value = 1;" },
        ],
    };

    assert.deepEqual(transformMermaidNodes(tree), {
        type: "root",
        children: [
            {
                type: "html",
                value: '<pre class="mermaid">A --&gt; B &amp; C</pre>',
            },
            { type: "code", lang: "js", value: "const value = 1;" },
        ],
    });
});

test("replaces Mermaid source in consumers that cannot run JavaScript", () => {
    assert.equal(
        replaceMermaidForStaticConsumers(
            '<p>Before</p><pre class="mermaid">graph TD; A--&gt;B</pre><p>After</p>',
        ),
        "<p>Before</p><p><em>Mermaid diagram — view the article to render it.</em></p><p>After</p>",
    );
});
