import { GuildMember, PartialGuildMember } from "discord.js";

export default async (
  oldmember: GuildMember | PartialGuildMember,
  member: GuildMember
) => {
  if (member.roles.cache.size && !oldmember.roles.cache.size) {
    // Add events ping role to new members.
    member.roles.add([
      process.env.LAND_ANNOUNCEMENTS_PING_ROLE as string,
      process.env.LAND_EVENTS_PING_ROLE as string,
    ]);
  }
};
