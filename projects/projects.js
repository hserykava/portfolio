import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');
const titleSpan = document.querySelector('.projects-title');
if (titleSpan) {
  titleSpan.textContent = projects.length;
}
