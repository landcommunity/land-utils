import { MessageButton } from 'discord-buttons';
import fetch from 'node-fetch';
import { CommandData, Interaction, TriviaQuestion, TriviaResponse } from '../../types';
import { SlashReplyType } from '../../utils/SlashReplyType';
import { unescape } from 'html-escaper'
import { Client, TextChannel } from 'discord.js';
import DiscordPostMessage from '../../utils/DiscordPostMessage';
import NameFormatter from '../../utils/NameFormatter';
import btoa from 'btoa';

export default class Command {

    public premium = true;
    public aliases = ["trivia"];
    public cmd_id = "trivia";
    public description = "Ask a random trivia question & see who gets it right!";
    public cooldown = 30;
    public buttons: MessageButton[] = [];
    public Active = new Map();
    public options = [
        {
            name: "difficulty",
            description: "Pick a user to perform this action on.",
            required: false,
            type: SlashReplyType.STRING,
            choices: [
                {
                    "name": "Easy",
                    "value": "easy"
                },
                {
                    "name": "Medium",
                    "value": "medium"
                },
                {
                    "name": "Hard",
                    "value": "hard"
                },
            ]
        }
    ]

    private shuffleArray(arr: any[]) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    public async interaction(client: Client, d: Interaction) {
        let t = this.Active.get(btoa(d.message.content || "")) as TriviaQuestion;
        if(t && Object.keys(t.participants).includes(d.member.user.id)) return DiscordPostMessage(client, d, `You already got it ${t.participants[d.member.user.id] ? "right" : "wrong"}! The correct answer was "${t.correct_answer}"`, true);

        const member = client.guilds.cache.get(d.guild_id)?.members.cache.get(d.member.user.id);

        // Member was correct
        if (t && d.data.custom_id === "trivia_correct") {

            DiscordPostMessage(client, d, `:white_check_mark: **${NameFormatter(member || d.member)}** got it right!`);

            // @ts-ignore
            t.participants[d.member.user.id] = true;
            this.Active.set(btoa(d.message.content || ""), t);
        }

        // Member was incorrect 
        else if (t && d.data.custom_id === "trivia_incorrect") {
            DiscordPostMessage(client, d, `:x: **${NameFormatter(member || d.member)}** got it wrong!`);

            // @ts-ignore
            t.participants[d.member.user.id] = false;
            this.Active.set(btoa(d.message.content || ""), t);
        }

        // Trivia expired
        else {
            DiscordPostMessage(client, d, "This trivia question has expired ...", true);
            const guild = client.guilds.cache.get(d.guild_id);
            if (!guild) return;
            const channel = guild.channels.cache.get(d.channel_id) as TextChannel;
            if (!channel) return;
            const msg = await channel.messages.fetch(d.message.id);
            if (msg) msg.delete()
        }

    }

    public async reply(data: CommandData) {

        const res = await (await fetch(`https://opentdb.com/api.php?amount=1&difficulty=${data.args[0] || ""}`)).json() as TriviaResponse;
        this.Active.delete(data.member?.user.id);

        if (res.response_code == 0) {
            const t = res.results[0];
            const answers = [t.correct_answer, ...t.incorrect_answers.splice(0, 4)];
            this.shuffleArray(answers);

            this.buttons = [];

            for (const a of answers) {
                const b = new MessageButton()
                    .setLabel(unescape(a))
                    .setID(a === t.correct_answer ? "trivia_correct" : "trivia_incorrect")
                    .setStyle("gray")

                this.buttons.push(b);
            }

            const content = `**Trivia:** ${unescape(t.question)}`;
            this.Active.set(btoa(content || ""), { ...t, participants: {} });

            return content;
        }
    }

}