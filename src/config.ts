import Conf from "conf"

const configSchema = {
    user: {
        type: "object",
        properties: {
            name: {
                type: "string",
                default: null,
            },
            email: {
                type: "string",
                default: null,
            },
            type: {
                type: "string",
                default: null,
            },
        },
    },
    credentials: {
        type: "object",
        properties: {
            token: {
                type: "string",
                default: null,
            },
            expiration: {
                type: "string",
                default: null,
            },
            user_uid: {
                type: "string",
                default: null,
            },
        },
    },
}

export const config = new Conf({
    projectName: "@jutge.org/cli",
    projectSuffix: null,
    schema: configSchema,
})
