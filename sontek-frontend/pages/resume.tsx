import React from "react";
import resumeStyles from "../styles/resume.module.css";
import Layout from "../src/components/layout";
import { formatResumeDateRange } from "../src/lib/resume.mjs";
import { getResumeDetails } from "../src/lib/resume-server.mjs";
import cn from "classnames";
import Head from "next/head";

export async function getStaticProps() {
    const resumeDetails = await getResumeDetails();
    return {
        props: {
            resumeDetails,
        },
    };
}

function HistoryItem(item) {
    return (
        <div className={resumeStyles.historyItem}>
            <h2>{item["name"]}</h2>
            <p>{formatResumeDateRange(item["startDate"], item["endDate"])}</p>
            <p>
                <strong>{item["position"]}</strong>
            </p>
            {item["summary"].split("\n").map((paragraph, index) => {
                return <p key={index}>{paragraph}</p>;
            })}
            <div className={resumeStyles.accomplishments}>
                <h3>Accomplishments</h3>
                <ul>
                    {item["highlights"].map((accomplishment) => {
                        return <li key={accomplishment}>{accomplishment}</li>;
                    })}
                </ul>
            </div>
        </div>
    );
}

function History({ work }) {
    return (
        <div className={resumeStyles.history}>
            <h1>Work History</h1>
            {work.map((company, index) => {
                return <HistoryItem key={index} {...company} />;
            })}
        </div>
    );
}

function About({ basics, skills }) {
    return (
        <div className="grid">
            <div className={cn("col", resumeStyles.col)}>
                <h2>{basics["name"]}</h2>
                <p>
                    Location: {basics["location"]["city"]},{" "}
                    {basics["location"]["region"]}
                </p>
                <p>{basics["summary"]}</p>
            </div>
            <div className={resumeStyles.col}>
                <div>
                    <h2>Contact Information</h2>
                    <ul>
                        <li>{basics["email"]}</li>
                        <li>
                            <a href={basics["url"]}>{basics["url"]}</a>
                        </li>
                        {basics["profiles"].map((profile) => (
                            <li key={profile["network"]}>
                                <a
                                    href={profile["url"]}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {profile["url"]}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className={resumeStyles.skills}>
                <h3>Top Skills:</h3>
                {skills.map((skill) => {
                    return (
                        <span className={resumeStyles.skill} key={skill["name"]}>
                            {skill["name"]}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

export default function Resume(props) {
    const resumeData = props.resumeDetails;
    return (
        <Layout>
            <Head>
                <title>sontek.net - Resume for John Anderson!</title>
            </Head>
            <div className={resumeStyles.resume}>
                <div className={"container"}>
                    <About
                        basics={resumeData["basics"]}
                        skills={resumeData["skills"]}
                    />
                    <History work={resumeData["work"]} />
                </div>
            </div>
        </Layout>
    );
}
