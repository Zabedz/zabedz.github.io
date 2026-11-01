import type { Chapter } from './schema';

/** Page order. Remove an entry to hide a project; `featured` pins a project that has a visual. */
export default [
	{
		id: 'research',
		label: 'Research',
		title: 'Does the confidence hold?',
		intro:
			'Two studies of language models whose confidence can drift away from whether they are right.',
		projects: [
			{ slug: 'frontier', featured: true },
			{ slug: 'dissertation', featured: true }
		]
	},
	{
		id: 'systems',
		label: 'Systems',
		title: 'Invariants under pressure',
		intro:
			'Systems built around a rule that has to hold: a battery plan within its limits, a ledger that balances, receipt numbers without gaps, replicas that converge, answers that cite their sources.',
		projects: [
			{ slug: 'pv-bess', featured: true },
			{ slug: 'authledger', featured: true },
			{ slug: 'fiscal-till', featured: true },
			{ slug: 'tombstone', featured: true },
			{ slug: 'glosward', featured: true }
		]
	},
	{
		id: 'tools',
		label: 'Tools',
		title: 'Tools',
		intro: 'An offline data-science agent and a chess position editor.',
		projects: [{ slug: 'agentic-ds', featured: true }, { slug: 'chess-editor' }]
	}
] satisfies Chapter[];
