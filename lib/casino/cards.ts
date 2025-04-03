import { loadImage, Image } from 'canvas'
type Suit = {
	name: string
	display: string
}
export type Card = {
	value: number
	name: string
	display: string
	suit: string
	suitName: string
	graphics: Image | null
}
const Cards = [
	{ value: 2, display: '2', name: '2' },
	{ value: 3, display: '3', name: '3' },
	{ value: 4, display: '4', name: '4' },
	{ value: 5, display: '5', name: '5' },
	{ value: 6, display: '6', name: '6' },
	{ value: 7, display: '7', name: '7' },
	{ value: 8, display: '8', name: '8' },
	{ value: 9, display: '9', name: '9' },
	{ value: 10, display: '10', name: '10' },
	{ value: 10, display: 'J', name: 'jack' },
	{ value: 10, display: 'Q', name: 'queen' },
	{ value: 10, display: 'K', name: 'king' },
	{ value: 11, display: 'A', name: 'ace' },
]
const Suits: Suit[] = [
	{ name: 'hearts', display: '♥' },
	{ name: 'diamonds', display: '♦' },
	{ name: 'clubs', display: '♣' },
	{ name: 'spades', display: '♠' },
]

const CardDeck: Card[] = []
for (const suit of Suits) {
	for (const card of Cards) {
		CardDeck.push({ ...card, suit: suit.display, graphics: null, suitName: suit.name })
	}
}

const shuffle = (array: Card[]) => {
	array.sort(() => Math.random() - 0.5)
	return array
}
const getCardDeck = () => {
	return shuffle(CardDeck)
}

export async function loadGraphics() {
	for (const card of CardDeck) {
		card.graphics = await loadImage(`./assets/cards/${card.name}_${card.suitName}_white.png`)
	}
}

export default getCardDeck
