import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const titleSpan = document.querySelector('.projects-title');
if (titleSpan) {
  titleSpan.textContent = projects.length;
}

let rolledData = d3.rollups(
  projects,
  v => v.length,
  d => d.year
);

let data = rolledData.map(([year, count]) => {
  return { label: year, value: count };
});

let sliceGenerator = d3.pie().value(d => d.value);
let arcData = sliceGenerator(data);
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let arcs = arcData.map(d => arcGenerator(d));

let colors = d3.scaleOrdinal(d3.schemeTableau10);

d3.select('svg')
  .selectAll('path')
  .data(arcs)
  .enter()
  .append('path')
  .attr('d', d => d)
  .attr('fill', (_, i) => colors(i));

let legend = d3.select('.legend');
arcData.forEach((d, i) => {
  legend.append('li')
    .attr('style', `--color:${colors(i)}`)
    .attr('class', 'legend-item')
    .html(`<span class="swatch"></span> ${d.data.label} <em>(${d.data.value})</em>`);
});
