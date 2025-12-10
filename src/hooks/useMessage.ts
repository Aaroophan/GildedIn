// hooks/useMessages.ts
"use client"

import { AuthService } from "@/models/Services/Auth"
import { MessageService } from "@/models/Services/Messages"
import { useState, useEffect } from "react"

export function useMessage() {
    const [messageData, setMessageData] = useState({
        Status: 0,
        Message: ""
    })

    useEffect(() => {
        const messageService = MessageService.getInstance()

        setMessageData(messageService.getMessage())

        if (messageData.Message.includes('Invalid session token') || messageData.Message.includes('Session token has expired.')) {
            setTimeout(() => {
                AuthService.getInstance().logout()
            }, 2000)
        }

        const handleUpdate = () => {
            const newMessage = messageService.getMessage()
            if (newMessage.Message !== null && newMessage.Message !== undefined && newMessage.Message !== "") {
                setMessageData(newMessage)
            }
        }

        messageService.subscribe(handleUpdate)

        return () => {
            messageService.unsubscribe(handleUpdate)
        }
    }, [])

    return messageData
}