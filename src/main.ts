import Discord, { CategoryChannel } from 'discord.js';
import CommandLoader from './utils/CommandLoader';
import UpdateMainCategory from './utils/UpdateMainCategory';

const client = new Discord.Client();

client.on("ready", async () => {
    const land = client.guilds.cache.get(process.env.LAND_ID as string);
    if(!land) return console.error(`Failed to fetch Land from id (${process.env.LAND_ID})`);

    const mainCategory = land.channels.cache.get(process.env.LAND_MAIN_CATEGORY_ID as string) as CategoryChannel;
    if(!mainCategory) return console.error(`Failed to fetch main category from id (${process.env.LAND_MAIN_CATEGORY_ID})`);

    UpdateMainCategory(mainCategory);

    const commands = [
        ...CommandLoader("admin")
    ];

    client.on("message", msg => {
        if(msg.author.bot) return;
        const args = msg.content.split(" ");
        const name = args[0].substr(process.env.PREFIX?.length || 1);

        if(process.env.PREFIX && msg.content.startsWith(process.env.PREFIX)) {
            // @ts-ignore
            const commandSearch = commands.filter(c => c.level !== "dm" && c.aliases.includes(name));
            args.shift();

            if(commandSearch.length > 0) commandSearch[0].executor(msg, {
                args,
                name
            });

        } else if(msg.channel.type === "dm") {
            const commandSearch = commands.filter(c => c.level === "dm" && c.aliases.includes(name));
        }


    });

    client.on("guildMemberAdd", m => {
        UpdateMainCategory(mainCategory);

        // Add events ping role to new members.
        m.roles.add(process.env.LAND_EVENTS_PING_ROLE as string);

    });

    client.on("guildMemberRemove", () => UpdateMainCategory(mainCategory));


});

client.login(process.env.DISCORD_TOKEN).then(e => {
    console.log("Logged in");
});