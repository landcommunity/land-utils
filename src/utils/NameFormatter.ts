import { GuildMember } from "discord.js"

export default (member: GuildMember) => {
    return member.nickname?.substr(member.nickname.indexOf("| ") + (member.nickname.includes("|") ? 2 : 1), member?.nickname.length) || member.user.username;
}