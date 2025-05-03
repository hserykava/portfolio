import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

let query = '';
let selectedIndex = -1;
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
  const rolledData = d3.rollups(
    projectsGiven,
    v => v.length,
    d => d.year
  );

  const data = rolledData.map(([year, count]) => ({
    label: year,
    value: count,
  }));

  const colors = d3.scaleOrdinal(d3.schemeTableau10);
  const arcGen = d3.arc().innerRadius(0).outerRadius(50);
  const arcs = d3.pie().value(d => d.value)(data);

  const svg = d3.select('svg');
  svg.selectAll('path').remove();

  svg.selectAll('path')
    .data(arcs)
    .enter()
    .append('path')
    .attr('d', arcGen)
    .attr('fill', (_, i) => colors(i))
    .attr('class', (_, i) => i === selectedIndex ? 'selected' : '')
    .style('cursor', 'pointer')
    .on('click', (_, i) => {
      selectedIndex = (selectedIndex === i) ? -1 : i;

     
      const selectedYear = (selectedIndex === -1) ? null : arcs[selectedIndex].data.label;

     
      let visibleProjects = filterProjects(query);
      if (selectedYear !== null) {
        visibleProjects = visibleProjects.filter(p => p.year === selectedYear);
      }

      
      renderProjects(visibleProjects, projectsContainer, 'h2');
      renderPieChart(visibleProjects); 
    });

  const legend = d3.select('.legend');
  legend.selectAll('li').remove();

  data.forEach((d, i) => {
    legend.append('li')
      .attr('class', i === selectedIndex ? 'legend-item selected' : 'legend-item')
      .attr('style', `--color:${colors(i)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
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


searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  let filtered = filterProjects(query);

  renderProjects(filtered, projectsContainer, 'h2');
  renderPieChart(filtered);
});
