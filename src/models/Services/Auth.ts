import LogRocket from 'logrocket'
import { MessageService } from './Messages'
import { APIURLService } from './API'
// import { SHA512 } from 'crypto-js'

export class AuthService {
    private static instance: AuthService
    private isAuthenticated = false
    private currentUser: {
        Status: number,
        Message: string,
        User_First_Name: string,
        User_Last_Name: string,
        User_Email_Address: string,
        User_Session_Token: string,
        User_Current_Role: string,
        Menu_Items: Array<any>
    } | null = null
    private MenuItems: Array<any> = []
    private Permissions: {
        Select: number,
        Insert: number,
        Update: number,
        Delete: number,
    } | null = {
            Select: 1,
            Insert: 1,
            Update: 1,
            Delete: 1,
        }
    private subscribers: (() => void)[] = []
    private PendingUser: { User_ID: string } | null = null
    private TwoFAMethod: 1 | 2 | 3 | null = null
    private Message: string = ''
    private User_ID: string = ''
    private User_Session_Token: string = ''
    private Email: string = ''
    private IP_Address: string = '10.10.10.10'
    private QRImage: string = '/images/qrcode.png'

    private readonly APIURLService: APIURLService
    private readonly messageService = MessageService.getInstance()

    private constructor() {
        this.APIURLService = APIURLService.getInstance()
        this.messageService = MessageService.getInstance()
        this.initializeFromSessionStorage()
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService()
        }
        return AuthService.instance
    }

    private initializeFromSessionStorage(): void {
        if (typeof window === 'undefined') return

        // Restore pending user from session storage
        const pendingUserID = sessionStorage.getItem('CurrentPendingUserID')
        if (pendingUserID) {
            const storedUser = sessionStorage.getItem(`PendingUser_${pendingUserID}`)
            if (storedUser) {
                this.PendingUser = JSON.parse(storedUser)
                this.User_ID = pendingUserID
            }
            const storedMethod = sessionStorage.getItem(`TwoFAMethod_${pendingUserID}`)
            if (storedMethod !== null) {
                this.TwoFAMethod = parseInt(storedMethod) as 1 | 2 | 3
            }
        }

        // Restore authenticated user from session storage
        const storedAuthUser = sessionStorage.getItem('AuthenticatedUser')
        if (storedAuthUser) {
            try {
                const authData = JSON.parse(storedAuthUser)
                this.isAuthenticated = true
                this.currentUser = authData.currentUser
                this.MenuItems = authData.menuItems || []
                this.Permissions = authData.permissions || this.Permissions
                this.User_ID = authData.userId || ''
                this.User_Session_Token = authData.userSessionToken || ''
                this.IP_Address = authData.ipAddress || this.IP_Address

                if (authData.qrImage) {
                    this.QRImage = authData.qrImage
                }

                // Re-initialize LogRocket for the authenticated user
                if (this.User_ID && process.env.NEXT_PUBLIC_LOG_ROCKET_APP_ID) {
                    LogRocket.init(process.env.NEXT_PUBLIC_LOG_ROCKET_APP_ID)
                    LogRocket.identify(this.User_ID, {
                        User_ID: this.User_ID,
                        email: this.currentUser?.User_Email_Address || ''
                    })
                }

                this.notifySubscribers()
            } catch (error) {
                console.error('Failed to parse stored authentication data:', error)
                this.clearAuthenticatedSession()
            }
        }
    }

    private saveAuthenticatedSession(): void {
        if (typeof window === 'undefined' || !this.isAuthenticated || !this.currentUser) return

        const authData = {
            currentUser: this.currentUser,
            menuItems: this.MenuItems,
            permissions: this.Permissions,
            userId: this.User_ID,
            userSessionToken: this.User_Session_Token,
            ipAddress: this.IP_Address,
            qrImage: this.QRImage
        }

        sessionStorage.setItem('AuthenticatedUser', JSON.stringify(authData))
    }

    private clearAuthenticatedSession(): void {
        if (typeof window === 'undefined') return

        sessionStorage.removeItem('AuthenticatedUser')
    }

    public async login(email: string, password: string): Promise<{
        Status: number
        TwoFAMethod?: number
        Message: string
        User_ID?: string
    }> {
        try {
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json')
                if (ipResponse.ok) {
                    const ipData = await ipResponse.json()
                    this.IP_Address = ipData.ip
                }
            } catch (error) {
                console.error('Failed to fetch IP_Address address', error)
            }

            const Username = email
            const Password = password //'0x' + SHA512(process.env.NEXT_PUBLIC_SALT + password + process.env.NEXT_PUBLIC_SALT).toString() //To be changed

            const requestData = {
                Username,
                Password,
                IP_Address: this.IP_Address
            }

            const response = await fetch(`${this.APIURLService.APIURL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            })

            const data = await response.json()

            if ([200, 201, 202, 203, 204, 205, 206, 207, 208, 226].includes(data.Status)) {
                this.messageService.setMessage(data.Status, data.Message)
                this.setUser({
                    User_Session_Token: data.User_Session_Token
                })
                this.PendingUser = { User_ID: data.User_ID }
                this.TwoFAMethod = data.TwoFAMethod || 2
                this.Message = data.Message || "Two-factor authentication required"
                this.User_ID = data.User_ID

                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('CurrentPendingUserID', this.User_ID)
                    sessionStorage.setItem(`PendingUser_${this.User_ID}`, JSON.stringify(this.PendingUser))
                    sessionStorage.setItem(`TwoFAMethod_${this.User_ID}`, this.TwoFAMethod ? this.TwoFAMethod.toString() : "2")

                    sessionStorage.removeItem('PendingUser')
                    sessionStorage.removeItem('TwoFAMethod')
                }

                if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_LOG_ROCKET_APP_ID != null) {
                    LogRocket.init(process.env.NEXT_PUBLIC_LOG_ROCKET_APP_ID)
                }
                // Identify real user in LogRocket
                LogRocket.identify(this.User_ID, {
                    User_ID: this.User_ID,
                    email: email
                })

                const Generate2FAData: any = await this.Generate2FA()

                if ([200, 201, 202, 203, 204, 205, 206, 207, 208, 226].includes(Generate2FAData.Status)) {
                    this.messageService.setMessage(Generate2FAData.Status, Generate2FAData.Message)
                    this.setUser({
                        User_Session_Token: Generate2FAData.User_Session_Token
                    })
                    return {
                        Status: data.Status,
                        TwoFAMethod: this.TwoFAMethod ?? undefined,
                        Message: this.Message,
                        User_ID: this.User_ID
                    }
                } else {
                    this.messageService.setMessage(Generate2FAData.Status, Generate2FAData.Message)
                    // this.setTwoFAMethod(2)
                    // const Generate2FAData = await this.Generate2FA()
                    return {
                        Status: data.Status,
                        Message: Generate2FAData.Message || this.Message
                    }
                }
            } else {
                this.messageService.setMessage(data.Status, data.Message)
                this.isAuthenticated = false
                this.currentUser = null
                return {
                    Status: data.Status,
                    Message: data.Message
                }
            }
        } catch (error) {
            console.error(error instanceof Error ? error.message || "Internal Server Error" : "Internal Server Error")
            const Response = {
                Status: 500,
                Message: `500 - Internal Server Error${error instanceof Error && error.message ? '\n' + error.message : ''}`
            }
            this.messageService.setMessage(Response.Status, Response.Message)
            return Response
        }
    }

    public async Generate2FA(): Promise<{ Status: number; Message?: string }> {
        try {
            const requestData = {
                User_ID: this.User_ID,
                User_Session_Token: this.User_Session_Token,
                Channel_ID: this.TwoFAMethod?.toString(),
                IP_Address: this.IP_Address
            }

            const response = await fetch(`${this.APIURLService.APIURL}/auth/generate-2fa`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            })

            const data = await response.json()

            if ([200, 201, 202, 203, 204, 205, 206, 207, 208, 226].includes(data.Status)) {
                this.setUser({
                    User_Session_Token: data.User_Session_Token
                })
                this.messageService.setMessage(data.Status, data.Message)
                const Response = {
                    Status: data.Status,
                    Message: data.Message
                }

                return Response
            } else {
                this.setUser({
                    User_Session_Token: data.User_Session_Token
                })
                this.messageService.setMessage(data.Status, data.Message)
                const Response = {
                    Status: data.Status,
                    Message: data.Message
                }
                return Response
            }
        } catch (error) {
            const Response = {
                Status: 500,
                Message: `500 - Internal Server Error${error instanceof Error && error.message ? '\n' + error.message : ''}`
            }
            this.messageService.setMessage(Response.Status, Response.Message)
            return Response
        }
    }

    public async Verify2FA(Code: string): Promise<{ Status: number; Message?: string }> {
        try {
            if (!this.PendingUser) {
                if (typeof window !== 'undefined') {
                    const storedUser = sessionStorage.getItem('PendingUser')
                    if (storedUser) {
                        this.PendingUser = JSON.parse(storedUser)
                        const storedMethod = sessionStorage.getItem('TwoFAMethod')
                        if (storedMethod !== null) {
                            this.TwoFAMethod = parseInt(storedMethod) as 1 | 2 | 3
                        }
                    }
                }

                if (!this.PendingUser) {
                    return { Status: 200, Message: "No pending 2FA verification" }
                }
            }

            const requestData = {
                User_ID: this.User_ID,
                User_Session_Token: this.User_Session_Token,
                Code,
                IP_Address: this.IP_Address
            }

            const response = await fetch(`${this.APIURLService.APIURL}/auth/verify-2fa`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            })

            const data = await response.json()

            if ([200, 201, 202, 203, 204, 205, 206, 207, 208, 226].includes(data.Status)) {
                this.isAuthenticated = true
                this.currentUser = data
                this.PendingUser = null
                this.TwoFAMethod = null
                this.Permissions = data.Permissions != null ? data.Permissions : this.Permissions
                this.MenuItems = data.Menu_Items
                this.User_Session_Token = data.User_Session_Token
                this.setUser({
                    User_Session_Token: data.User_Session_Token
                })
                if (data.Image) {
                    this.setQRImg(data.Image)
                }

                this.messageService.setMessage(data.Status, data.Message)

                // Save authenticated session to sessionStorage
                this.saveAuthenticatedSession()

                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('CurrentPendingUserID')
                    sessionStorage.removeItem(`PendingUser_${this.User_ID}`)
                    sessionStorage.removeItem(`TwoFAMethod_${this.User_ID}`)
                }

                this.notifySubscribers()

                const Response = {
                    Status: data.Status,
                    Message: data.Message
                }

                return Response
            } else {
                this.setUser({
                    User_Session_Token: data.User_Session_Token
                })
                const Response = {
                    Status: data.Status,
                    Message: data.Message
                }
                this.messageService.setMessage(data.Status, data.Message)
                return Response
            }
        } catch (error) {
            const Response = {
                Status: 500,
                Message: `500 - Internal Server Error${error instanceof Error && error.message ? '\n' + error.message : ''}`
            }
            this.messageService.setMessage(Response.Status, Response.Message)
            return Response
        }
    }

    public setTwoFAMethod(method: 1 | 2 | 3 | null): void {
        this.TwoFAMethod = method
        if (typeof window !== 'undefined') {
            if (method) {
                sessionStorage.setItem('TwoFAMethod', method.toString())
            } else {
                sessionStorage.removeItem('TwoFAMethod')
            }
        }
    }

    public setPendingUser(user: { User_ID: string } | null): void {
        this.PendingUser = user
        if (typeof window !== 'undefined') {
            if (user) {
                sessionStorage.setItem('PendingUser', JSON.stringify(user))
            } else {
                sessionStorage.removeItem('PendingUser')
            }
        }
    }

    public logout(): void {
        this.isAuthenticated = false
        this.currentUser = null
        this.PendingUser = null
        this.TwoFAMethod = null
        this.Permissions = null

        // this.messageService.setMessage(this.messageService.getMessage().Status, this.messageService.getMessage().Message+"\nLogged Out")

        // Clear all session storage
        this.clearAuthenticatedSession()
        if (typeof window !== 'undefined') {
            const pendingUserID = sessionStorage.getItem('CurrentPendingUserID')
            if (pendingUserID) {
                sessionStorage.removeItem(`PendingUser_${pendingUserID}`)
                sessionStorage.removeItem(`TwoFAMethod_${pendingUserID}`)
            }
            sessionStorage.removeItem('CurrentPendingUserID')

            sessionStorage.removeItem('PendingUser')
            sessionStorage.removeItem('TwoFAMethod')
        }

        this.notifySubscribers()
        // LogRocket.identify('anonymous')
        LogRocket.startNewSession()
    }

    public getAuthStatus(): boolean {
        return this.isAuthenticated
    }

    public getCurrentUser(): {
        Status: number,
        Message: string,
        User_First_Name: string,
        User_Last_Name: string,
        User_Email_Address: string,
        User_Session_Token: string,
        User_Current_Role: string,
        Menu_Items: Array<any>
    } | null {
        return this.currentUser
    }

    public setCurrentUser(
        data: any
    ): {
        Status: number,
        Message: string,
        User_First_Name: string,
        User_Last_Name: string,
        User_Email_Address: string,
        User_Session_Token: string,
        User_Current_Role: string,
        Menu_Items: Array<any>
    } | null {
        this.currentUser = data

        this.isAuthenticated = true
        this.currentUser = data
        this.PendingUser = null
        this.TwoFAMethod = null
        this.Permissions = data.Permissions != null ? data.Permissions : this.Permissions
        this.MenuItems = data.Menu_Items

        // Save to session storage when setting current user
        this.saveAuthenticatedSession()

        this.notifySubscribers()
        return this.currentUser
    }

    public getPendingUser(): { User_ID: string } | null {
        return this.PendingUser
    }

    public getTwoFAMethod(): 1 | 2 | 3 | null {
        return this.TwoFAMethod
    }

    public getMenuItems(): Array<any> {
        return this.MenuItems
    }

    public getUser(): { User_ID: string, IP_Address: string, User_Session_Token: string } {
        return {
            User_ID: this.User_ID,
            IP_Address: this.IP_Address,
            User_Session_Token: this.User_Session_Token
        }
    }

    public setUser({
        User_ID,
        IP_Address,
        User_Session_Token
    }: {
        User_ID?: string,
        IP_Address?: string,
        User_Session_Token?: string
    }): void {
        if (User_ID) this.User_ID = User_ID
        if (IP_Address) this.IP_Address = IP_Address
        if (User_Session_Token) this.User_Session_Token = User_Session_Token
    }

    public getQRImg(): string {
        return this.QRImage
    }

    public setQRImg(QRImage: string): void {
        this.QRImage = QRImage
        // Update session storage if authenticated
        if (this.isAuthenticated) {
            this.saveAuthenticatedSession()
        }
    }

    public async getIP(): Promise<string> {
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json')
            if (ipResponse.ok) {
                const ipData = await ipResponse.json()
                this.IP_Address = ipData.ip
                // Update session storage if authenticated
                if (this.isAuthenticated) {
                    this.saveAuthenticatedSession()
                }
                return this.IP_Address
            }
        } catch (error) {
            console.error('Failed to fetch IP_Address address', error)
        }
        return this.IP_Address
    }

    public getPermissions(): {
        Select: number,
        Insert: number,
        Update: number,
        Delete: number,
    } | null {
        return this.Permissions
    }

    public setPermissions(GridPermissions: {
        Select: number,
        Insert: number,
        Update: number,
        Delete: number,
    }): {
        Select: number,
        Insert: number,
        Update: number,
        Delete: number,
    } {
        this.Permissions = GridPermissions
        // Update session storage if authenticated
        if (this.isAuthenticated) {
            this.saveAuthenticatedSession()
        }
        return this.Permissions
    }

    public subscribe(callback: () => void): void {
        this.subscribers.push(callback)
    }

    public unsubscribe(callback: () => void): void {
        this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }

    private notifySubscribers(): void {
        this.subscribers.forEach(callback => callback())
    }
}