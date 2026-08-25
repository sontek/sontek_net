const VOID_ELEMENTS = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
]);

// Truncates an HTML string to roughly `len` characters without leaving any
// tags open. Naively slicing rendered post HTML (e.g. for a blog index
// excerpt) can cut off in the middle of a <pre><code> block; browsers then
// "reconstruct" that dangling formatting element around whatever comes
// after it in the page, corrupting unrelated markup further down the DOM.
export function htmlSubstring(str, len) {
    var temp = str.substr(0, len);
    if (temp.lastIndexOf('<') > temp.lastIndexOf('>')) {
        temp = str.substr(0, 1 + str.indexOf('>', temp.lastIndexOf('<')));
    }

    if (temp.length < str.length) {
        temp += "...";
    }

    const tagPattern = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)[^>]*?(\/?)>/g;
    const openTags = [];
    let match;
    while ((match = tagPattern.exec(temp)) !== null) {
        const [, closing, tagName, selfClosing] = match;
        const name = tagName.toLowerCase();
        if (VOID_ELEMENTS.has(name) || selfClosing === "/") {
            continue;
        }
        if (closing === "/") {
            const idx = openTags.lastIndexOf(name);
            if (idx !== -1) {
                openTags.splice(idx, 1);
            }
        } else {
            openTags.push(name);
        }
    }

    for (let i = openTags.length - 1; i >= 0; i--) {
        temp += `</${openTags[i]}>`;
    }

    return temp;
}
