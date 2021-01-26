import { h, render, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';

function Spinner(props) {
  return (
    <div class="loading"></div>
  );
}
function HistoryItem(item) {
  return (
    <div>
      <h2>{item['name']}</h2>
      <p>{item['title']}</p>
      {item['description'].split("\n").map((paragraph) => {
        return (
          <p>{paragraph}</p>
        );
      })}
    </div>
  );
}

function History(historyData) {
  return (
    <div>
      <h1>Work History</h1>
      {historyData['companies'].map((company) => {
        return <HistoryItem {...company} />;
      })}
    </div>
  );
}

function About(aboutData) {
  return (
    <div class="grid">
      <div class="col">
        <h2>{aboutData['name']}</h2>
        <p>Location: {aboutData['location']['city']}</p>
        <small>{aboutData['description']}</small>
        <div class="skills">
          <h3>Top Skills:</h3>
          {aboutData['skills'].map((skill) => {
            return <span class="skill" key={skill}>{skill}</span>
          })}
        </div>
      </div>
      <div class="col">
        <div>
          <h2>Contact Information</h2>
          <ul>
            {Object.keys(aboutData['contact']).map((key) => {
              if (key === 'email') {
                return <li key={key}>{aboutData['contact'][key]}</li>;
              }

              return (
                  <li key={key}>
                    <a href={aboutData['contact'][key]} target="_blank" rel="noopener">
                      {aboutData['contact'][key]}
                    </a>
                  </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Resume(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [resumeData, setResumeData] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        const response = await fetch('/api/resume');
        const data = await response.json();
        setIsLoading(false);
        setResumeData(data);
      };
      fetchData();
    }, []);

    if (isLoading) {
      return (
        <div class="center">
          <Spinner />
        </div>
      );
    }
    else {
      return (
        <div class="resume">
          <div class="container">
            <About {...resumeData['about']} />
            <History {...resumeData['history']} />
          </div>
        </div>
      );
    }
}

const root = document.getElementById("#resume-root");
render(<Resume />, root);

