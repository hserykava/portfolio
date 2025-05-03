import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const titleSpan = document.querySelector('.projects-title');
if (titleSpan) {
  titleSpan.textContent = projects.length;
}

const data = projects.map(() => 1);
const svg = d3.select('svg');
const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
const pieGenerator = d3.pie();
const arcData = pieGenerator(data);

const colors = d3.scaleOrdinal(d3.schemeTableau10);

svg.selectAll('path')
  .data(arcData)
  .enter()
  .append('path')
  .attr('d', arcGenerator)
  .attr('fill', (d, i) => colors(i));
