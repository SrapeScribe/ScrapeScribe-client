import type {Endpoint, Project} from "../../interfaces"
import {getEndpoints, getProject} from '$lib/fakeDb'

export default class ApiClient {
    static async getProjectWithRelations(name: string): Promise<Project | null> {
        try {
            const [projectData, endpointsData] = await Promise.all([
                getProject(name),
                getEndpoints(name)
            ])

            if (!projectData) {
                return null
            }

            const project = projectData
            project.endpoints = endpointsData
            return project
        } catch (e) {
            console.error('Error loading project data:', e)
            throw new Error('Failed to load project data')
        }
    }

    static async updateProjectName(project_id: string, obj: any): Promise<void> {
        console.log('Updating project: ', project_id)
    }

    static async updateProjectUrl(project_id: string, obj: any): Promise<void> {
        console.log('Updating project: ', project_id)
    }

    static async createEndpoint(endpoint: Endpoint): Promise<void> {
        console.log('Creating endpoint for project: ', endpoint.project_id)
    }


}
