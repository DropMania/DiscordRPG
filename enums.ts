export enum Command {
	ADMIN_EMOTE = 'add-7tv-emote',

	GUESSR_PICK = 'guessr-game',
	GUESSR_NEW_IMAGE = 'new-image',
	GUESSR_HINT = 'hint',
	GUESSR_GUESS = 'guess',
	GUESSR_GIVE_UP = 'give-up',

	GAME_HANGMAN = 'hangman',
	GAME_BATTLESHIP = 'battleships',
	GAME_PICROSS = 'picross',
	GAME_MINESWEEPER = 'minesweeper',

	RPG_CREATE_GAME = 'create-rpg-game',
	RPG_ADD_PLAYER = 'add-rpg-player',
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
