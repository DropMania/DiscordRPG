export type Card = {
	value: number
	display: string
	suit: string
}
const Cards = {
	'2': { value: 2, display: '2' },
	'3': { value: 3, display: '3' },
	'4': { value: 4, display: '4' },
	'5': { value: 5, display: '5' },
	'6': { value: 6, display: '6' },
	'7': { value: 7, display: '7' },
	'8': { value: 8, display: '8' },
	'9': { value: 9, display: '9' },
	'10': { value: 10, display: '10' },
	J: { value: 10, display: 'J' },
	Q: { value: 10, display: 'Q' },
	K: { value: 10, display: 'K' },
	A: { value: 11, display: 'A' },
}
const Suits = ['♠', '♥', '♦', '♣']

const CardDeck: Card[] = []
for (const suit of Suits) {
	for (const card in Cards) {
		CardDeck.push({ ...Cards[card], suit })
	}
}

const shuffle = (array: Card[]) => {
	array.sort(() => Math.random() - 0.5)
	return array
}
const getCardDeck = () => {
	return shuffle(CardDeck)
}

export default getCardDeck
