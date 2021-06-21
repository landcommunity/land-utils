import { MessageButton } from "discord-buttons";
import { Client, DMChannel, GuildMember, Message, TextChannel } from "discord.js";

export interface Command {
    reply: (CommandData: CommandData, msg?: Message) => string
    interaction?: (client: Client, data: Interaction) => void;
    aliases: string[]
    level: string
    description?: string
    premium?: boolean
    cooldown?: number
    buttons?: MessageButton[]
    cmd_id?: string;
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
    channel: TextChannel | DMChannel
    land: Guild
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
    post: (params: { data: { name: string, description: string, options?: any } }) => void;
    commands: (id: string) => {
        delete: () => void;
    }
}

export interface Interaction {
    version: number;
    type: number;
    token: string;
    message: Message;
    member: GuildMember;
    id: string;
    guild_id: string;
    data: { custom_id: string; component_type: number }
    channel_id: string;
    application_id: string;
}

// Open Trivia Database
export interface TriviaResponse {
    response_code: number;
    results: TriviaQuestion[]
}

export interface TriviaQuestion {
    category: string;
    type: string;
    difficulty: string;
    question: string;
    correct_answer: string;
    incorrect_answers: string[]
    participants?: any;
}