import * as rpg from './commands/rpg'
import * as guessrGame from './commands/guessrGame'
import * as simpleGames from './commands/simpleGames'
import * as shop from './commands/shop'
import * as casino from './commands/casino'
import { Command, GuessrDifficulty, GuessrType } from './enums'
import { SlashCommandBuilder } from 'discord.js'

type CommandHandler = {
	handler: (params: CommandParams) => void
	description: string
	options?: (builder: SlashCommandBuilder) => void
	automcomplete?: (params: AutocompleteParams) => Promise<{ name: string; value: string }[]>
}

const commands: Record<string, CommandHandler> = {
	[Command.ADD_ME]: {
		description: 'Fügt dich als Spieler hinzu',
		handler: rpg.addPlayer,
	},
	[Command.SHOW_STATS]: {
		description: 'Zeigt deine Statistiken',
		handler: rpg.showStats,
	},
	[Command.SHOW_ITEMS]: {
		description: 'Zeigt deine Items',
		handler: rpg.showItems,
	},
	[Command.USE_ITEM]: {
		description: 'Benutzt ein Item',
		handler: rpg.useItem,
		options: (builder) =>
			builder.addIntegerOption((o) =>
				o
					.setName('benutze')
					.setDescription('Das zu benutzende Item (siehe Nummer mit /show-items')
					.setRequired(true)
			),
	},
	[Command.SHOP]: {
		description: 'Zeigt den Shop',
		handler: shop.showShop,
	},

	[Command.GUESSR_PICK]: {
		description: 'Startet ein neues GuessrGame',
		handler: guessrGame.pickItem,
		options: (builder) =>
			builder
				.addStringOption((o) =>
					o
						.setChoices(Object.values(GuessrType).map((type) => ({ name: type, value: type })))
						.setName('typ')
						.setDescription('Der Typ des Spiels')
						.setRequired(true)
				)
				.addStringOption((o) =>
					o
						.setChoices(
							{ name: 'sehr leicht', value: GuessrDifficulty.VERY_EASY },
							{ name: 'leicht', value: GuessrDifficulty.EASY },
							{ name: 'mittel', value: GuessrDifficulty.MEDIUM },
							{ name: 'schwer', value: GuessrDifficulty.HARD },
							{ name: 'sehr schwer', value: GuessrDifficulty.VERY_HARD },
							{ name: 'unmöglich', value: GuessrDifficulty.IMPOSSIBLE },
							{ name: 'Terminsendung💀', value: GuessrDifficulty.TERMINSENDUNG }
						)
						.setName('difficulty')
						.setDescription('Schwierigkeitsgrad')
						.setRequired(false)
				)
				.addStringOption((o) =>
					o.setName('filter').setDescription('Filter').setRequired(false).setAutocomplete(true)
				),
		automcomplete: guessrGame.autocompleteFilter,
	},
	[Command.GUESSR_NEW_IMAGE]: {
		description: 'Zeigt ein neues Bild',
		handler: guessrGame.newImage,
	},
	[Command.GUESSR_GUESS]: {
		description: 'Rate das gesuchte Item',
		handler: guessrGame.guessItem,
		options: (builder) =>
			builder.addStringOption((o) => o.setName('guess').setDescription('Dein Guess').setRequired(true)),
	},
	[Command.GUESSR_GIVE_UP]: {
		description: 'Gibt auf',
		handler: guessrGame.showItem,
	},
	[Command.GUESSR_HINT]: {
		description: 'Zeigt einen Hinweis',
		handler: guessrGame.newHint,
	},

	[Command.GAME_HANGMAN]: {
		description: 'Startet ein neues Hangman Spiel',
		handler: simpleGames.hangman,
	},
	[Command.GAME_BATTLESHIP]: {
		description: 'Startet ein neues Battleship Spiel',
		handler: simpleGames.battleships,
	},
	[Command.GAME_PICROSS]: {
		description: 'Startet ein neues Picross Spiel',
		options: (builder) =>
			builder.addIntegerOption((o) => o.setName('dim').setDescription('Dimension').setRequired(true)),
		handler: simpleGames.picross,
	},
	[Command.GAME_MINESWEEPER]: {
		description: 'Startet ein neues Minesweeper Spiel',
		options: (builder) =>
			builder.addStringOption((o) =>
				o
					.setName('difficulty')
					.setDescription('Schwierigkeit')
					.setRequired(false)
					.addChoices(
						{ name: 'leicht', value: 'easy' },
						{ name: 'mittel', value: 'medium' },
						{ name: 'schwer', value: 'hard' },
						{ name: 'unmöglich', value: 'insane' }
					)
			),
		handler: simpleGames.minesweeper,
	},
	[Command.CASINO_SLOTMACHINE]: {
		description: 'Startet ein neues Slot Machine Spiel',
		options: (builder) =>
			builder.addIntegerOption((o) => o.setName('bet').setDescription('Einsatz').setRequired(true)),
		handler: casino.slotMachine,
	},
	[Command.CASINO_BLACKJACK]: {
		description: 'Startet ein neues Blackjack Spiel',
		handler: casino.blackjack,
	},
}

export default commands
