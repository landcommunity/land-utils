import { CategoryChannel } from "discord.js";

export default (category: CategoryChannel) => {
    if(category.type !== "category") return console.error("Channel provided is not of type category");
    
    const members = category.guild.members.cache.filter(m => !m.user.bot);

    category.setName(`𝑪𝑯𝑨𝑻 ┇ ${members ? members.size : category.guild.memberCount} members`);

}