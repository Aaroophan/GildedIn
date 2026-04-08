export class APIURLService {
    private static instance: APIURLService

    private constructor() { }

    public static getInstance(): APIURLService {
        if (!APIURLService.instance) {
            APIURLService.instance = new APIURLService()
        }
        return APIURLService.instance
    }

    public get APIURL(): string {
        return process.env.NEXT_PUBLIC_API || ''
    }
}