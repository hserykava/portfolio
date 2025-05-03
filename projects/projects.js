import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');
const titleSpan = document.querySelector('.projects-title');
if (titleSpan) {
  titleSpan.textContent = projects.length;
}

const data = [1, 2];
const arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(50);

let total = data.reduce((sum, d) => sum + d, 0);
let angle = 0;
let arcData = [];

for (let d of data) {
  let endAngle = angle + (d / total) * 2 * Math.PI;
  arcData.push({ startAngle: angle, endAngle: endAngle });
  angle = endAngle;
}

const arcs = arcData.map(d => arcGenerator(d));
const colors = ['gold', 'purple'];
arcs.forEach((arc, idx) => {
  d3.select('svg')
    .append('path')
    .attr('d', arc)
    .attr('fill', colors[idx]);
});
