import { Message, MessageEmbed, TextChannel } from "discord.js";
import { CommandData } from "../../types";

export default class Command {
    public aliases = [
        "event",
        "inform"
    ]

    detectionId = "224260367696658432";

    public async executor(msg: Message, data: CommandData) {
        if (msg.channel.type !== "text") return;
    
        let name = msg.client.user?.username as string;
        let response: string|MessageEmbed = `${data.args.includes(`<@!${this.detectionId}>`) ? `\n\n*DM \`no-ping\` to <@${msg.client.user?.id}> to disable future .*` : ""}`;
        let channel: TextChannel|null = null;

        switch (data.name) {
            case "event":
                name = "Event";
                channel = msg.client.channels.cache.get(process.env.LAND_EVENTS_CHANNEL as string) as TextChannel;

                response = new MessageEmbed()
                .setDescription(`${data.args.join(" ")}\n\n**Hosted by:** <@${msg.author.id}>`)
                .setColor("#2F3136")
                .setFooter(`DM "events-ping" to Land Utils#0014 to toggle pings.`)

                break;
            case "inform":
                name = "Information"
                break;
        }

        if(!channel || msg.guild?.me && !channel.permissionsFor(msg.client.user?.id as string)?.has("MANAGE_WEBHOOKS")) return msg.channel.send("`Missing permission or unable to find channel.`");

        const webhookLookup = (await channel.fetchWebhooks()).array().filter(w => w.name === name);
        let wh;

        if(webhookLookup.length > 0) wh = webhookLookup[0]
        else wh = await channel.createWebhook(name, {
            avatar: "https://i.imgur.com/dzGQwc1.jpg",
        });
        
        wh.send(response);
        msg.delete();
    }

}