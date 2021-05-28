import { Message, Role } from "discord.js";
import { CommandData } from "../../types";

export default class Command {
    public aliases = ["e-ping", "a-ping"];

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
                `You're not in the Land server. How did you even message me? Join Land at discord.gg/${process.env.LAND_INVITE_CODE}`
            );
        }

        /* Assign the correct role ID depending on the command alias */
        let roleId: string;
        if(data.name === "e-ping") roleId = process.env.LAND_EVENTS_PING_ROLE as string;
        else roleId = process.env.LAND_ANNOUNCEMENTS_PING_ROLE as string;

        // To simplify later code for readability
        const role = await land.roles.fetch(roleId);

        // Member has events role, remove it from them
        if (member.roles.cache.get(roleId)) {
            // A Role is RoleResolvable
            member.roles.remove(role as Role);
            msg.channel.send(`Removed \`${role?.name}\`, return to <#757210610445451346>.`);
        }
        // Member does not have events role, add it to them
        else {
            // A Role is RoleResolvable
            member.roles.add(role as Role);
            msg.channel.send(`Added \`${role?.name}\`, return to <#757210610445451346>.`);
        }
    }
}
