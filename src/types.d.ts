import { DMChannel, GuildMember, Message, TextChannel } from "discord.js";

export interface Command {
    reply: (CommandData: CommandData, msg?: Message) => string
    aliases: string[]
    level: string
    description?: string
    options?: {
        name: string,
        description: string,
        type: number,
        required: boolean
    }[]
}

export interface CommandData {
    args: string[]
    name: string
    member?: GuildMember
    channel: TextChannel|DMChannel 
}

export interface RoleDescriptor {
    color: string,
    role: string,
    label: string
}

export interface RoleTemplate {
    name: string,
    description: string,
    _id?: string,
    unique: boolean,
    roles: RoleDescriptor[]
}

// Discord API stuff
export interface AppCommands {
    get: () => any[];
    post: (params: { data: { name: string, description: string, options?: any} }) => void;
}