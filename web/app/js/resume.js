import { h, render } from 'preact';
import { useState, useEffect } from 'preact/hooks';

function HelloWorld(props) {
    const [message, setMessage] = useState("Hello Moon");
    useEffect(() => {
      const fetchData = async () => {
        const response = await fetch('/api/resume');
        const data = await response.json();
        setMessage(data['message']);
      };
      fetchData();
    }, []);

    return (
      <div>
        <h1>{message}</h1>
      </div>
    );
}

const root = document.getElementById("#resume-root");
render(<HelloWorld />, root);

