import {authApiClient as apiClient} from "$lib/api/client"
import {authStore} from "$lib/states/auth.svelte"
import type {Project, ProjectWithEndpointCount} from "$lib/interfaces"
import {generateSlug} from "$lib/utils"

class ProjectStore {
    projects: ProjectWithEndpointCount[] = $state([]);
    currentProject: Project | null = $state(null);
    isLoading: boolean = $state(false);
    error: string | null = $state(null);

    operationInProgress: string | null = $state(null);

    constructor() {
        console.log("🏢 ProjectStore: Initialized")
    }

    /**
     * Check if user is authenticated before executing an operation
     * @returns true if authenticated, false otherwise (and sets error)
     */
    private checkAuthentication(): boolean {
        if (!authStore.authState.isAuthenticated) {
            console.error("🏢 ProjectStore: User not authenticated")
            this.error = "You must be signed in to perform this action"
            return false
        }
        return true
    }

    /**
     * Load all projects for the current user
     */
    async loadProjects() {
        console.log("🏢 ProjectStore: Loading all projects")

        if (!this.checkAuthentication()) return []

        if (this.isLoading) {
            console.log("🏢 ProjectStore: Loading already in progress, skipping duplicate request")
            return this.projects
        }

        this.isLoading = true
        this.operationInProgress = 'loading-projects'
        this.error = null

        try {
            console.log("🏢 ProjectStore: Fetching projects from API")
            const projects = await apiClient.projectApi.getWithEndpointCounts()
            console.log(`🏢 ProjectStore: Loaded ${projects.length} projects successfully`)

            this.projects = projects
            return projects
        } catch (error: any) {
            const errorMessage = error.message || "Failed to load projects"
            console.error("🏢 ProjectStore: Error loading projects", error)
            this.error = errorMessage
            throw error
        } finally {
            this.isLoading = false
            this.operationInProgress = null
            console.log("🏢 ProjectStore: Finished loading projects operation")
        }
    }

    /**
     * Load a specific project by slug
     */
    async loadProject(projectSlug: string) {
        if (!projectSlug) {
            console.error("🏢 ProjectStore: Cannot load project - missing slug")
            throw new Error("Project slug is required")
        }

        if (!this.checkAuthentication()) return null

        console.log(`🏢 ProjectStore: Loading project details for slug: ${projectSlug}`)

        if (this.isLoading) {
            console.log("🏢 ProjectStore: Loading already in progress, skipping duplicate request")
            return this.currentProject
        }

        this.isLoading = true
        this.operationInProgress = `loading-project-${projectSlug}`
        this.error = null

        try {
            console.log(`🏢 ProjectStore: Fetching project from API: ${projectSlug}`)
            const project = await apiClient.projectApi.getBySlug(projectSlug)
            console.log(`🏢 ProjectStore: Project loaded successfully:`, project)

            this.currentProject = project
            return project
        } catch (error: any) {
            const errorMessage = error.message || `Failed to load project "${projectSlug}"`
            console.error(`🏢 ProjectStore: Error loading project "${projectSlug}"`, error)
            this.error = errorMessage
            throw error
        } finally {
            this.isLoading = false
            this.operationInProgress = null
            console.log(`🏢 ProjectStore: Finished loading project operation for "${projectSlug}"`)
        }
    }

    /**
     * Create a new project
     */
    async addProject(projectName: string, projectSlug?: string) {
        if (!projectName) {
            console.error("🏢 ProjectStore: Cannot create project - missing name")
            throw new Error("Project name is required")
        }

        if (!this.checkAuthentication()) return null

        // Get current user information from auth store
        const currentUser = authStore.authState.user
        if (!currentUser) {
            console.error("🏢 ProjectStore: Cannot create project - user information not available")
            throw new Error("User information not available")
        }

        // Generate slug from name if not provided
        if (!projectSlug) {
            projectSlug = generateSlug(projectName);
        }

        console.log(`🏢 ProjectStore: Creating new project "${projectName}" with slug "${projectSlug}"`)

        this.isLoading = true
        this.operationInProgress = 'creating-project'
        this.error = null

        try {
            console.log(`🏢 ProjectStore: Sending create project request to API`)
            console.log(`🏢 ProjectStore: Parameters - name: "${projectName}", slug: "${projectSlug}"`)

            const project = await apiClient.projectApi.create(projectName, projectSlug)
            console.log("🏢 ProjectStore: Project created successfully:", project)

            // Convert to ProjectWithEndpointCount for state consistency
            const projectWithEndpointCount: ProjectWithEndpointCount = {
                ...project,
                endpoint_count: 0
            }

            // Update local state
            this.projects = [...this.projects, projectWithEndpointCount]
            return project
        } catch (error: any) {
            // Enhance error message with more details
            let errorMessage = "Failed to create project"

            // Handle common error scenarios
            if (error.status === 409 || (error.message && error.message.includes("already exists"))) {
                errorMessage = `A project with the slug "${projectSlug}" already exists`
            } else if (error.status === 422 || (error.message && error.message.includes("invalid"))) {
                errorMessage = `Invalid project information: ${error.message}`
            } else if (error.status === 401 || error.status === 403) {
                errorMessage = "You don't have permission to create this project"
            } else if (error.status === 500) {
                errorMessage = "Server error while creating project. Please try again later."
            }

            console.error(`🏢 ProjectStore: Error creating project:`, error)
            this.error = errorMessage
            throw new Error(errorMessage)
        } finally {
            this.isLoading = false
            this.operationInProgress = null
            console.log("🏢 ProjectStore: Finished project creation operation")
        }
    }

    /**
     * Delete a project by ID
     */
    async removeProject(id: string) {
        if (!id) {
            console.error("🏢 ProjectStore: Cannot delete project - missing ID")
            throw new Error("Project ID is required")
        }

        if (!this.checkAuthentication()) return null

        console.log(`🏢 ProjectStore: Deleting project with ID ${id}`)

        this.isLoading = true
        this.operationInProgress = `deleting-project-${id}`
        this.error = null

        try {
            console.log(`🏢 ProjectStore: Sending delete request to API for project ${id}`)
            const project = await apiClient.projectApi.delete(id)
            console.log(`🏢 ProjectStore: Project deleted successfully:`, project)

            // Update local state by removing the deleted project
            this.projects = this.projects.filter(p => p.id !== id)

            // If the deleted project was the current project, clear it
            if (this.currentProject && this.currentProject.id === id) {
                this.currentProject = null
            }

            return project
        } catch (error: any) {
            const errorMessage = error.message || `Failed to delete project`
            console.error(`🏢 ProjectStore: Error deleting project ${id}:`, error)
            this.error = errorMessage
            throw error
        } finally {
            this.isLoading = false
            this.operationInProgress = null
            console.log(`🏢 ProjectStore: Finished project deletion operation for ${id}`)
        }
    }

    /**
     * Update an existing project
     */
    async updateProject({project}: {project: Partial<Project>}) {
        const { id: projectId, name, slug, status } = project;

        if (!projectId) {
            console.error("🏢 ProjectStore: Cannot update project - missing ID")
            throw new Error("Project ID is required")
        }

        if (!this.checkAuthentication()) return null

        console.log(`🏢 ProjectStore: Updating project ${projectId}`)
        console.log(`🏢 ProjectStore: Update fields - name: ${name || '(unchanged)'}, slug: ${slug || '(unchanged)'}, status: ${status || '(unchanged)'}`)

        this.isLoading = true
        this.operationInProgress = `updating-project-${projectId}`
        this.error = null

        try {
            console.log(`🏢 ProjectStore: Sending update request to API for project ${projectId}`)
            const updatedProject = await apiClient.projectApi.update(projectId, name, slug, status);
            console.log(`🏢 ProjectStore: Project updated successfully:`, updatedProject);

            // Update projects array
            this.projects = this.projects.map(p =>
                p.id === projectId ? {...p, ...updatedProject} : p
            );

            // Update current project if it's the one being edited
            if (this.currentProject && this.currentProject.id === projectId) {
                this.currentProject = updatedProject;
            }

            return updatedProject;
        } catch (error: any) {
            const errorMessage = error.message || `Failed to update project`
            console.error(`🏢 ProjectStore: Error updating project ${projectId}:`, error)
            this.error = errorMessage
            throw error
        } finally {
            this.isLoading = false
            this.operationInProgress = null
            console.log(`🏢 ProjectStore: Finished project update operation for ${projectId}`)
        }
    }

    /**
     * Reset store state
     */
    reset() {
        console.log("🏢 ProjectStore: Resetting state")
        this.currentProject = null
        this.error = null
        this.isLoading = false
        this.operationInProgress = null
    }
}

export const projectStore = new ProjectStore()
