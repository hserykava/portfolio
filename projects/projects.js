import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let query = '';
const searchInput = document.querySelector('.searchBar');
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
render(projects);

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  const filtered = projects.filter(project =>
    project.title.toLowerCase().includes(query.toLowerCase())
  );
  render(filtered);
});

function render(filteredProjects) {
  renderProjects(filteredProjects, projectsContainer, 'h2');

  const titleSpan = document.querySelector('.projects-title');
  if (titleSpan) {
    titleSpan.textContent = filteredProjects.length;
  }

  let rolledData = d3.rollups(
    filteredProjects,
    v => v.length,
    d => d.year
  );

  let data = rolledData.map(([year, count]) => ({
    label: year,
    value: count
  }));


  let sliceGenerator = d3.pie().value(d => d.value);
  let arcData = sliceGenerator(data);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let arcs = arcData.map(d => arcGenerator(d));
  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  
  d3.select('svg').selectAll('path').remove();
  d3.select('svg')
    .selectAll('path')
    .data(arcs)
    .enter()
    .append('path')
    .attr('d', d => d)
    .attr('fill', (_, i) => colors(i));

  d3.select('.legend').selectAll('li').remove();
  arcData.forEach((d, i) => {
    d3.select('.legend')
      .append('li')
      .attr('style', `--color:${colors(i)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.data.label} <em>(${d.data.value})</em>`);
  });
}
