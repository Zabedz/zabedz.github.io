import type { Site } from './schema';

export default {
	name: 'Zabed Ibne Emdad',
	headline:
		'Software engineer. I build LLM evaluations and backend systems, and I measure whether they do what they claim.',
	about: [
		'I am finishing an MSc in Artificial Intelligence at the University of Essex. Before that I spent two years at ServiceRocket building Confluence apps, integrations and CI/CD pipelines, then freelanced on web, mobile and LLM features for clients.',
		'My research work asks whether a model is as confident as it should be. My systems work asks whether an invariant still holds under load, retries or concurrent edits. Each repo states its results and its limits.'
	],
	links: [
		{ label: 'GitHub', href: 'https://github.com/Zabedz' },
		{ label: 'CV', href: 'https://zabedz.github.io/resume/' }
	],
	owner: 'Zabedz',
	url: 'https://zabedz.github.io/',
	description:
		'Projects by Zabed Ibne Emdad: LLM calibration and safety evaluation, payment and receipt pipelines, and a text CRDT.'
} satisfies Site;
