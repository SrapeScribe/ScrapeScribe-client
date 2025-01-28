import { type Endpoint, type Instructions, type Project, SchemeType, type User } from '../interfaces'
import { HTTPMethod } from "../constants"

const projects: Project[] = []
const users: User[] = []
const endpoints: Endpoint[] = []

async function fakeNetwork(delay: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay))
}

const DEFAULT_EMPTY_ENDPOINT: Partial<Endpoint> = {
    url: '',
    method: HTTPMethod.GET,
    instructions: {
        url: '',
        scheme: {
            type: SchemeType.String,
            path: '',
            mode: 'INNER_HTML'
        }
    },
    refresh_period: '0'
}

function uuidv4(): string {
    return crypto?.randomUUID() || Math.random().toString(36).substring(2)
}

export async function getProjects(): Promise<Project[]> {
    await fakeNetwork()
    return [...projects]
}

export async function createProject(user_id: string, name: string): Promise<Project> {
    if (!user_id || !name) {
        throw new Error('User ID and project name are required')
    }

    await fakeNetwork()

    if (projects.some(project => project.name === name)) {
        throw new Error('Project name must be unique')
    }

    const user = users.find(u => u.id === user_id)
    if (!user) {
        throw new Error('User not found')
    }

    const project: Project = { id: uuidv4(), user, name }
    projects.push(project)
    return { ...project }
}

export async function getProject(id: string): Promise<Project | null> {
    if (!id) return null

    await fakeNetwork()
    const project = projects.find(project => project.id === id)
    return project ? { ...project } : null
}

export async function deleteProject(id: string): Promise<boolean> {
    if (!id) return false

    await fakeNetwork()
    const index = projects.findIndex(project => project.id === id)

    if (index > -1) {
        // Delete associated endpoints first
        endpoints.filter(endpoint => endpoint.project.id === id)
            .forEach(endpoint => deleteEndpoint(endpoint.id))

        projects.splice(index, 1)
        return true
    }
    return false
}

export async function getEndpoints(project_id: string): Promise<Endpoint[]> {
    if (!project_id) return []

    await fakeNetwork()
    return endpoints
        .filter(endpoint => endpoint.project.id === project_id)
        .map(endpoint => ({ ...endpoint }))
}

export async function createEmptyEndpoint(project_id: string, name: string): Promise<Endpoint> {
    if (!project_id || !name) {
        throw new Error('Project ID and endpoint name are required')
    }

    const project = await getProject(project_id)
    if (!project) {
        throw new Error('Project not found')
    }

    return await createEndpoint(
        project_id,
        name,
        DEFAULT_EMPTY_ENDPOINT.instructions as Instructions,
        DEFAULT_EMPTY_ENDPOINT.refresh_period as string
    )
}

export async function createEndpoint(
    project_id: string,
    name: string,
    instructions: Instructions,
    refresh_period: string
): Promise<Endpoint> {
    if (!project_id || !name) {
        throw new Error('Project ID and endpoint name are required')
    }

    await fakeNetwork()

    if (endpoints.some(endpoint => endpoint.project.id === project_id && endpoint.name === name)) {
        throw new Error('Endpoint name must be unique within the project')
    }

    const project = await getProject(project_id)
    if (!project) {
        throw new Error('Project not found')
    }

    const endpoint: Endpoint = {
        id: uuidv4(),
        project,
        name,
        url: instructions.url,
        method: HTTPMethod.GET,
        instructions,
        refresh_period
    }

    endpoints.push(endpoint)
    return { ...endpoint }
}

export async function getEndpoint(id: string): Promise<Endpoint | null> {
    if (!id) return null

    await fakeNetwork()
    const endpoint = endpoints.find(endpoint => endpoint.id === id)
    return endpoint ? { ...endpoint } : null
}

export async function deleteEndpoint(id: string): Promise<boolean> {
    if (!id) return false

    await fakeNetwork()
    const index = endpoints.findIndex(endpoint => endpoint.id === id)

    if (index > -1) {
        endpoints.splice(index, 1)
        return true
    }
    return false
}

export async function updateEndpoint(
    id: string,
    updates: Partial<Endpoint>
): Promise<Endpoint | null> {
    if (!id) return null

    await fakeNetwork()
    const endpoint = endpoints.find(endpoint => endpoint.id === id)

    if (!endpoint) {
        return null
    }

    // Prevent updating critical fields
    const safeUpdates = { ...updates }
    delete safeUpdates.id
    delete safeUpdates.project

    Object.assign(endpoint, safeUpdates)
    return { ...endpoint }
}


// ==================  MOCK DATA  ==================

const user1Id = 'u1'
users.push({
    id: user1Id,
    name: 'user1',
    email: 'john.doe@email.com'
})

const usPresidentsProjectId = 'p5'
projects.push({
    id: usPresidentsProjectId,
    user: users.find(user => user.id === user1Id)!,
    name: 'usPresidents'
})

const usPresidentsInstructions: Instructions = {
    url: 'http://whitehouse.gov/presidents',
    scheme: {
        type: SchemeType.Object,
        fields: [
            {
                key: 'Current President',
                value: {
                    type: SchemeType.String,
                    path: 'div>:nth-child(2)',
                    mode: 'INNER_HTML'
                }
            },
            {
                key: 'Best Liberal Presidents',
                value: {
                    type: SchemeType.List,
                    path: 'div > ul',
                    element_scheme: {
                        type: SchemeType.String,
                        path: 'li > div:nth-of-type(1) > p',
                        mode: 'INNER_HTML',
                    },
                }
            },
            {
                key: 'Presidents Favorite Activities',
                value: {
                    type: SchemeType.List,
                    path: "div > ul",


                    element_scheme: {
                        type: SchemeType.Object,
                        fields: [
                            {
                                key: "id",
                                value: {
                                    type: SchemeType.String,
                                    path: "li > p:nth-of-type(1)",
                                    mode: 'INNER_HTML',
                                }
                            },
                            {
                                key: "name",
                                value: {
                                    type: SchemeType.String,
                                    path: "li > div:nth-of-type(1) > p:nth-of-type(1)",
                                    mode: 'INNER_HTML',
                                }
                            },
                            {
                                key: "activity",
                                value: {
                                    type: SchemeType.String,
                                    path: "li > div:nth-of-type(2) > p > span",
                                    mode: 'INNER_HTML',
                                }
                            }
                        ]
                    },
                }
            }
        ]
    }
}

endpoints.push({
    id: 'e5',
    project: projects.find(projects => projects.id === usPresidentsProjectId)!,
    name: 'All Presidents',
    method: HTTPMethod.GET,
    url: '/presidents',
    instructions: usPresidentsInstructions,
    refresh_period: 'daily'
})
