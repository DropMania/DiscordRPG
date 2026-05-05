import * as movieNight from './commands/movieNight.js'
import * as rpg from './commands/rpg.js'
import * as guessrGame from './commands/guessrGame.js'
import * as simpleGames from './commands/simpleGames.js'
import * as shop from './commands/shop.js'
import * as casino from './commands/casino.js'
import * as admin from './commands/admin.js'
import * as ai from './commands/ai.js'
import { Command, GuessrDifficulty, GuessrType } from './enums.js'
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
						.setRequired(false),
				),
	},
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
					.setRequired(true),
			),
	},
	[Command.SHOP]: {
		description: 'Zeigt den Shop',
		handler: shop.showShop,
	},
	[Command.SHOW_ACHIEVEMENTS]: {
		description: 'Zeigt deine Erfolge',
		handler: rpg.showAchievements,
	},
	[Command.GIVE_MONEY]: {
		description: 'Gibt Geld an einen anderen Spieler',
		handler: rpg.giveMoney,
		options: (builder) =>
			builder
				.addUserOption((o) =>
					o.setName('user').setDescription('Der Spieler, dem du Geld geben willst').setRequired(true),
				)
				.addIntegerOption((o) =>
					o.setName('amount').setDescription('Die Menge an Geld, die du geben willst').setRequired(true),
				),
	},

	[Command.GUESSR_PICK]: {
		description: 'Startet ein neues GuessrGame',
		handler: guessrGame.pickItem,
		options: (builder) =>
			builder
				.addStringOption((o) =>
					o
						.setChoices(
							...Object.values(GuessrType).map((type) => ({
								name: type as string,
								value: type as string,
							})),
						)
						.setName('typ')
						.setDescription('Der Typ des Spiels')
						.setRequired(true),
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
							{ name: 'Terminsendung💀', value: GuessrDifficulty.TERMINSENDUNG },
						)
						.setName('difficulty')
						.setDescription('Schwierigkeitsgrad')
						.setRequired(false),
				)
				.addStringOption((o) =>
					o.setName('filter').setDescription('Filter').setRequired(false).setAutocomplete(true),
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
						{ name: 'unmöglich', value: 'insane' },
					),
			),
		handler: simpleGames.minesweeper,
	},
	[Command.GAME_2048]: {
		description: 'Startet ein neues 2048 Spiel',
		handler: simpleGames.game2048,
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
	[Command.AI_CREATE_IMAGE]: {
		description: 'Erstellt ein Bild mit AI',
		handler: ai.createImage,
		options: (builder) =>
			builder.addStringOption((o) =>
				o.setName('prompt').setDescription('Die Beschreibung des Bildes').setRequired(true),
			),
	},
	[Command.AI_CHANGE_IMAGE]: {
		description: 'Ändert ein Bild mit AI',
		handler: ai.changeImage,
		options: (builder) =>
			builder
				.addAttachmentOption((o) =>
					o.setName('image').setDescription('Das Bild, das du ändern willst').setRequired(true),
				)
				.addStringOption((o) =>
					o.setName('prompt').setDescription('Die Beschreibung der Änderung').setRequired(true),
				),
		permission: PermissionFlagsBits.ManageGuild,
		automcomplete: async () => [],
	},
	[Command.MOVIE_NIGHT_ADD]: {
		description: 'Fügt einen Film zur Movie Night Liste hinzu',
		handler: movieNight.addMovie,
		options: (builder) =>
			builder.addStringOption((o) => o.setName('title').setDescription('Der Titel des Films').setRequired(true)),
	},
	[Command.MOVIE_NIGHT_LIST]: {
		description: 'Zeigt die Movie Night Liste',
		handler: movieNight.listMovies,
	},
	[Command.MOVIE_NIGHT_PICK]: {
		description: 'Wählt einen zufälligen Film aus der Movie Night Liste',
		permission: PermissionFlagsBits.ManageGuild,
		handler: movieNight.pickMovie,
	},
}

export default commands
