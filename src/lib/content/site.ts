import type { Site } from './schema';

export default {
	name: 'Zabed Emdad',
	headline:
		'Software engineer. I build LLM evaluations and backend systems, and I measure whether they do what they claim.',
	about: [
		'I am a software engineer with several years of experience, and I am finishing an MSc in Artificial Intelligence at the University of Essex. I have built Confluence apps, integrations and CI/CD pipelines at ServiceRocket, and web, mobile and LLM features as a freelancer.',
		'My research interest is AI safety, in particular amplified and scalable oversight: how people can supervise models on tasks too large or too hard to check directly. My research projects test signals an overseer would rely on, such as whether a model is as confident as it should be.',
		'My systems work asks whether an invariant still holds under load, retries or concurrent edits. Each repo states its results and its limits.'
	],
	links: [
		{ label: 'GitHub', href: 'https://github.com/Zabedz' },
		{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/zabed-emdad/' }
	],
	owner: 'Zabedz',
	url: 'https://zabedz.github.io/',
	description:
		'Projects by Zabed Emdad: LLM calibration and safety evaluation, AI oversight research, and backend systems.'
} satisfies Site;
