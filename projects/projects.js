import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let query = '';
const searchInput = document.querySelector('.searchBar');
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const titleSpan = document.querySelector('.projects-title');

renderProjects(projects, projectsContainer, 'h2');
if (titleSpan) {
  titleSpan.textContent = projects.length;
}

let colors = d3.scaleOrdinal(d3.schemeTableau10);

function updateChart(data) {
  let sliceGenerator = d3.pie().value(d => d.value);
  let arcData = sliceGenerator(data);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

  d3.select('svg').selectAll('path').remove();
  d3.select('.legend').selectAll('li').remove();

  
  d3.select('svg')
    .selectAll('path')
    .data(arcData)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', (_, i) => colors(i));
  
  let legend = d3.select('.legend');
  arcData.forEach((d, i) => {
    legend.append('li')
      .attr('style', `--color:${colors(i)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.data.label} <em>(${d.data.value})</em>`);
  });
}

function getChartData(projectList) {
  let rolledData = d3.rollups(
    projectList,
    v => v.length,
    d => d.year
  );
  return rolledData.map(([year, count]) => ({ label: year, value: count }));
}

updateChart(getChartData(projects));

searchInput.addEventListener('input', (event) => {
  query = event.target.value;

  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  renderProjects(filteredProjects, projectsContainer, 'h2');
  if (titleSpan) {
    titleSpan.textContent = filteredProjects.length;
  }

  updateChart(getChartData(filteredProjects));
});
