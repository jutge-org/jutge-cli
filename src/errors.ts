export class UnauthorizedError extends Error {
    name: string = "UnauthorizedError"
    constructor(public message: string = "Unauthorized") {
        super(message)
    }
}

export class InfoError extends Error {
    name: string = "InfoError"
    constructor(public message: string) {
        super(message)
    }
}

export class NotFoundError extends Error {
    name: string = "NotFoundError"
    constructor(public message: string) {
        super(message)
    }
}

export class InputError extends Error {
    name: string = "InputError"
    constructor(public message: string) {
        super(message)
    }
}

export class ProtocolError extends Error {
    name: string = "ProtocolError"
    constructor(public message: string) {
        super(message)
    }
}

export const throwError = (error: Record<string, any>, operation_id: string | undefined) => {
    const message = error.message || "Unknown error"
    if (error.name === "UnauthorizedError") {
        throw new UnauthorizedError(message)
    } else if (error.name === "InfoError") {
        throw new InfoError(message)
    } else if (error.name === "NotFoundError") {
        throw new NotFoundError(message)
    } else if (error.name === "InputError") {
        throw new InputError(message)
    } else {
        throw new Error(message)
    }
}
