import fs from "node:fs";

import { validateJsonResume } from "../src/lib/resume-server.mjs";

const resume = JSON.parse(
    fs.readFileSync(new URL("../public/resume.json", import.meta.url), "utf8"),
);

await validateJsonResume(resume);
console.log("resume.json is valid");
