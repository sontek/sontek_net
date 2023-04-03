import { getRSSFeed } from "../src/lib/feed";

function RSSFeed() {
    // getServerSideProps will do the heavy lifting
  }
  
  export async function getServerSideProps({ res }) {
    const rssFeed = await getRSSFeed()
    res.setHeader('Content-Type', 'text/xml');
    // we send the XML to the browser
    res.write(rssFeed);
    res.end();
  
    return {
      props: {},
    };
  }

  export default RSSFeed;
