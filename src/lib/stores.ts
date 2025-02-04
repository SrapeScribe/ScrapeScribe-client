import { writable } from 'svelte/store';
import type {Project} from "../interfaces"

export const projectStore = writable({
    id: '',
    user_id: '',
    name: '',
    endpoints: [],
} as Project);
