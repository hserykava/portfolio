import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const titleSpan = document.querySelector('.projects-title');
if (titleSpan) {
  titleSpan.textContent = projects.length;
}
let data = [1, 2, 3, 4, 5, 5];

let colors = d3.scaleOrdinal(d3.schemeTableau10);

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let pie = d3.pie();
let arcData = pie(data);

let arcs = arcData.map(d => arcGenerator(d));

arcs.forEach((arc, idx) => {
  d3.select('svg')
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(idx));
});
