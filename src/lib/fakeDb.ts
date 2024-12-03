
export interface Project {
	id: string;
	user_id: string;
	name: string;
}

export interface Endpoint {
	id: string;
	project_id: string;
	name: string;
	instructions: string;
	refresh_period: string;
}

const projects: Project[] = [];
const endpoints: Endpoint[] = [];

async function fakeNetwork(): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, 300));
}

export async function getProjects(): Promise<Project[]> {
	await fakeNetwork()
	return projects;
}

function uuidv4(): string {
	return "5";
}

export async function createProject(user_id: string, name: string): Promise<Project> {
	await fakeNetwork()
	if (projects.some(project => project.name === name)) {
		throw new Error('Project name must be unique');
	}
	const project: Project = { id: uuidv4(), user_id, name };
	projects.push(project);
	return project;
}

export async function getProject(id: string): Promise<Project | null> {
	await fakeNetwork()
	console.log('projects', projects)
	console.log('id', id)
	return projects.find(project => project.id === id) || null;
}

export async function deleteProject(id: string): Promise<boolean> {
	await fakeNetwork()
	const index = projects.findIndex(project => project.id === id);
	if (index > -1) {
		projects.splice(index, 1);
		return true;
	}
	return false;
}

export async function getEndpoints(project_id: string): Promise<Endpoint[]> {
	await fakeNetwork()
	return endpoints.filter(endpoint => endpoint.project_id === project_id);
}

export async function createEmptyEndpoint(project_id: string, name: string): Promise<Endpoint> {
	return await createEndpoint(project_id, name, '', '')  // should use nulls instead of empty strings (or defaults? idk)
}

export async function createEndpoint(project_id: string, name: string, instructions: string, refresh_period: string): Promise<Endpoint> {
	await fakeNetwork()
	if (endpoints.some(endpoint => endpoint.project_id === project_id && endpoint.name === name)) {
		throw new Error('Endpoint name must be unique within the project');
	}
	const endpoint: Endpoint = { id: uuidv4(), project_id, name, instructions, refresh_period };
	endpoints.push(endpoint);
	return endpoint;
}

export async function getEndpoint(id: string): Promise<Endpoint | null> {
	await fakeNetwork()
	return endpoints.find(endpoint => endpoint.id === id) || null;
}

export async function deleteEndpoint(id: string): Promise<boolean> {
	await fakeNetwork()
	const index = endpoints.findIndex(endpoint => endpoint.id === id);
	if (index > -1) {
		endpoints.splice(index, 1);
		return true;
	}
	return false;
}

export async function updateEndpoint(id: string, updates: Partial<Endpoint>): Promise<Endpoint | null> {
	await fakeNetwork();
	const endpoint = endpoints.find(endpoint => endpoint.id === id);
	if (!endpoint) {
		throw new Error('Endpoint not found');
	}
	Object.assign(endpoint, updates);
	return endpoint;
}



const skyrimProjectId = 'p1';
projects.push({
	id: skyrimProjectId,
	user_id: 'u1',
	name: 'skyrim'
});

projects.push({
	id: 'p2',
	user_id: 'u1',
	name: 'project2'
});

endpoints.push({
	id: 'e1',
	project_id: skyrimProjectId,
	name: 'banditQuotes',
	instructions: JSON.stringify({ quotes: "quote1" }),
	refresh_period: 'daily'
});

endpoints.push({
	id: 'e2',
	project_id: skyrimProjectId,
	name: 'tavern',
	instructions: JSON.stringify({ name: "The Drunk Skeever", products: ["Mead", "Sweetroll"]}),
	refresh_period: 'weekly'
});
