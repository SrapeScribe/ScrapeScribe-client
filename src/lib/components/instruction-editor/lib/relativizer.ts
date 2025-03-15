import { SchemeType, type Scheme } from "./interfaces"

// NOTE:
// - might not work for nested lists or for arbitrarily nested objects
// - could be worth it to introduce a "relativizer" mode to the wasm, so that it takes care of this for us

export function makeElementSchemePathsRelative(scheme: Scheme): Scheme {
    if (scheme.type === SchemeType.List && scheme.path && scheme.element_scheme) {
        return {
            ...scheme,
            element_scheme: makePathRelativeToParent(scheme.element_scheme, scheme.path)
        }
    } else if (scheme.type === SchemeType.Object) {
        return {
            ...scheme,
            fields: scheme.fields.map(field => ({
                ...field,
                value: field.value ? makeElementSchemePathsRelative(field.value) : field.value
            }))
        }
    }
    
    // unchanged for strings i think
    return scheme
}
  

function makePathRelativeToParent(scheme: Scheme, parentPath: string): Scheme {
    if (scheme.type === SchemeType.String && scheme.path) {
        const relativePath = makePathRelative(scheme.path, parentPath)
        return {
            ...scheme,
            path: relativePath
        }
    } else if (scheme.type === SchemeType.Object) {
        return {
            ...scheme,
            fields: scheme.fields.map(field => ({
                ...field,
                value: field.value ? makePathRelativeToParent(field.value, parentPath) : field.value
            }))
        }
    } else if (scheme.type === SchemeType.List && scheme.path) {
        // might work for nested lists?
        const relativePath = makePathRelative(scheme.path, parentPath);
        return {
            ...scheme,
            path: relativePath,
            element_scheme: scheme.element_scheme ? 
                makePathRelativeToParent(scheme.element_scheme, scheme.path) : 
                scheme.element_scheme
        }
    }
    
    return scheme
}
  

function makePathRelative(childPath: string, parentPath: string): string {
    const parentSegments = parentPath.split('>').map(s => s.trim())
    const childSegments = childPath.split('>').map(s => s.trim())
    
    // could prob be better but im lazy
    let commonSegments = 0
    const minLength = Math.min(parentSegments.length, childSegments.length)
    
    for (let i = 0; i < minLength; i++) {
        if (parentSegments[i] === childSegments[i]) {
            commonSegments++
        } else {
            break
        }
    }
    
    const remainingSegments = childSegments.slice(commonSegments)
    
    // removing the :nth-of-type(n) 
    if (remainingSegments.length > 0) {
        const firstSegment = remainingSegments[0]
        const tagNameMatch = firstSegment.match(/^([a-zA-Z0-9-_]+)(?::nth-of-type\(\d+\))?/)
        
        if (tagNameMatch && tagNameMatch[1]) {
            remainingSegments[0] = tagNameMatch[1]
        }
    }
    
    return remainingSegments.join(' > ')
}