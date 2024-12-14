import type { ButtonInteraction, CommandInteraction, Message, OmitPartialGroupDMChannel, User } from 'discord.js'
import Player from '../Player.js'

export {}

declare global {
	type PlayerConfig = {
		userId: string
		health: number
		attack: number
		defense: number
		level: number
		experience: number
		gold: number
	}

	type Modules = 'GuessrGame' | 'Hangman' | 'DropGame'

	type ModuleType<T> = T extends 'GuessrGame'
		? import('../modules/GuessrGame.js').default
		: T extends 'Hangman'
		? import('../modules/Hangman.js').default
		: T extends 'DropGame'
		? import('../modules/DropGame.js').default
		: never

	type CommandParams = {
		interaction: CommandInteraction
		getModule: <T extends Modules>(moduleName: T) => ModuleType<T>
		player?: Player
	}
	type ButtonParams = Omit<CommandParams, 'interaction'> & {
		interaction: ButtonInteraction
	}

	type MessageParams = {
		message: OmitPartialGroupDMChannel<Message<boolean>>
		getModule: <T extends Modules>(moduleName: T) => ModuleType<T>
		player?: Player
	}
}
