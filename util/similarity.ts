function levenshteinDistance(s: string, t: string) {
	if (!s.length) return t.length
	if (!t.length) return s.length
	const arr = []
	for (let i = 0; i <= t.length; i++) {
		arr[i] = [i]
		for (let j = 1; j <= s.length; j++) {
			arr[i][j] =
				i === 0
					? j
					: Math.min(
							arr[i - 1][j] + 1,
							arr[i][j - 1] + 1,
							arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
					  )
		}
	}
	return arr[t.length][s.length]
}

export function similarity(a: string, b: string) {
	a = a.toUpperCase()
	b = b.toUpperCase()
	let similarity = 1 - levenshteinDistance(a, b) / Math.max(a.length, b.length)
	return similarity
}
