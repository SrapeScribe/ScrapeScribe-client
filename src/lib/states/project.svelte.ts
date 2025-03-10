import {authApiClient as apiClient} from "$lib/api/client"
import type { Project } from "$lib/interfaces"

class ProjectStore {
    projects: Project[] = $state([]);
    currentProject: Project | null = $state(null);
    isLoading: boolean = $state(true);
    error: string | null = $state(null);

    constructor() {

    }

    async loadProjects() {
        console.log("Loading projects")
        this.isLoading = true

        try {
            let projects = await apiClient.projectApi.getMyProjects()
            console.log(projects)
            this.projects = projects

        } catch (error: any) {
            this.error = error.message
            console.error(error)
        } finally {
            this.isLoading = false
        }

    }

    async loadProject(projectSlug: string) {
        console.log("Loading project: ", projectSlug)
        this.isLoading = true

        try {
            let project = await apiClient.projectApi.getBySlug(projectSlug)
            console.log(project)
            this.currentProject = project
        } catch (error: any) {
            this.error = error.message
            console.error(error)
        } finally {
            this.isLoading = false
        }

    }

    async addProject(projectName: string, projectSlug?: string) {
        if (!projectSlug) {
            projectSlug = projectName.toLowerCase().replace(/\s/g, "-")
        }
        let project: Project = await apiClient.projectApi.create(projectName, projectSlug)
        console.log("AddProject response: ", project)
        this.projects = [...this.projects, project]
    }

    async removeProject(id: string) {
        let project: Project = await apiClient.projectApi.delete(id)
        console.log("Project deleted: ", project)
        this.projects = this.projects.filter(p => p.id !== id)
    }
    async updateProject({project}: {project: Partial<Project>}) {
        const { id: projectId, name, slug, status } = project;
        if (!projectId) {
            throw new Error("Project ID is required")
        }
        let updatedProject: Project = await apiClient.projectApi.update(projectId, name, slug, status);
        console.log("Project updated: ", updatedProject);

        this.projects = this.projects.map(p =>
            p.id === projectId ? {...p, ...updatedProject} : p
        );
        this.currentProject = updatedProject;
    }
}

export const projectStore = new ProjectStore()
