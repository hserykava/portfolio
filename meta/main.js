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
  d3.select('#stats').selectAll('dl').remove();

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

let xScale, yScale;

function renderScatterPlot(data, commits) {
  const width = 2000;
  const height = 1200;
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom
  };

  const svg = d3.select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  xScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  svg.append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .attr('class', 'x-axis')
    .call(d3.axisBottom(xScale));

  svg.append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale)
      .tickFormat(d => String(d % 24).padStart(2, '0') + ':00'));

  
  svg.append('text')
    .attr('class', 'x-axis-label')
    .attr('x', usableArea.left + usableArea.width / 2)
    .attr('y', height - 5)
    .attr('text-anchor', 'middle')
    .attr('fill', 'black')
    .text('Date');

  svg.append('text')
    .attr('class', 'y-axis-label')
    .attr('transform', `rotate(-90)`)
    .attr('x', - (usableArea.top + usableArea.height / 2))
    .attr('y', 5)
    .attr('text-anchor', 'middle')
    .attr('fill', 'black')
    .text('Hour of Day');

  const [minLines, maxLines] = d3.extent(commits, d => d.totalLines);
  const rScale = d3.scaleSqrt()
    .domain([minLines, maxLines])
    .range([2, 30]);
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  svg.append('g')
    .attr('class', 'dots')
    .selectAll('circle')
    .data(sortedCommits, d => d.id)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', d => rScale(d.totalLines))
    .style('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mousemove', (event) => {
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });

  const gridLines = svg.append('g')
    .attr('class', 'grid-lines')
    .attr('transform', `translate(${usableArea.left}, 0)`);
  gridLines.call(
    d3.axisLeft(yScale)
      .tickSize(-usableArea.width)
      .tickFormat('')
  );
}

function updateScatterPlot(commits) {
  const svg = d3.select('#chart svg');

  const xAxisGroup = svg.select('.x-axis');
  xAxisGroup.selectAll('*').remove();
  xAxisGroup.call(d3.axisBottom(xScale));

  const dots = svg.select('.dots')
    .selectAll('circle')
    .data(commits, d => d.id);

  dots.join(
    enter => enter.append('circle')
      .attr('r', 5)
      .attr('fill', 'steelblue')
      .on('mouseenter', (event, commit) => {
        renderTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      })
      .on('mousemove', (event) => {
        updateTooltipPosition(event);
      })
      .on('mouseleave', () => {
        updateTooltipVisibility(false);
      }),
    update => update,
    exit => exit.remove()
  )
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac));
}

const data = await loadData();
const commits = processCommits(data);
let filteredCommits = commits;

renderCommitInfo(data, commits);
renderScatterPlot(data, commits);

let commitProgress = 100;

let timeScale = d3.scaleTime()
  .domain([
    d3.min(commits, (d) => d.datetime),
    d3.max(commits, (d) => d.datetime),
  ])
  .range([0, 100]);

let commitMaxTime = timeScale.invert(commitProgress);

function onTimeSliderChange() {
  commitProgress = +document.getElementById("commit-progress").value;
  commitMaxTime = timeScale.invert(commitProgress);
  document.getElementById("commit-time").textContent = commitMaxTime.toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  });

  filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
  updateScatterPlot(filteredCommits);
  renderCommitInfo(data, filteredCommits);
}

document.getElementById("commit-progress").addEventListener("input", onTimeSliderChange);
onTimeSliderChange();

function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime.toLocaleString('en', {
    dateStyle: 'full',
  });
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}
