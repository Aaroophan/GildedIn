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
        if (typeof window !== 'undefined' && window.location.hostname === 'stg.envisionarc.com') {
            return process.env.NEXT_PUBLIC_STG_API || ''
        }
        return process.env.NEXT_PUBLIC_DEV_API || ''
    }
}