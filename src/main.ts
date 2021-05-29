import Discord, { CategoryChannel, DMChannel, GuildMember, TextChannel } from "discord.js";
import CommandLoader from "./utils/CommandLoader";
import UpdateMainCategory from "./utils/UpdateMainCategory";
import INTERACTION_CREATE_TYPE from "discord-buttons/typings/Classes/INTERACTION_CREATE";
// @ts-ignore
import INTERACTION_CREATE from "discord-buttons/src/Classes/INTERACTION_CREATE";
import { AppCommands, RoleTemplate } from "./types";

const client = new Discord.Client();
const CommandRateLimit = new Map();

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
		...CommandLoader("chat")
	];

	/* Discord slash commands */
	// @ts-ignore
	const app = client.api.applications(client.user.id).guilds(land.id);
	const scmd = app.commands as AppCommands;
	const slashCommands = await scmd.get();

	for (const sCmd of slashCommands) {
		const cmd = commands.find(c => c.aliases.includes(sCmd.name));
		if (!cmd || cmd?.level !== "chat") {
			/* @ts-ignore | Delete command */
			await client.api.applications(client.user.id).guilds(land.id).commands(sCmd.id).delete();
		}
	}

	for (const cmd of commands.filter(c => c.level !== "dm")) {
		for (const alias of cmd.aliases) {
			await scmd.post({
				data: {
					name: alias,
					description: cmd.description || "No description",
					options: cmd.options
				}
			});
		}
	}

	client.on("message", (msg) => {
		if (msg.author.bot || !msg.member) return;
		const args = msg.content.split(" ");

		let name = args[0].substr(process.env.PREFIX?.length || 1);

		if (process.env.PREFIX && msg.content.startsWith(process.env.PREFIX)) {
			// @ts-ignore
			const commandSearch = commands.filter(
				(c) => c.level === "admin" && c.aliases.includes(name)
			);
			args.shift();

			if (commandSearch.length > 0) {

				const command = commandSearch[0];

				if (
					command.level === "admin" && msg.member &&
					!(msg.member.roles.cache.has(process.env.LAND_ADMIN_ROLE as string) ||
						msg.member.roles.cache.has(process.env.LAND_DEVELOPER_ROLE as string))
				) return msg.react("⛔"); // Insufficient permission for admin level command.

				msg.channel.send(command.reply({
					channel: msg.channel as TextChannel,
					member: msg.member,
					args,
					name,
				}, msg));
			}

		}

		if (msg.channel.type === "dm") {
			// The default name does not work for dm commands
			// Use args[0] instead
			name = args[0];
			const commandSearch = commands.filter(
				(c) => c.level === "dm" && c.aliases.includes(name)
			);
			args.shift();

			if (commandSearch.length > 0) msg.channel.send(commandSearch[0].reply({
				channel: msg.channel as DMChannel,
				args,
				member: msg.member,
				name
			}));

		}
	});

	client.on("guildMemberAdd", (m) => {
		UpdateMainCategory(mainCategory);

		// Add events ping role to new members.
		m.roles.add(process.env.LAND_EVENTS_PING_ROLE as string);
	});

	client.on("guildMemberRemove", () => UpdateMainCategory(mainCategory));

	// @ts-ignore
	client.ws.on("INTERACTION_CREATE", async (d) => {
		/* Button interaction */
		if (d.type == 3) {
			if (!d.message.components) return;
			const validId = !!d.message.components.find(
				// @ts-ignore
				(c) =>
					c.type == 1 &&
					// @ts-ignore
					c.components.find((b) => b.custom_id == d.data.custom_id)
			);
			if (!validId) return;
			const button: INTERACTION_CREATE_TYPE = new INTERACTION_CREATE(
				client,
				d
			);
			if (button.message.author.id != client.user?.id) return;
			// @ts-ignore
			const member: GuildMember = button.clicker.member;
			const args = button.id.split(/ +/g);

			switch (args.shift()) {
				case "giverole":
					const isUnique = Boolean(args[1]);
					const id = args[2];
					let removedRole = null;

					if (isUnique) {
						const template =
							require(`./data/reaction-roles/${id}.json`) as RoleTemplate;
						for (const r of template.roles) {
							if (
								member.roles.cache.has(r.role) &&
								r.role != args[0]
							) {
								member.roles.remove(r.role);
								removedRole = r.role;
							}
						}
					}

					member.roles.add(args[0]);

					button.reply.send(
						`Gave you <@&${args[0]}> role${removedRole ? `, removed <@&${removedRole}> role` : ""
						}. :ok_hand:`,
						{
							flags: 64,
						}
					);
					break;
				case "clearrole":
					const template =
						require(`./reaction-roles/${args[0]}.json`) as RoleTemplate;
					let i = 0;
					for (const r of template.roles) {
						if (member.roles.cache.has(r.role)) {
							member.roles.remove(r.role);
							i++;
						}
					}

					button.reply.send(
						`Cleared ${i} role${i == 1 ? "" : "s"} for you.`,
						{
							flags: 64,
						}
					);
					break;
				case "selectrespond":
					button.reply.send(
						`Selected options: ${d.data.values.join(", ")}`,
						{
							flags: 64,
						}
					);
					break;
				default:
					button.defer(true);
			}
			/* Slash commands */
		} else if (d.type == 2) {
			const member = land.members.cache.get(d.member.user.id);
			const channel = land.channels.cache.get(d.channel_id) as TextChannel;

			if (!member || !channel) return;

			const name = d.data.name;
			const options = d.data.options;
			const cmd = commands.filter(c => c.aliases.includes(name))[0];

			let content = await cmd.reply({
				member,
				name,
				args: cmd.options?.map(o => options.find((of: any) => of.name === o.name)).map(c => c ? c.value : "") || [],
				channel
			}) || "An unexpected error occured ... please report to a developer.";

			let flags = null;

			/* if command is premium and user is not boosting */
			if (cmd.premium && !member.premiumSince) {
				content = "This command requires premium, please consider boosting the server. :relaxed:",
				flags = 64;
			}

			// Command has a ratelimit
			if (cmd.cooldown) {
				const rl = CommandRateLimit.get(`${member.id}-${name}`) as { date: Date, ratelimit: number };
				
				/* Is already being ratelimited */
				if(rl) {
					// @ts-ignore;
					content = `You can run this command again in ${rl.cooldown - (new Date(new Date() - rl.date).getSeconds())} seconds.`;
					flags = 64;
				} else {
					CommandRateLimit.set(`${member.id}-${name}`, {
						date: new Date(),
						cooldown: cmd.cooldown
					});

					setTimeout(() => {
						CommandRateLimit.delete(`${member.id}-${name}`);
					}, 1000 * cmd.cooldown);
				}

			}

			// @ts-ignore
			client.api.interactions(d.id, d.token).callback.post({
				data: {
					type: 4,
					data: {
						content,
						flags
					}
				}
			});

		}
	});
});

client.login(process.env.DISCORD_TOKEN).then((e) => {
	console.log("Logged in");
});
