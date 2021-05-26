import Discord, { CategoryChannel, GuildMember } from "discord.js";
import CommandLoader from "./utils/CommandLoader";
import UpdateMainCategory from "./utils/UpdateMainCategory";
import discordButtons from "discord-buttons";
import INTERACTION_CREATE_TYPE from "discord-buttons/typings/Classes/INTERACTION_CREATE";
// @ts-ignore
import INTERACTION_CREATE from "discord-buttons/src/Classes/INTERACTION_CREATE";

const client = new Discord.Client();
const buttons = discordButtons(client);

client.on("ready", async () => {
  const land = client.guilds.cache.get(process.env.LAND_ID as string);
  if (!land)
    return console.error(
      `Failed to fetch Land from id (${process.env.LAND_ID})`
    );

  const mainCategory = land.channels.cache.get(
    process.env.LAND_MAIN_CATEGORY_ID as string
  ) as CategoryChannel;
  if (!mainCategory)
    return console.error(
      `Failed to fetch main category from id (${process.env.LAND_MAIN_CATEGORY_ID})`
    );

  UpdateMainCategory(mainCategory);

  const commands = [...CommandLoader("admin")];

  client.on("message", (msg) => {
    if (msg.author.bot) return;
    const args = msg.content.split(" ");
    const name = args[0].substr(process.env.PREFIX?.length || 1);

    if (process.env.PREFIX && msg.content.startsWith(process.env.PREFIX)) {
      // @ts-ignore
      const commandSearch = commands.filter(
        (c) => c.level !== "dm" && c.aliases.includes(name)
      );
      args.shift();

      if (commandSearch.length > 0)
        commandSearch[0].executor(msg, {
          args,
          name,
        });
    } else if (msg.channel.type === "dm") {
      const commandSearch = commands.filter(
        (c) => c.level === "dm" && c.aliases.includes(name)
      );
    }
  });

  client.on("guildMemberAdd", (m) => {
    UpdateMainCategory(mainCategory);

    // Add events ping role to new members.
    m.roles.add(process.env.LAND_EVENTS_PING_ROLE as string);
  });

  client.on("guildMemberRemove", () => UpdateMainCategory(mainCategory));

  // @ts-ignore
  client.ws.on("INTERACTION_CREATE", (d) => {
    if (d.type !== 3) return;
    if (!d.message.components) return;
    const validId = !!d.message.components.find(
      // @ts-ignore
      (c) =>
        c.type == 1 &&
        // @ts-ignore
        c.components.find((b) => b.custom_id == d.data.custom_id)
    );
    if (!validId) return;
    const button: INTERACTION_CREATE_TYPE = new INTERACTION_CREATE(client, d);
    if (button.message.author.id != client.user?.id) return;
    // @ts-ignore
    const member: GuildMember = button.clicker.member;
    const args = button.id.split(/ +/g);
    switch (args.shift()) {
      case "giverole":
        member.roles.add(args[0]);
        const role = button.guild.roles.cache.get(args[0]);
        button.reply.send("Given role " + (role ? role?.name : args[0]), {
          flags: 64,
        });
        break;
      default:
        button.defer(true);
    }
  });
});

client.login(process.env.DISCORD_TOKEN).then((e) => {
  console.log("Logged in");
});
