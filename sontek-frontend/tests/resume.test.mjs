import assert from "node:assert/strict";
import test from "node:test";

import {
    formatResumeDate,
    formatResumeDateRange,
    validateRequiredResumeFields,
} from "../src/lib/resume.mjs";

test("formats JSON Resume month ranges for display", () => {
    assert.equal(formatResumeDate("2024"), "2024");
    assert.equal(formatResumeDate("2024-07"), "July 2024");
    assert.equal(formatResumeDate("2024-07-15"), "July 2024");
    assert.equal(formatResumeDateRange("2024-07", ""), "July 2024 - Present");
    assert.equal(
        formatResumeDateRange("2023-07", "2024-07"),
        "July 2023 - July 2024",
    );
});

test("rejects data that omits fields required by the site", () => {
    assert.throws(
        () => validateRequiredResumeFields({ basics: {}, work: [] }),
        /resume\.basics\.name is required/,
    );
});

test("accepts the minimum data required by the site", () => {
    assert.doesNotThrow(() =>
        validateRequiredResumeFields({
            basics: {
                name: "John",
                summary: "Engineer",
                email: "john@example.com",
                url: "https://example.com",
                location: { city: "San Juan", region: "Puerto Rico" },
                profiles: [],
            },
            skills: [],
            work: [
                {
                    name: "Example",
                    position: "Engineer",
                    startDate: "2024-01",
                    summary: "Worked on things",
                    highlights: ["Built a thing"],
                },
            ],
        }),
    );
});
