import { DMChannel, Guild, GuildMember, Message, TextChannel } from "discord.js";
import { Command } from "../types";

export default async (msg: Message, commands: Command[], land: Guild) => {
    if (msg.author.bot) return;
    const args = msg.content.split(" ");

    let name = args[0].substr(process.env.PREFIX?.length || 1);

    if (process.env.PREFIX && msg.content.startsWith(process.env.PREFIX)) {
        // @ts-ignore
        const command = commands.find(
            (c) => c.level === "admin" && c.aliases.includes(name)
        );
        args.shift();

        if (command) {
            if (
                command.level === "admin" && msg.member &&
                !(msg.member.roles.cache.has(process.env.LAND_ADMIN_ROLE as string) ||
                    msg.member.roles.cache.has(process.env.LAND_DEVELOPER_ROLE as string))
            ) return msg.react("⛔"); // Insufficient permission for admin level command.

            await command.reply({
                channel: msg.channel as TextChannel,
                member: msg.member as GuildMember,
                args,
                name,
                land
            }, msg);
        }

    }

    if (msg.channel.type === "dm") {
        // The default name does not work for dm commands
        // Use args[0] instead
        name = args[0];

        const commandSearch = commands.filter(
            (c) => c.level === "dm" && c.aliases.includes(name)
        );
        args.shift();

        if (commandSearch.length > 0) msg.channel.send(await commandSearch[0].reply({
            channel: msg.channel as DMChannel,
            args,
            name,
            land
        }, msg));

    }

}