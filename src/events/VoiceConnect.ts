import { CategoryChannel, GuildMember, VoiceState } from "discord.js";
import NameFormatter from "../utils/NameFormatter";

const Cache = new Map();
const Cooldown = new Map();

export default async (os: VoiceState, ns: VoiceState) => {
    if (os.channel?.id != ns.channel?.id) {
      if (ns.channel && ns.channel.id === process.env.LAND_CREATE_VC_ID) {

        const parent = ns.channel.parent as CategoryChannel;
        const member = ns.member as GuildMember;

        const cooldown = Cooldown.get(member.id);
        if(cooldown) {
            // @ts-ignore
            member.send(`Slow down! You can create a new voice channel in ${5 - new Date(new Date() - cooldown).getSeconds()} seconds.`);
            member.voice.kick("Cooldown");

            if(Cache.has(os.channel?.id)) {
                os.channel?.delete();
                Cache.delete(os.id);
            }

            return;
        }


        const vc = await ns.channel.guild.channels.create(`${NameFormatter(member)}'s channel`, {parent, type:"voice"});
        Cache.set(vc.id, member.id);
        Cooldown.set(member.id, new Date());
        setTimeout(() => Cooldown.delete(member.id), 1000*5);

        member.voice.setChannel(vc);


      } else if (os.channel && Cache.has(os.channel.id) && os.channel.members.filter(m => !m.user.bot).size <= 0) {
        Cache.delete(os.channel.id);
        os.channel.delete();
      }
    }

}

export const VoiceDisconnect = async (e: any) => {
    console.log(e);
}