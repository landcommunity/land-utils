export interface Command {
    executor: (msg: Message, CommandData) => void
    aliases: string[]
    level: string
}

export interface CommandData {
    args: string[]
    name: string
}