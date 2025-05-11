import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    date: new Date(row.date + 'T00:00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  return data;
}

function processCommits(data) {
  return d3.groups(data, d => d.commit)
    .map(([commit, lines]) => {
      const first = lines[0];
      const { author, date, time, timezone, datetime } = first;
      const ret = {
        id: commit,
        url: 'https://github.com/YOUR_USERNAME/YOUR_REPO/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };
      Object.defineProperty(ret, 'lines', { value: lines, enumerable: false });
      return ret;
    });
}

function renderCommitInfo(data, commits) {
  const dl = d3.select('#stats')
    .append('dl')
    .attr('class', 'stats');

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);
  const fileCount = d3.group(data, d => d.file).size;
  dl.append('dt').text('Files');
  dl.append('dd').text(fileCount);
  const maxDepth = d3.max(data, d => d.depth);
  dl.append('dt').text('Max Depth');
  dl.append('dd').text(maxDepth);
  const maxLineLength = d3.max(data, d => d.length);
  dl.append('dt').text('Longest Line');
  dl.append('dd').text(maxLineLength);
  const fileLineCounts = d3.rollups(
    data,
    v => v.length,
    d => d.file
  );
  const maxLines = d3.max(fileLineCounts, d => d[1]);
  dl.append('dt').text('Max Lines');
  dl.append('dd').text(maxLines);
}

const data = await loadData();
const commits = processCommits(data);
renderCommitInfo(data, commits);
