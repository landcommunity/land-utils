import { CategoryChannel, GuildMember } from "discord.js";
import UpdateMainCategory from "../utils/UpdateMainCategory";

export default async (member: GuildMember, mainCategory: CategoryChannel) => {
  UpdateMainCategory(mainCategory);
};
