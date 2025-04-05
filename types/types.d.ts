import type {
	AutocompleteInteraction,
	ButtonInteraction,
	CommandInteraction,
	Message,
	OmitPartialGroupDMChannel,
	User,
} from 'discord.js'
import Player from '../rpg/Player.js'
import { ItemNames } from '../enums.js'

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
	}
	type AchievementProgress = {
		id: string
		progress: number
		unlocked: boolean
		unlockDate: number
	}
	type PlayerConfig = {
		userId: string
		health: number
		maxHealth: number
		attack: number
		defense: number
		level: number
		experience: number
		gold: number
		items: ItemNames[]
		achievements: AchievementProgress[]
	}

	type Modules =
		| 'GuessrGame'
		| 'Hangman'
		| 'DropGame'
		| 'Battleships'
		| 'Picross'
		| 'Minesweeper'
		| 'Shop'
		| 'SlotMachine'
		| 'Blackjack'

	type ModuleType<T> = T extends 'GuessrGame'
		? import('../modules/GuessrGame.js').default
		: T extends 'Hangman'
		? import('../modules/Hangman.js').default
		: T extends 'DropGame'
		? import('../modules/DropGame.js').default
		: T extends 'Battleships'
		? import('../modules/Battleships.js').default
		: T extends 'Picross'
		? import('../modules/Picross.js').default
		: T extends 'Minesweeper'
		? import('../modules/Minesweeper.js').default
		: T extends 'Shop'
		? import('../modules/Shop.js').default
		: T extends 'SlotMachine'
		? import('../modules/SlotMachine.js').default
		: T extends 'Blackjack'
		? import('../modules/Blackjack.js').default
		: never

	type CommandParams = {
		interaction: CommandInteraction
		getModule: <T extends Modules>(moduleName: T) => ModuleType<T>
		player?: Player
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
		player?: Player
	}
}
