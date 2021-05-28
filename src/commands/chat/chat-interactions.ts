import { Message } from "discord.js";
import { CommandData } from "../../types";
import Data from '../../data/chat-interactions.json';

export default class Command {
    public aliases = Object.keys(Data);
    private action: any = null;

    private PercVariableParser(text: string, data: {
        author: string,
        reciever: string,
        emote: string
    }) {

        for(const variable of text.match(/%(\w*)%/g) || []) {
            // @ts-ignore
            const value = data[variable.replace(/%/g, "").toLowerCase()]
            text = text.replace(variable, value); 
        }

        return text;
    }

    public async executor(msg: Message, data: CommandData) {

        if(!data.args[0]) return msg.channel.send(`Usage: \`${process.env.PREFIX}${data.name} <user/nickname>\``);

        const target = msg.guild?.members.cache.filter(
            m => m.nickname?.toLowerCase().includes(data.args.join(" ").toLowerCase()) ||
            m.user.username.toLowerCase().includes(data.args.join(" ").toLowerCase())
        ).first() || msg.guild?.members.cache.get(data.args[0].substr(3, data.args[0].length-4));

        if(data.args[0] === "@everyone") return msg.channel.send(`You wish you could do that to all ${Number(msg.guild?.members.cache.filter(m => !m.user.bot).size)-1} of us don't you. :smirk:`)

        if(!target) return msg.channel.send("Looks like your friend never showed up... that sucks");
        if(target.id == msg.author.id) return msg.channel.send("I feel bad for you ...");

        // Using "hug" to bypass ts bs
        this.action = Data[data.name as "hug"];

        if(!this.action) return msg.channel.send("Unexpected error");

        msg.channel.send(
            this.PercVariableParser(
                `> ${this.action.responses[Math.floor(Math.random() * this.action.responses.length)] || "f"}`,
                {
                    author: "**" + (msg.member?.nickname?.substr(msg.member?.nickname.indexOf("| ") + (msg.member.nickname.includes("|") ? 2 : 1), msg.member?.nickname.length) || msg.author.username) + "**",
                    reciever: "**" + (target.nickname?.substr(target?.nickname.indexOf("| ") + (target.nickname.includes("|") ? 2 : 1), target.nickname.length) || target.user.username) + "**",
                    emote: this.action.emotes[Math.floor(Math.random() * this.action.emotes.length)]
                }
            )
        );

        msg.delete();
    }

}