export class MessageService {
    private static instance: MessageService
    private subscribers: (() => void)[] = [];
    private Status: number = 0
    private Message: string = ""

    private constructor() { }

    public static getInstance(): MessageService {
        if (!MessageService.instance) {
            MessageService.instance = new MessageService()
        }
        return MessageService.instance
    }

    public getMessage(): { Status: number, Message: string } {
        return {
            Status: this.Status,
            Message: this.Message
        }
    }

    public setMessage(NewStatus: number, NewMessage: string): { Status: number, Message: string } {
        this.Status = NewStatus
        this.Message = NewMessage
        this.notifySubscribers();
        return {
            Status: this.Status,
            Message: this.Message
        }
    }

    public subscribe(callback: () => void): void {
        this.subscribers.push(callback);
    }

    public unsubscribe(callback: () => void): void {
        this.subscribers = this.subscribers.filter(sub => sub !== callback);
    }

    private notifySubscribers(): void {
        this.subscribers.forEach(callback => callback());
    }
}