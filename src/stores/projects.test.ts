import {describe, it, expect, beforeEach, vi, afterEach} from 'vitest'
import {createProjectsStore} from './projects'

// Mock the API module
vi.mock('../lib/api/client', () => {
    return {
        projectApi: {
            getWithEndpointCounts: vi.fn(),
            getById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn()
        }
    }
})

// Import the mocked module
import {projectApi} from '$lib/api/client'
import type {Project, ProjectRecord, ProjectWithEndpointCount} from "../interfaces"

describe('Projects Store', () => {
    // Sample data for testing
    const mockProject: ProjectRecord = {
        id: 'project-123',
        user_id: 'user-123',
        context_path: 'test-project',
        status: 'ACTIVE',
        created_at: '2025-02-25T12:00:00Z',
        updated_at: '2025-02-25T12:00:00Z',
        endpoint_count: 0 // Add endpoint_count to make it compatible with both types
    }

    const mockProjectWithCount: ProjectRecord = {
        id: 'project-123',
        user_id: 'user-123', // Add user_id to make it compatible with both types
        context_path: 'test-project',
        status: 'ACTIVE',
        created_at: '2025-02-25T12:00:00Z',
        updated_at: '2025-02-25T12:00:00Z', // Add updated_at to make it compatible
        endpoint_count: 3
    }

    const mockInactiveProject: ProjectRecord = {
        ...mockProject,
        id: 'project-456',
        context_path: 'inactive-project',
        status: 'INACTIVE'
    }

    // Reset all mocks before each test
    beforeEach(() => {
        vi.resetAllMocks()
    })

    // Clean up after tests
    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('Initialization', () => {
        it('should initialize with empty state', () => {
            const store = createProjectsStore()
            expect(store.projects).toEqual([])
            expect(store.currentProject).toBeNull()
            expect(store.isLoading).toBe(false)
            expect(store.error).toBeNull()
        })
    })

    describe('loadProjects', () => {
        it('should load projects and update state', async () => {
            // Setup mock
            const mockProjects: ProjectRecord[] = [mockProjectWithCount]
            vi.mocked(projectApi.getWithEndpointCounts).mockResolvedValue(mockProjects as ProjectWithEndpointCount[])

            const store = createProjectsStore()
            const result = await store.loadProjects('user-123')

            // Verify API was called correctly
            expect(projectApi.getWithEndpointCounts).toHaveBeenCalledWith('user-123')

            // Verify state was updated
            expect(store.projects).toEqual(mockProjects)
            expect(store.isLoading).toBe(false)
            expect(store.error).toBeNull()

            // Verify return value
            expect(result).toEqual(mockProjects)
        })

        it('should handle errors when loading projects', async () => {
            // Setup mock to throw error
            const errorMessage = 'API error'
            vi.mocked(projectApi.getWithEndpointCounts).mockRejectedValue(new Error(errorMessage))

            const store = createProjectsStore()
            const result = await store.loadProjects('user-123')

            // Verify state reflects error
            expect(store.projects).toEqual([])
            expect(store.error).toBe(errorMessage)
            expect(store.isLoading).toBe(false)

            // Verify return value in error case
            expect(result).toEqual([])
        })
    })

    describe('getProjectById', () => {
        it('should return cached project if available', async () => {
            // Setup mock BEFORE creating the store or loading data
            const mockProjects = [mockProject]
            vi.mocked(projectApi.getWithEndpointCounts).mockResolvedValue(mockProjects as ProjectWithEndpointCount[])

            const store = createProjectsStore()

            // Load the projects into the store
            await store.loadProjects('user-123')

            // Verify the projects were loaded
            expect(store.projects).toEqual(mockProjects)

            // Clear all mocks to start fresh
            vi.clearAllMocks()

            // Now get the project by ID - this should use cache
            const result = await store.getProjectById(mockProject.id)

            // API should not be called since project is in cache
            expect(projectApi.getById).not.toHaveBeenCalled()
            expect(result).toEqual(mockProject)
            expect(store.currentProject).toEqual(mockProject)
        })

        it('should fetch project from API if not in cache', async () => {
            vi.mocked(projectApi.getById).mockResolvedValue(mockProject)

            const store = createProjectsStore()
            const result = await store.getProjectById('project-123')

            expect(projectApi.getById).toHaveBeenCalledWith('project-123')
            expect(result).toEqual(mockProject)
            expect(store.currentProject).toEqual(mockProject)
        })

        it('should handle errors when fetching project', async () => {
            vi.mocked(projectApi.getById).mockRejectedValue(new Error('Not found'))

            const store = createProjectsStore()
            const result = await store.getProjectById('invalid-id')

            expect(result).toBeNull()
            expect(store.error).toBe('Not found')
            expect(store.currentProject).toBeNull()
        })
    })

    describe('createProject', () => {
        it('should create a new project and update state', async () => {
            vi.mocked(projectApi.create).mockResolvedValue(mockProject)

            const store = createProjectsStore()
            const result = await store.createProject('user-123', 'test-project')

            expect(projectApi.create).toHaveBeenCalledWith('user-123', 'test-project')
            expect(result).toEqual(mockProject)
            expect(store.projects).toContain(mockProject)
            expect(store.currentProject).toEqual(mockProject)
        })

        it('should handle errors when creating a project', async () => {
            vi.mocked(projectApi.create).mockRejectedValue(new Error('Creation failed'))

            const store = createProjectsStore()
            const result = await store.createProject('user-123', 'test-project')

            expect(result).toBeNull()
            expect(store.error).toBe('Creation failed')
            expect(store.projects).toEqual([])
        })
    })

    describe('updateProject', () => {
        it('should update a project and refresh state', async () => {
            const updatedProject = { ...mockProject, context_path: 'updated-path' };

            // Create the store first
            const store = createProjectsStore();

            // Set up mocks properly
            vi.mocked(projectApi.update).mockResolvedValueOnce(undefined);
            vi.mocked(projectApi.getById).mockResolvedValueOnce(updatedProject);

            // First add the original project to the state
            vi.mocked(projectApi.getWithEndpointCounts).mockResolvedValueOnce([mockProject] as ProjectWithEndpointCount[]);
            await store.loadProjects('user-123');

            // Explicitly set the currentProject before testing update
            // This is the critical step that was missing
            await store.getProjectById(mockProject.id);
            expect(store.currentProject).toEqual(mockProject); // Verify it's set

            // Clear mock history before update
            vi.clearAllMocks();

            // Reset the getById mock to return the updated project
            vi.mocked(projectApi.getById).mockResolvedValueOnce(updatedProject);

            // Now update it
            const updates = { contextPath: 'updated-path' };
            const result = await store.updateProject(mockProject.id, updates);

            // Verify the API calls
            expect(projectApi.update).toHaveBeenCalledWith(
                mockProject.id,
                null,  // userId
                'updated-path',
                null  // status
            );
            expect(projectApi.getById).toHaveBeenCalledWith(mockProject.id);

            // Verify the result
            expect(result).toEqual(updatedProject);

            // Verify state was updated correctly
            const updatedInState = store.projects.find(p => p.id === mockProject.id);
            expect(updatedInState).toEqual(updatedProject);
            expect(store.currentProject).toEqual(updatedProject);
        });



        it('should handle errors when updating a project', async () => {
            vi.mocked(projectApi.update).mockRejectedValue(new Error('Update failed'))

            const store = createProjectsStore()

            // Add a project to state first
            vi.mocked(projectApi.getWithEndpointCounts).mockResolvedValueOnce([mockProject] as ProjectWithEndpointCount[])
            await store.loadProjects('user-123')

            const result = await store.updateProject(mockProject.id, {status: 'INACTIVE'})

            expect(result).toBeNull()
            expect(store.error).toBe('Update failed')

            // State should remain unchanged
            expect(store.projects[0]).toEqual(mockProject)
        })
    })

    describe('deleteProject', () => {
        it('should delete a project and update state', async () => {
            vi.mocked(projectApi.delete).mockResolvedValue(undefined)

            const store = createProjectsStore()

            // Add projects to state first
            vi.mocked(projectApi.getWithEndpointCounts).mockResolvedValueOnce([mockProject, mockInactiveProject] as ProjectWithEndpointCount[])
            await store.loadProjects('user-123')

            await store.getProjectById(mockProject.id)

            const result = await store.deleteProject(mockProject.id)

            expect(projectApi.delete).toHaveBeenCalledWith(mockProject.id)
            expect(result).toBe(true)

            // Only the other project should remain
            expect(store.projects.length).toBe(1)
            expect(store.projects[0].id).toBe(mockInactiveProject.id)
            expect(store.currentProject).toBeNull()
        })

        it('should handle errors when deleting a project', async () => {
            vi.mocked(projectApi.delete).mockRejectedValue(new Error('Delete failed'))

            const store = createProjectsStore()

            // Add a project to state first
            vi.mocked(projectApi.getWithEndpointCounts).mockResolvedValueOnce([mockProject] as ProjectWithEndpointCount[])
            await store.loadProjects('user-123')

            const result = await store.deleteProject(mockProject.id)

            expect(result).toBe(false)
            expect(store.error).toBe('Delete failed')

            // State should remain unchanged
            expect(store.projects).toContainEqual(mockProject)
        })
    })

    describe('Derived state', () => {
        it('should correctly filter active projects', async () => {
            const store = createProjectsStore()

            // Add both active and inactive projects
            vi.mocked(projectApi.getWithEndpointCounts).mockResolvedValueOnce([
                mockProject,  // ACTIVE
                mockInactiveProject  // INACTIVE
            ] as ProjectWithEndpointCount[])

            await store.loadProjects('user-123')

            expect(store.projects.length).toBe(2)
            expect(store.activeProjects.length).toBe(1)
            expect(store.activeProjects[0].id).toBe(mockProject.id)
        })
    })

    describe('Reset functionality', () => {
        it('should reset the store to initial state', async () => {
            const store = createProjectsStore()

            // Add data to store
            vi.mocked(projectApi.getWithEndpointCounts).mockResolvedValueOnce([mockProject] as ProjectWithEndpointCount[])
            await store.loadProjects('user-123')

            expect(store.projects.length).toBe(1)

            // Reset store
            store.reset()

            // Verify reset state
            expect(store.projects).toEqual([])
            expect(store.currentProject).toBeNull()
            expect(store.isLoading).toBe(false)
            expect(store.error).toBeNull()
        })
    })
})
