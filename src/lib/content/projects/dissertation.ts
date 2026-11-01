import type { Project } from '../schema';

export default {
	slug: 'dissertation',
	repo: 'Zabedz/dissertation',
	title: 'Guardrails, Abstention and Citation under Ablation',
	label: 'Dissertation',
	pitch:
		'MSc paper testing which safety and citation parts of a local mental-health RAG assistant hold up when each is switched off.',
	summary:
		'An ablation study of a local retrieval-augmented assistant for healthcare worker mental health: a parametric baseline, the full system, and variants without calibration or without citations each answer a 180-query suite. The safety router and inline citations held up, while mean retrieval similarity failed as a confidence signal. Results come from an LLM judge reviewed by hand on synthetic query sets; the paper source and PDF are public.',
	status: 'complete',
	stack: [
		'Mistral Small 3.2 (24B)',
		'BGE-M3',
		'Qdrant',
		'Ollama',
		'LaTeX (IEEEtran)',
		'TikZ and pgfplots'
	],
	highlights: [
		'Seven-stage local pipeline with two early exits: a two-layer router (16 regexes, then a zero-shot classifier) sends crisis and out-of-scope queries to templates, and a confidence band abstains.',
		'Answers are grounded in a licence-audited corpus of 638 documents split into 1233 chunks, embedded with BGE-M3 and searched in Qdrant on one local machine.',
		'Citation checks separate form from correctness: none of 942 markers points outside the retrieved set, and 93.4% support their claim against a 0.70 target set in advance.',
		'Calibration fails on 70 held-out queries (Spearman rho -0.060, p 0.621), and a search over seven alternative signals against a pass bar set in advance came up negative.'
	],
	stats: [
		{ value: '93.3%', label: 'Crisis queries sent to crisis template' },
		{ value: '0', label: 'Policy violations, full system' },
		{ value: '93.4%', label: 'Citation precision' },
		{ value: '17%', label: 'False refusals on in-scope queries' }
	],
	visual: {
		type: 'chart',
		chart: {
			kind: 'scatter',
			title: 'Retrieval confidence against groundedness',
			xLabel: 'Retrieval confidence (mean cosine)',
			yLabel: 'Share of claims grounded',
			points: [
				[0.5241, 0.8],
				[0.5402, 1],
				[0.5423, 1],
				[0.543, 1],
				[0.5454, 1],
				[0.5498, 1],
				[0.557, 1],
				[0.5598, 1],
				[0.5646, 1],
				[0.5651, 0.889],
				[0.5659, 1],
				[0.5697, 1],
				[0.5713, 0.727],
				[0.5736, 0.857],
				[0.5745, 1],
				[0.5792, 1],
				[0.5794, 1],
				[0.5825, 1],
				[0.5905, 0.889],
				[0.5918, 0.714],
				[0.598, 0.8],
				[0.599, 1],
				[0.6008, 1],
				[0.6011, 1],
				[0.6017, 0.667],
				[0.6045, 1],
				[0.6046, 0.75],
				[0.6053, 1],
				[0.6069, 0.923],
				[0.6074, 0.778],
				[0.612, 1],
				[0.6137, 0.889],
				[0.6137, 1],
				[0.6141, 0],
				[0.6147, 1],
				[0.6148, 1],
				[0.6157, 0.889],
				[0.6173, 0],
				[0.6185, 0.857],
				[0.6186, 1],
				[0.6194, 1],
				[0.6198, 0.6],
				[0.6208, 1],
				[0.6213, 1],
				[0.6224, 1],
				[0.6227, 1],
				[0.6244, 1],
				[0.6248, 1],
				[0.6299, 1],
				[0.631, 0.667],
				[0.6325, 1],
				[0.6411, 1],
				[0.6417, 1],
				[0.6427, 1],
				[0.6454, 1],
				[0.6493, 1],
				[0.6494, 1],
				[0.6497, 1],
				[0.6519, 0.857],
				[0.6528, 1],
				[0.6606, 1],
				[0.6649, 0.889],
				[0.6655, 0.75],
				[0.6659, 1],
				[0.6668, 1],
				[0.672, 1],
				[0.6759, 0.625],
				[0.678, 0.714],
				[0.689, 0.714],
				[0.7187, 1]
			],
			threshold: { x: 0.565, label: 'Abstention threshold' },
			note: '70 answered held-out queries. Spearman rho = -0.060 (p = 0.621): confidence does not rank groundedness.'
		}
	},
	gallery: [
		{
			src: 'dissertation/pipeline',
			alt: 'Pipeline diagram with seven stages in a row: preprocess, router, retrieve, band, generate, assemble, log. The router exits early to a crisis or out-of-scope template, the band exits to an abstention template, and both exits still end at the log stage.',
			caption: 'Fig. 1 of the paper.'
		}
	],
	links: [
		{ label: 'Source', href: 'https://github.com/Zabedz/dissertation' },
		{ label: 'Paper (PDF)', href: 'https://zabedz.github.io/dissertation/paper.pdf' }
	]
} satisfies Project;
