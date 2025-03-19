type SelectionType = 'STRING' | 'LIST' | null

interface SelectionState {
    isActive: boolean
    type: SelectionType
    message: string
    callback: ((element: HTMLElement) => void) | null
}

export let selectionMode = $state<SelectionState>({
    isActive: false,
    type: null,
    message: '',
    callback: null
})

export function startSelection(type: SelectionType, callback: (element: HTMLElement) => void) {
    selectionMode.isActive = true
    selectionMode.type = type
    selectionMode.message = `Select a ${type} element`
    selectionMode.callback = callback;
}

export function endSelection() {
    selectionMode.isActive = false
    selectionMode.type = null
    selectionMode.message = ''
    selectionMode.callback = null
}