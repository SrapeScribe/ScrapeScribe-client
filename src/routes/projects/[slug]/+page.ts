import type {PageLoad} from './$types'

export const load: PageLoad = async ({params, fetch}) => {

    try {

    }
    catch (error) {
        console.error(error)
    }

    return {
        params
    }
}
