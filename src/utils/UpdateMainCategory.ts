import { CategoryChannel } from "discord.js";

export default (category: CategoryChannel) => {
    if(category.type !== "category") return console.error("Channel provided is not of type category");
    
    const bots = category.guild.members.cache.filter(m => m.user.bot).size;

    category.setName(`𝑪𝑯𝑨𝑻 ┇ ${category.guild.memberCount - bots} members`);

}