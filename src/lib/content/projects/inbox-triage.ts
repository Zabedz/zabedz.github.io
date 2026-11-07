import type { Project } from '../schema';

export default {
	slug: 'inbox-triage',
	repo: 'Zabedz/inbox-triage',
	title: 'Inbox Triage',
	pitch:
		'A Gmail agent for job-search mail that picks each category, tracker row and action from a closed set with a probability on every option, and changes the tracker only when a rule-based guard or a person approves it.',
	summary:
		"Each email is redacted, classified, matched to a row in the application tracker and given a proposed action, with Jev, TypeSafe's decision model, making each choice. A rule-based guard applies Gmail labels and acknowledgements on its own, marks a row Rejected only when the category and match probabilities are both 0.99 or higher and the sender's domain belongs to the matched company or agency, and holds every other change for review. The evaluation runs the full pipeline on 96 labelled synthetic emails, with Jev and an LLM each making the decisions with and without redaction, and on 24 red-team attacks.",
	status: 'active',
	statusNote:
		'Real labelled mail has not been scored yet; that run fits guard thresholds on mail before a cutoff date and scores them on later mail. Calendar and reply-draft actions are only logged. Jev and the LLM both score 100% on category, match and action on the synthetic set, so accuracy there no longer tells them apart.',
	stack: [
		'Python',
		'LangGraph',
		'Pydantic',
		'Jev',
		'DeepSeek via OpenCode Zen',
		'Gmail API',
		'promptfoo',
		'SQLite',
		'GitHub Actions'
	],
	highlights: [
		'Jev answers category (one of 8), needs-reply and urgency in one call. Mail classed as other or recruiter outreach is logged and skipped only when Jev puts under 10% in total on the five categories that change an application status.',
		"Matching is split in two: an LLM searches the tracker for up to 10 candidate rows, then Jev picks one or none_of_these, and the guard checks Jev's probability for that pick.",
		"With no errors seen, the error rate is reported as a one-sided 95% Wilson upper bound: Jev's 25 auto-applied synthetic actions were all correct, a bound of 9.8%. A guard threshold is recommended only after 52 error-free proposed rejections, the first count under 5%.",
		'Known red-team failures are recorded with the exact action and tracker row they produce, and the eval gate fails if one changes or a new one appears. On the 30 emails redaction alters, none flipped between right and wrong for Jev or the LLM.'
	],
	stats: [
		{ value: '0.007', label: 'Jev category calibration error (ECE)' },
		{ value: '9.8%', label: 'Upper bound on Jev auto-apply errors, 0 of 25 synthetic' },
		{ value: '52', label: 'Error-free rejections before a threshold is recommended' },
		{ value: '24', label: 'Red-team attacks run through the pipeline' }
	],
	visual: {
		type: 'chart',
		chart: {
			kind: 'bars',
			title: 'Calibration on 96 synthetic emails, Jev against the LLM',
			categoryLabel: 'Metric',
			categories: ['Category ECE', 'Category Brier', 'Match ECE (chosen row)'],
			series: [
				{ label: 'Jev', values: [0.007, 0.003, 0] },
				{ label: 'LLM', values: [0.037, 0.006, 0.004] }
			],
			format: 'decimal',
			note: "Lower is better. ECE is the gap between stated confidence and accuracy over 10 equal-width bins; Brier is the squared error of the probabilities. Jev's match ECE is 0, so it has no bar; emails with no matched row count at confidence 1."
		}
	},
	gallery: [
		{
			src: 'inbox-triage/where-jev-decides',
			dark: 'inbox-triage/where-jev-decides-dark',
			alt: 'Pipeline of six steps: redact (code), classify (Jev), extract (LLM), match (LLM, then Jev), propose_action (Jev) and guard (code). Classify asks for the category, needs_reply and urgency in one call. Extract keeps a field only if its quote is in the email. In match an LLM collects up to 10 tracker rows and Jev picks one or none_of_these. The guard applies labels and acknowledgements on its own, a rejection only when both probabilities are 0.99 or above and the sender is the matched company or agency, skips a status the row already has, and sends the rest to review. A dashed skip edge runs from classify to guard for other or recruiter_outreach mail whose five status categories sum under 0.10.',
			caption: 'Jev makes each choice; code decides what applies.'
		},
		{
			src: 'inbox-triage/error-bound',
			dark: 'inbox-triage/error-bound-dark',
			alt: 'Curve of the one-sided 95% Wilson upper bound on an error rate against the number of error-free cases. Runs on the synthetic set sit on it by their auto-applied actions: llm 0 of 20 at 11.9%, rules 0 of 22 at 11.0%, llm-raw 0 of 23 at 10.5%, and jev and jev-raw 0 of 25 at 9.8%. The curve crosses the 5% target at 52; calibrate recommends a guard threshold only once 52 proposed tracker rejections, a separate count, are error-free, and below that prints "keep 0.99".',
			caption: 'The 96 synthetic emails share 36 bodies, so these bounds are optimistic.'
		}
	],
	links: [{ label: 'Source', href: 'https://github.com/Zabedz/inbox-triage' }]
} satisfies Project;
