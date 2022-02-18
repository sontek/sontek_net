import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const resumeDirectory = path.join(process.cwd(), "resume");

export async function getResumeDetails() {
    // Get file names under /resume
    const resumeData = {};
    const fileNames = fs.readdirSync(resumeDirectory);
    await Promise.all(
        fileNames.map(async (fileName) => {
            const id = fileName.replace(/\.yml$/, "");
            const details = await processResumeDetails(fileName);
            resumeData[id] = details;
        })
    );
    return resumeData;
}

export async function processResumeDetails(fileName) {
    const fullPath = path.join(resumeDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    const resumeDetails = yaml.load(fileContents);
    return resumeDetails;
}
