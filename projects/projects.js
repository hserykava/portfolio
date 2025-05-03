import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let query = '';
const searchInput = document.querySelector('.searchBar');
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const titleSpan = document.querySelector('.projects-title');
const svg = d3.select('svg');
const legendContainer = d3.select('.legend');

if (titleSpan) {
  titleSpan.textContent = projects.length;
}

function renderPieChart(projectsGiven) {
  
  svg.selectAll('path').remove();
  legendContainer.selectAll('li').remove();


  let rolledData = d3.rollups(
    projectsGiven,
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
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  
  svg.selectAll('path')
    .data(arcData)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', (_, i) => colors(i));

 
  arcData.forEach((d, i) => {
    legendContainer.append('li')
      .attr('style', `--color:${colors(i)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.data.label} <em>(${d.data.value})</em>`);
  });
}


function filterProjects(query) {
  return projects.filter(project => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}


renderProjects(projects, projectsContainer, 'h2');
renderPieChart(projects);


searchInput.addEventListener('change', (event) => {
  query = event.target.value;
  let filtered = filterProjects(query);

  renderProjects(filtered, projectsContainer, 'h2');
  renderPieChart(filtered);
});
