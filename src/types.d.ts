export interface Command {
    executor: (msg: Message, CommandData) => void
    aliases: string[]
    level: string
}

export interface CommandData {
    args: string[]
    name: string
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