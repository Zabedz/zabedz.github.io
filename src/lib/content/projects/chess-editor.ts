import type { Project } from '../schema';

export default {
	slug: 'chess-editor',
	repo: 'Zabedz/chess-editor',
	title: 'Chess Position Editor',
	pitch:
		'Drag pieces onto a board to build any chess position and see Stockfish 18 pick the best move, all in the browser.',
	summary:
		'Set up a position by dragging pieces from a palette, or paste a FEN or PGN, and Stockfish 18 returns the best move, the score, and the search depth, with the move drawn on the board. The engine runs as WebAssembly in a Web Worker, so analysis happens on the device with no backend. A legality check runs before each search and reports illegal positions, checkmate, and stalemate.',
	status: 'complete',
	stack: [
		'TypeScript',
		'Stockfish 18 (WebAssembly)',
		'Web Workers',
		'chess.js',
		'Vite',
		'Vitest',
		'Playwright',
		'GitHub Pages'
	],
	highlights: [
		'Stockfish talks UCI from a Web Worker; each edit bumps a token and stops the running search, so only the result for the current position reaches the panel.',
		'Edits are debounced by 200 ms, then a legality gate checks for one king per side, no pawns on the back ranks, and that the side not to move is out of check.',
		'The editor plays real chess too: castling moves king and rook together, en passant is playable and can be suggested, Back undoes an edit, and Forward plays the engine move.',
		'A settings dialog sets search depth from 6 to 22, one of four board themes, sound, and rebindable keyboard shortcuts, saved in localStorage.'
	],
	stats: [
		{ value: '150', label: 'Vitest unit tests' },
		{ value: '13', label: 'Playwright spec files' }
	],
	visual: {
		type: 'image',
		image: {
			src: 'chess-editor/best-move',
			dark: 'chess-editor/best-move-dark',
			alt: 'The editor after loading a short PGN. Stockfish reports mate in one with Qxf7# at depth 15, and the board marks the queen on f3, the path squares, and the target f7.',
			caption: 'Mate in one found at depth 15, with the path drawn on the board.'
		}
	},
	gallery: [
		{
			src: 'chess-editor/settings',
			dark: 'chess-editor/settings-dark',
			alt: 'The settings dialog with sound and volume, four board themes, coordinate and move-highlight toggles, a search depth slider set to 15, and rebindable keyboard shortcuts.'
		}
	],
	links: [
		{ label: 'Source', href: 'https://github.com/Zabedz/chess-editor' },
		{ label: 'Open the editor', href: 'https://zabedz.github.io/chess-editor/' }
	]
} satisfies Project;
