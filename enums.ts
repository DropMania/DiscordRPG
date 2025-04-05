export enum Command {
	ADD_ME = 'add-me',
	SHOW_STATS = 'show-stats',
	SHOW_ITEMS = 'show-items',
	USE_ITEM = 'use-item',
	SHOW_ACHIEVEMENTS = 'show-achievements',

	SHOP = 'shop',

	GUESSR_PICK = 'guessr-game',
	GUESSR_NEW_IMAGE = 'new-image',
	GUESSR_HINT = 'hint',
	GUESSR_GUESS = 'guess',
	GUESSR_GIVE_UP = 'give-up',

	GAME_HANGMAN = 'hangman',
	GAME_BATTLESHIP = 'battleships',
	GAME_PICROSS = 'picross',
	GAME_MINESWEEPER = 'minesweeper',

	CASINO_SLOTMACHINE = 'slot-machine',
	CASINO_BLACKJACK = 'blackjack',
}

export enum GuessrType {
	MOVIE = 'Movie',
	GAME = 'Game',
	SHOW = 'TV Show',
	SONG = 'Song',
	//GAME_SONG = 'Game Song',
	ACTOR = 'Actor',
}

export enum GuessrDifficulty {
	VERY_EASY = 'very_easy',
	EASY = 'easy',
	MEDIUM = 'medium',
	HARD = 'hard',
	VERY_HARD = 'very_hard',
	IMPOSSIBLE = 'impossible',
	TERMINSENDUNG = 'terminsendung',
}

export enum ItemNames {
	HEAL_POTION = 'Health Potion',
	STRENGTH_POTION = 'Strength Potion',
	EXP_POTION = 'EXP Potion',
	POISON_SHROOM = 'Poison Shroom',
}

export enum Drops {
	BUG = 'Bug',
	RAT = 'Rat',
	SHEEP = 'Sheep',
	DOG = 'Dog',
	CAT = 'Cat',
	WOLF = 'Wolf',
	BEAR = 'Bear',
	LIZARD = 'Lizard',
	APE = 'Ape',
	ORC = 'Ork',
	DRAGON = 'Dragon',
	GODZILLA = 'Godzilla',
	GHIDORAH = 'Ghidorah',
	SAITAMA = 'Saitama',
	JHO = 'Deviljho',

	COIN = 'Coin',

	HEAL_POTION = 'Health Potion',
	STRENGTH_POTION = 'Strength Potion',
	EXP_POTION = 'EXP Potion',

	POISON_SHROOM = 'Poison Shroom',

	PRESENT = 'Present',
}
