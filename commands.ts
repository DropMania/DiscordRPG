import * as guessrGame from './commands/guessrGame'
import * as simpleGames from './commands/simpleGames'
import * as admin from './commands/admin'
import * as rpg from './commands/rpg'
import { Command, GuessrDifficulty, GuessrType } from './enums'
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'

type CommandHandler = {
	handler: (params: CommandParams) => void
	description: string
	options?: (builder: SlashCommandBuilder) => void
	permission?: bigint
	automcomplete?: (params: AutocompleteParams) => Promise<{ name: string; value: string }[]>
}

const commands: Record<string, CommandHandler> = {
	[Command.ADMIN_EMOTE]: {
		description: 'Fügt einen 7TV Emote hinzu',
		handler: admin.addEmote,
		permission: PermissionFlagsBits.ManageGuild,
		options: (builder) =>
			builder
				.addStringOption((o) => o.setName('emote').setDescription('7tv link des Emotes').setRequired(true))
				.addStringOption((o) =>
					o
						.setName('name')
						.setDescription('Der Name des Emotes, der angezeigt werden soll')
						.setRequired(false)
				),
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
	[Command.RPG_CREATE_GAME]: {
		description: 'Erstellt ein neues RPG Spiel in diesem Server',
		handler: rpg.createGame,
	},
	[Command.RPG_ADD_PLAYER]: {
		description: 'Fügt einen Spieler zum RPG Spiel hinzu',
		permission: PermissionFlagsBits.ManageGuild,
		handler: rpg.addPlayer,
	},
}

export default commands
