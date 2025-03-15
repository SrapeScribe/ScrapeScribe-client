import { SchemeType, type Instructions, type Scheme } from "./interfaces"

export function interlaceInstructions(instructions: Instructions, output: any): Instructions {
    return {
        ...instructions,
        scheme: interlaceScheme(instructions.scheme, output)
    }
}

// PROBABLY BROKEN FOR NESTED LISTS (whether it be directly or indirectly), this is just a quick implementation
// TODO: 
// - debug this with prints
// - throw errors instead of leaving undefined or not checking at all

export function interlaceScheme(scheme: Scheme, content: any): Scheme {
    switch (scheme.type) {
        case SchemeType.String:
            return {
                ...scheme,
                content  // VERIFY THAT THIS IS A STRING
            }
        case SchemeType.List:
            return {
                ...scheme,
                content: Array.isArray(content) ? content : [],  // THROW ERROR INSTEAD,
                element_scheme: scheme.element_scheme 
                    ? interlaceScheme(scheme.element_scheme, 
                        Array.isArray(content) ? content[0] : undefined)  // all content maybe?
                    : undefined
            }
        case SchemeType.Object:
            return {
                ...scheme,
                fields: scheme.fields.map(field => ({
                    ...field,
                    value: field.value && content[field.key]
                        ? interlaceScheme(field.value, content[field.key])
                        : field.value
                }))
            }
    }
}