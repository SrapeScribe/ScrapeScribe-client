import {projectApi} from '$lib/api/client'
import type {Project, ProjectWithEndpointCount} from "../interfaces"


type ProjectUpdate = {
    userId?: string | null
    contextPath?: string | null
    status?: string | null
}

type ProjectState = {
    projects: ProjectRecord[]
    currentProject: ProjectRecord | null
    isLoading: boolean
    error: string | null
}

export type ProjectRecord = Project & {
    endpoint_count?: number;
};


export function createProjectsStore() {
    let $state: ProjectState = {
        projects: [],
        currentProject: null,
        isLoading: false,
        error: null
    }

    let $derived = {
        get activeProjects() {
            return ($state.projects || []).filter(p => p.status === 'ACTIVE')
        }
    }

    async function loadProjects(userId: string): Promise<ProjectRecord[]> {
        $state.isLoading = true
        $state.error = null

        try {
            const projects = await projectApi.getWithEndpointCounts(userId)
            $state.projects = projects || []
            return projects
        } catch (error: any) {
            $state.error = error.message || 'Failed to load projects'
            return []
        } finally {
            $state.isLoading = false
        }
    }

    async function getProjectById(projectId: string): Promise<ProjectRecord | null> {
        if (!$state.projects) {
            $state.projects = []
        }
        const cached = $state.projects.find(p => p.id === projectId)
        if (cached) {
            $state.currentProject = cached
            return cached
        }

        $state.isLoading = true
        $state.error = null

        try {
            const project = await projectApi.getById(projectId)
            $state.currentProject = project
            return project
        } catch (error: any) {
            $state.error = error.message || 'Failed to fetch project'
            return null
        } finally {
            $state.isLoading = false
        }
    }

    async function createProject(userId: string, contextPath: string): Promise<ProjectRecord | null> {
        $state.isLoading = true
        $state.error = null

        try {
            const project = await projectApi.create(userId, contextPath)
            $state.projects = [...$state.projects, project]
            $state.currentProject = project
            return project
        } catch (error: any) {
            $state.error = error.message || 'Failed to create project'
            return null
        } finally {
            $state.isLoading = false
        }
    }

    async function updateProject(projectId: string, updates: ProjectUpdate): Promise<ProjectRecord | null> {
        $state.isLoading = true
        $state.error = null

        try {
            await projectApi.update(
                projectId,
                updates.userId || null,
                updates.contextPath || null,
                updates.status || null
            )

            // Refresh the project data
            const updated = await projectApi.getById(projectId)

            // Update both the projects list and currentProject
            $state.projects = $state.projects.map(p =>
                p.id === projectId ? updated : p
            )

            if ($state.currentProject?.id === projectId) {
                $state.currentProject = updated
            }

            return updated
        } catch (error: any) {
            $state.error = error.message || 'Failed to update project'
            return null
        } finally {
            $state.isLoading = false
        }
    }

    async function deleteProject(projectId: string): Promise<boolean> {
        $state.isLoading = true
        $state.error = null

        try {
            await projectApi.delete(projectId)

            // Remove from state
            $state.projects = ($state.projects || []).filter(p => p.id !== projectId)

            if ($state.currentProject?.id === projectId) {
                $state.currentProject = null
            }

            return true
        } catch (error: any) {
            $state.error = error.message || 'Failed to delete project'
            return false
        } finally {
            $state.isLoading = false
        }
    }

    return {
        // State accessors
        get projects() {
            return $state.projects
        },
        get activeProjects() {
            return $derived.activeProjects
        },
        get currentProject() {
            return $state.currentProject
        },
        get isLoading() {
            return $state.isLoading
        },
        get error() {
            return $state.error
        },

        // Actions
        loadProjects,
        getProjectById,
        createProject,
        updateProject,
        deleteProject,

        // Reset store
        reset() {
            $state = {
                projects: [],
                currentProject: null,
                isLoading: false,
                error: null
            }
        }
    }
}
