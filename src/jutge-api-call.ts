import { JUTGE_API_URL } from './env'
import { ProtocolError, throwError } from './errors'
import { printStdout } from './print'
import { File } from 'buffer'

export interface Download {
    readonly content: Uint8Array
    readonly name: string
    readonly type: string
}

export const jutgeApiCall = async (
    func: string,
    input: any,
    ifiles: File[] = [],
    debug: boolean = false,
): Promise<[any, Download[]]> => {
    // prepare form
    const iform = new FormData()
    const idata = { func, input, meta: jutgeApiCall.meta }

    iform.append('data', JSON.stringify(idata))
    ifiles.forEach((file, i) => iform.append(`file_${i}`, file))

    if (debug) {
        printStdout('input', idata)
    }

    // send request
    const response = await fetch(JUTGE_API_URL, { method: 'POST', body: iform })

    // process response
    const contentType = response.headers.get('content-type')?.split(';')[0]?.toLowerCase()
    if (contentType !== 'multipart/form-data') {
        throw new ProtocolError('The content type is not multipart/form-data')
    }

    const oform = await response.formData()
    const odata = oform.get('data')
    if (debug) {
        printStdout('output', odata)
    }

    const { output, error, duration, operation_id, time } = JSON.parse(odata as string)
    if (error) {
        throwError(error, operation_id)
    }

    // extract ofiles
    const ofiles: { content: Uint8Array; name: string; type: string }[] = []
    for (const [key, value] of oform.entries()) {
        if (value instanceof File) {
            ofiles.push({
                content: new Uint8Array(await value.arrayBuffer()),
                name: value.name,
                type: value.type,
            })
        }
    }

    return [output, ofiles]
}

export type Meta = { token: string } | undefined
jutgeApiCall.meta = undefined as Meta

export const setAPIToken = (token: string) => {
    jutgeApiCall.meta = { token }
}
