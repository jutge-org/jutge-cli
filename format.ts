import type { AxiosResponse } from 'axios'

export async function showResponse(promise: Promise<AxiosResponse<any, any>>) {
    const response = await promise
    if (response.status !== 200) {
        console.error(`Error: ${response.status} ${response.statusText}`)
    } else if (response.data.message !== undefined) {
        console.log(response.data.message)
    } else {
        console.log(response.data)
    }
}
