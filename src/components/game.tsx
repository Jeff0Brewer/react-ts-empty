import React, { FC, useRef, useState, useEffect } from 'react'
import type { ChatCompletionRequestMessage as Message } from 'openai'
import { postBody } from '@/lib/fetch'
import PROMPT from '@/lib/prompt'
import styles from '@/styles/Game.module.css'

const Game: FC = () => {
    const [messages, setMessages] = useState<Array<Message>>([
        { role: 'user', content: PROMPT }
    ])

    useEffect(() => {
        // get response any time user sent last message
        if (messages[messages.length - 1].role === 'user') {
            getResponse()
        }
    }, [messages])

    // get next response to current chat
    const getResponse = async (): Promise<void> => {
        const completion = await fetch('/api/chat-complete', postBody({ messages }))
        const { content } = await completion.json()
        if (!completion.ok) {
            // error if message content incomplete
            throw new Error(`Chat completion error: ${content}`)
        }
        addMessage({ role: 'assistant', content })
    }

    const addMessage = (message: Message): void => {
        setMessages([...messages, message])
    }

    return (
        <section className={styles.chat}>
            <GameOutput messages={messages} />
            <GameInput addMessage={addMessage} />
        </section>
    )
}

type GameOutputProps = {
    messages: Array<Message>
}

const GameOutput: FC<GameOutputProps> = props => {
    return (
        <div className={styles.output}>{
            props.messages.map((msg: Message, i: number) =>
                <MessageDisplay message={msg} key={i} />)
        }</div>
    )
}

type MessageDisplayProps = {
    message: Message
}

const MessageDisplay: FC<MessageDisplayProps> = props => {
    return (
        <p className={styles.msg} data-role={props.message.role}>
            {props.message.content}
        </p>
    )
}

type GameInputProps = {
    addMessage: (message: Message) => void
}

const GameInput: FC<GameInputProps> = props => {
    const inputRef = useRef<HTMLInputElement>(null)

    const sendMessage = (): void => {
        if (!inputRef.current) { return }
        props.addMessage({ role: 'user', content: inputRef.current.value })
        inputRef.current.value = ''
    }

    const keySend = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') { sendMessage() }
    }

    return (
        <div className={styles.input}>
            <input className={styles.text} ref={inputRef} type="text" onKeyDown={keySend} />
            <button className={styles.send} onClick={sendMessage}>send</button>
        </div>
    )
}

export default Game