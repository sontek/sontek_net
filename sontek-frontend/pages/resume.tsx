import React from "react";
import resumeStyles from "../styles/resume.module.css";
import Layout from "../src/components/layout";
import { getResumeDetails } from "../src/lib/resume";
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
            <p>{item["dates"]}</p>
            <p>
                <strong>{item["title"]}</strong>
            </p>
            {item["description"].split("\n").map((paragraph, index) => {
                return <p key={index}>{paragraph}</p>;
            })}
            <div className={resumeStyles.accomplishments}>
                <h3>Accomplishments</h3>
                <ul>
                    {item["accomplishments"].map((accomplishment) => {
                        return <li key={accomplishment}>{accomplishment}</li>;
                    })}
                </ul>
            </div>
        </div>
    );
}

function History(historyData) {
    return (
        <div className={resumeStyles.history}>
            <h1>Work History</h1>
            {historyData["companies"].map((company, index) => {
                return <HistoryItem key={index} {...company} />;
            })}
        </div>
    );
}

function About(aboutData) {
    return (
        <div className="grid">
            <div className={cn("col", resumeStyles.col)}>
                <h2>{aboutData["name"]}</h2>
                <p>Location: {aboutData["location"]["city"]}</p>
                <p>{aboutData["description"]}</p>
            </div>
            <div className={resumeStyles.col}>
                <div>
                    <h2>Contact Information</h2>
                    <ul>
                        {Object.keys(aboutData["contact"]).map((key) => {
                            if (key === "email") {
                                return (
                                    <li key={key}>
                                        {aboutData["contact"][key]}
                                    </li>
                                );
                            }

                            return (
                                <li key={key}>
                                    <a
                                        href={aboutData["contact"][key]}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {aboutData["contact"][key]}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
            <div className={resumeStyles.skills}>
                <h3>Top Skills:</h3>
                {aboutData["skills"].map((skill) => {
                    return (
                        <span className={resumeStyles.skill} key={skill}>
                            {skill}
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
                    <About {...resumeData["about"]} />
                    <History {...resumeData["history"]} />
                </div>
            </div>
        </Layout>
    );
}
