import { CategoryChannel, GuildMember } from "discord.js";
import UpdateMainCategory from "../utils/UpdateMainCategory";

export default async (member: GuildMember, mainCategory: CategoryChannel) => {
    UpdateMainCategory(mainCategory);

    // Add events ping role to new members.
    member.roles.add(process.env.LAND_EVENTS_PING_ROLE as string);
}