import Discord, { Message, MessageAttachment, MessageEmbed } from "discord.js";
import { CommandData, RoleTemplate } from "../../types";
import Jimp from 'jimp';
import JoinBanner from "../../utils/JoinBanner";

export default class Command {
    public aliases = ["jmdebug"];

    public async reply(data: CommandData, msg: Message) {

        const banner = await JoinBanner(msg.author);

        if (banner) msg.channel.send(banner);
        else msg.channel.send("Error");

    }

}
