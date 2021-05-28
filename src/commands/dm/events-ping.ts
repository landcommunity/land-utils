import { Message, Role } from "discord.js";
import { CommandData } from "../../types";

export default class Command {
    public aliases = ["e-ping"];

    public async executor(msg: Message, data: CommandData) {
        // Confirm the user is in Land guild
        // Fetch the Land guild
        const land = await msg.client.guilds.fetch(
            process.env.LAND_ID as string
        );
        // Attempt to fetch the user from Land guild
        const member = await land.members.fetch(msg.author);

        if (!member) {
            msg.channel.send(
                `You're not in the Land server. How did you even message me? Join Land at ${process.env.LAND_INVITE_LINK}`
            );
        }

        // To simplify later code for readability
        const eventPingRoleId = process.env.LAND_EVENTS_PING_ROLE as string;
        const eventPingRole = await land.roles.fetch(eventPingRoleId);

        // Member has events role, remove it from them
        if (member.roles.cache.get(eventPingRoleId)) {
            // A Role is RoleResolvable
            member.roles.remove(eventPingRole as Role);
            msg.channel.send("Removed events role from you in Land.");
        }
        // Member does not have events role, add it to them
        else {
            // A Role is RoleResolvable
            member.roles.add(eventPingRole as Role);
            msg.channel.send("Added events role to you in Land");
        }
    }
}
