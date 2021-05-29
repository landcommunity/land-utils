import { Message, Role } from "discord.js";
import { CommandData } from "../../types";

export default class Command {
    public aliases = ["e-ping", "a-ping"];

    public async reply(data: CommandData, msg: Message) {

        // Attempt to fetch the user from Land guild
        const member = await data.land.members.fetch(msg.author);

        if (!member) return `You're not in the Land server. How did you even message me? Join Land at discord.gg/${process.env.LAND_INVITE_CODE}`;

        /* Assign the correct role ID depending on the command alias */
        let roleId: string;
        if(data.name === "e-ping") roleId = process.env.LAND_EVENTS_PING_ROLE as string;
        else roleId = process.env.LAND_ANNOUNCEMENTS_PING_ROLE as string;

        // To simplify later code for readability
        const role = await data.land.roles.fetch(roleId);

        // Member has events role, remove it from them
        if (member.roles.cache.get(roleId)) {
            // A Role is RoleResolvable
            member.roles.remove(role as Role);
            return `Removed \`${role?.name}\`, return to <#757210610445451346>.`;
        }
        // Member does not have events role, add it to them
        else {
            // A Role is RoleResolvable
            member.roles.add(role as Role);
            return `Added \`${role?.name}\`, return to <#757210610445451346>.`;
        }
    }
}
