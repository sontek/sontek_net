import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("passes the gh-pages dotfiles option as a boolean flag", async () => {
    const packageJson = JSON.parse(
        await readFile(new URL("../package.json", import.meta.url), "utf8"),
    );

    assert.equal(packageJson.scripts.deploy, "gh-pages -d out -t");
});
