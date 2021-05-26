import { Message } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { Command } from '../types'

export default (level: string) => {
    const data: Command[] = [];

    const commands = fs.readdirSync(path.join(__dirname, `../commands/${level}`));
    
    for(const cmd of commands) {
        const c = new (require(path.join(__dirname, `../commands/${level}/${cmd}`)).default) as Command;
        
        if(!c.level) c.level = level;
        
        data.push(c);
    }

    return data;
}