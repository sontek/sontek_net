export function validateRequiredResumeFields(resume) {
    for (const field of ["name", "summary", "email", "url"]) {
        if (!resume.basics?.[field]) {
            throw new Error(`resume.basics.${field} is required`);
        }
    }
    for (const field of ["city", "region"]) {
        if (!resume.basics.location?.[field]) {
            throw new Error(`resume.basics.location.${field} is required`);
        }
    }
    if (!Array.isArray(resume.basics.profiles)) {
        throw new Error("resume.basics.profiles must be an array");
    }
    if (!Array.isArray(resume.skills)) {
        throw new Error("resume.skills must be an array");
    }
    if (!Array.isArray(resume.work) || resume.work.length === 0) {
        throw new Error("resume.work must contain at least one role");
    }

    resume.work.forEach((role, index) => {
        for (const field of [
            "name",
            "position",
            "startDate",
            "summary",
            "highlights",
        ]) {
            if (!role[field] || role[field].length === 0) {
                throw new Error(`resume.work[${index}].${field} is required`);
            }
        }
    });
}

const monthFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
});

export function formatResumeDate(value) {
    if (!value) {
        return "Present";
    }

    const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(value);
    if (!match) {
        throw new Error(`Unsupported resume date: ${value}`);
    }

    if (!match[2]) {
        return match[1];
    }

    return monthFormatter.format(
        new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)),
    );
}

export function formatResumeDateRange(startDate, endDate) {
    return `${formatResumeDate(startDate)} - ${formatResumeDate(endDate)}`;
}
