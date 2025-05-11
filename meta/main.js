import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('loc.csv');
  console.log(data);
  return data;
}


function processCommits(data) {
  return d3.groups(data, d => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0]; 
      
      let { author, date, time, timezone, datetime } = first;
      
      let ret = {
        id: commit,
        url: 'https://github.com/hserykava/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };
      
  
      Object.defineProperty(ret, 'lines', {
        value: lines,
        configurable: true,
        writable: true,
        enumerable: false
      });

      return ret;
    });
}
let data = await loadData();
let commits = processCommits(data);
console.log(commits);
