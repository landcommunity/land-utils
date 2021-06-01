import Discord, { CategoryChannel, TextChannel } from "discord.js";
import CommandLoader from "./utils/CommandLoader";
import UpdateMainCategory from "./utils/UpdateMainCategory";
// @ts-ignore
import { AppCommands } from "./types";
import Message from "./events/Message";
import MemberAdd from "./events/MemberAdd";
import MemberUpdate from "./events/MemberUpdate";
import VoiceConnect from "./events/VoiceConnect";
import { MessageButton } from "discord-buttons";

const client = new Discord.Client();
const CommandCooldowns = new Map();

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

  const commands = [
    ...CommandLoader("admin"),
    ...CommandLoader("dm"),
    ...CommandLoader("chat"),
  ];

  client.on("message", async (msg) => Message(msg, commands, land));
  client.on("guildMemberAdd", async (member) =>
    MemberAdd(member, mainCategory)
  );
  client.on("guildMemberRemove", () => UpdateMainCategory(mainCategory));
  client.on("voiceStateUpdate", VoiceConnect);

  client.on("guildMemberUpdate", (oldmember, member) =>
    MemberUpdate(oldmember, member)
  );

  // @ts-ignore
  client.ws.on("INTERACTION_CREATE", async (d) => {
    if (d.type == 3) {
      const id = d.data.custom_id.substr(0, d.data.custom_id.indexOf("_"));
      const cmd = commands.find((c) => c.cmd_id === id);
      if (cmd && cmd.interaction) cmd.interaction(client, d);
    }

    // /* Button interaction */
    // if (d.type == 3) {
    // 	if (!d.message.components) return;
    // 	const validId = !!d.message.components.find(
    // 		// @ts-ignore
    // 		(c) =>
    // 			c.type == 1 &&
    // 			// @ts-ignore
    // 			c.components.find((b) => b.custom_id == d.data.custom_id)
    // 	);
    // 	if (!validId) return;
    // 	const button: INTERACTION_CREATE_TYPE = new INTERACTION_CREATE(
    // 		client,
    // 		d
    // 	);
    // 	if (button.message.author.id != client.user?.id) return;
    // 	// @ts-ignore
    // 	const member: GuildMember = button.clicker.member;
    // 	const args = button.id.split(/ +/g);

    // 	switch (args.shift()) {
    // 		case "giverole":
    // 			const isUnique = Boolean(args[1]);
    // 			const id = args[2];
    // 			let removedRole = null;

    // 			if (isUnique) {
    // 				const template =
    // 					require(`./data/reaction-roles/${id}.json`) as RoleTemplate;
    // 				for (const r of template.roles) {
    // 					if (
    // 						member.roles.cache.has(r.role) &&
    // 						r.role != args[0]
    // 					) {
    // 						member.roles.remove(r.role);
    // 						removedRole = r.role;
    // 					}
    // 				}
    // 			}

    // 			member.roles.add(args[0]);

    // 			button.reply.send(
    // 				`Gave you <@&${args[0]}> role${removedRole ? `, removed <@&${removedRole}> role` : ""
    // 				}. :ok_hand:`,
    // 				{
    // 					flags: 64,
    // 				}
    // 			);
    // 			break;
    // 		case "clearrole":
    // 			const template =
    // 				require(`./reaction-roles/${args[0]}.json`) as RoleTemplate;
    // 			let i = 0;
    // 			for (const r of template.roles) {
    // 				if (member.roles.cache.has(r.role)) {
    // 					member.roles.remove(r.role);
    // 					i++;
    // 				}
    // 			}

    // 			button.reply.send(
    // 				`Cleared ${i} role${i == 1 ? "" : "s"} for you.`,
    // 				{
    // 					flags: 64,
    // 				}
    // 			);
    // 			break;
    // 		case "selectrespond":
    // 			button.reply.send(
    // 				`Selected options: ${d.data.values.join(", ")}`,
    // 				{
    // 					flags: 64,
    // 				}
    // 			);
    // 			break;
    // 		default:
    // 			button.defer(true);
    // 	}
    // 	/* Slash commands */

    if (d.type == 2) {
      const member = land.members.cache.get(d.member.user.id);
      const channel = land.channels.cache.get(d.channel_id) as TextChannel;

      if (!member || !channel) return;

      const name = d.data.name;
      const options = d.data.options;
      const cmd = commands.filter((c) => c.aliases.includes(name))[0];

      let content =
        (await cmd.reply({
          member,
          name,
          args:
            cmd.options
              ?.map((o) =>
                options ? options.find((of: any) => of.name === o.name) : null
              )
              .map((c) => (c ? c.value : "")) || [],
          channel,
          land,
        })) || "An unexpected error occured ... please report to a developer.";

      let flags = null;
      let buttons = cmd.buttons as MessageButton[] | null;

      /* if command is premium and user is not boosting */
      if (cmd.premium && !member.premiumSince) {
        (content =
          "This command requires premium, please consider boosting the server. :relaxed:"),
          (buttons = null);
        flags = 64;
      }

      // Command has a ratelimit
      if (cmd.cooldown) {
        const rl = CommandCooldowns.get(`${member.id}-${name}`) as {
          date: Date;
          cooldown: number;
        };

        /* Is already being ratelimited */
        if (rl) {
          // @ts-ignore
          content = `You can run this command again in ${
            // @ts-ignore
            rl.cooldown - new Date(new Date() - rl.date).getSeconds()
          } seconds.`;
          buttons = null;
          flags = 64;
        } else {
          CommandCooldowns.set(`${member.id}-${name}`, {
            date: new Date(),
            cooldown: cmd.cooldown,
          });

          setTimeout(() => {
            CommandCooldowns.delete(`${member.id}-${name}`);
          }, 1000 * cmd.cooldown);
        }
      }

      // @ts-ignore
      client.api.interactions(d.id, d.token).callback.post({
        data: {
          type: 4,
          data: {
            content,
            flags,
            components: buttons
              ? [
                  {
                    type: 1,
                    components: buttons,
                  },
                ]
              : null,
          },
        },
      });
    }
  });

  /* Discord slash commands */
  // @ts-ignore
  const app = client.api.applications(client.user.id).guilds(land.id);
  const scmd = app.commands as AppCommands;
  const slashCommands = await scmd.get();

  for (const sCmd of slashCommands) {
    const cmd = commands.find((c) => c.aliases.includes(sCmd.name));
    if (!cmd || cmd?.level !== "chat") {
      /* @ts-ignore | Delete command */
      await client.api
        //   @ts-ignore
        .applications(client.user.id)
        .guilds(land.id)
        .commands(sCmd.id)
        .delete();
    }
  }

  for (const cmd of commands.filter(
    (c) => !["dm", "admin"].includes(c.level)
  )) {
    for (const alias of cmd.aliases) {
      await scmd.post({
        data: {
          name: alias,
          description:
            `${cmd.premium ? "[Premium] " : ""}${cmd.description}` ||
            "No description",
          options: cmd.options,
        },
      });
    }
  }

  console.log("Completed slash commands mumbo jumbo");
});

client.login(process.env.DISCORD_TOKEN).then((e) => {
  console.log("Logged in");
});
