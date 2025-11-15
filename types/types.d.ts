import type {
	AutocompleteInteraction,
	ButtonInteraction,
	ChatInputCommandInteraction,
	CommandInteraction,
	Interaction,
	Message,
	OmitPartialGroupDMChannel,
	User,
} from 'discord.js'

export {}

declare global {
	type GuildConfig = {
		id: string
		goldRole: string
		gambleRole: string
		dropRole: string
		minesweeper: {
			nightTime: {
				start: number
				end: number
			}
		}
		dropgame: {
			interval: number
			chance: number
		}
		ai: {
			ignoreChannels: string[]
			initiateChance: number
			answerChance: number
			initiateChannels: string[]
		}
	}

	type Modules = 'GuessrGame' | 'Hangman' | 'DropGame' | 'Battleships' | 'Picross' | 'Minesweeper' | 'Tenor'

	type ModuleType<T> = T extends 'GuessrGame'
		? import('../modules/GuessrGame.js').default
		: T extends 'Hangman'
		? import('../modules/Hangman.js').default
		: T extends 'Battleships'
		? import('../modules/Battleships.js').default
		: T extends 'Picross'
		? import('../modules/Picross.js').default
		: T extends 'Minesweeper'
		? import('../modules/Minesweeper.js').default
		: T extends 'Tenor'
		? import('../modules/Tenor.js').default
		: never

	type CommandParams = {
		interaction: ChatInputCommandInteraction
		getModule: <T extends Modules>(moduleName: T) => ModuleType<T>
	}
	type AutocompleteParams = Omit<CommandParams, 'interaction'> & {
		interaction: AutocompleteInteraction
		value: string
	}
	type ButtonParams = Omit<CommandParams, 'interaction'> & {
		interaction: ButtonInteraction
	}

	type MessageParams = {
		message: OmitPartialGroupDMChannel<Message<boolean>>
		getModule: <T extends Modules>(moduleName: T) => ModuleType<T>
	}
}
