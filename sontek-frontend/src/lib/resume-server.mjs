import fs from "node:fs";
import path from "node:path";

import jsonResumeSchema from "@jsonresume/schema";

import { validateRequiredResumeFields } from "./resume.mjs";

const resumePath = path.join(process.cwd(), "public", "resume.json");

export function validateJsonResume(resume) {
    validateRequiredResumeFields(resume);

    return new Promise((resolve, reject) => {
        jsonResumeSchema.validate(
            resume,
            (error, report) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(report);
                }
            },
            reject,
        );
    });
}

export async function getResumeDetails() {
    const resume = JSON.parse(fs.readFileSync(resumePath, "utf8"));
    await validateJsonResume(resume);
    return resume;
}
