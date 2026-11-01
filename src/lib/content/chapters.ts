import type { Chapter } from './schema';

/** Page order. Remove an entry to hide a project; `featured` gets a pinned scene. */
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
			'Backend systems built around one rule each: a ledger that balances, receipt numbers without gaps, replicas that converge.',
		projects: [
			{ slug: 'authledger', featured: true },
			{ slug: 'fiscal-till', featured: true },
			{ slug: 'tombstone', featured: true }
		]
	},
	{
		id: 'tools',
		label: 'Tools',
		title: 'Tools',
		intro: 'An offline data-science agent and a chess position editor.',
		projects: [{ slug: 'agentic-ds', featured: true }, { slug: 'chess-editor' }]
	},
	{
		id: 'team',
		label: 'Team',
		title: 'Team work',
		intro: 'A university team project, with my part named.',
		projects: [{ slug: 'pv-bess' }]
	}
] satisfies Chapter[];
