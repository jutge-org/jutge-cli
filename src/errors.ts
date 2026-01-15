export class UnauthorizedError extends Error {
    override name: string = 'UnauthorizedError'
    constructor(message: string = 'Unauthorized') {
        super(message)
    }
}

export class InfoError extends Error {
    override name: string = 'InfoError'
    constructor(message: string) {
        super(message)
    }
}

export class NotFoundError extends Error {
    override name: string = 'NotFoundError'
    constructor(message: string) {
        super(message)
    }
}

export class InputError extends Error {
    override name: string = 'InputError'
    constructor(message: string) {
        super(message)
    }
}

export class ProtocolError extends Error {
    override name: string = 'ProtocolError'
    constructor(message: string) {
        super(message)
    }
}

export const throwError = (error: Record<string, any>, operation_id: string | undefined) => {
    const message = error.message || 'Unknown error'
    if (error.name === 'UnauthorizedError') {
        throw new UnauthorizedError(message)
    } else if (error.name === 'InfoError') {
        throw new InfoError(message)
    } else if (error.name === 'NotFoundError') {
        throw new NotFoundError(message)
    } else if (error.name === 'InputError') {
        throw new InputError(message)
    } else {
        throw new Error(message)
    }
}
