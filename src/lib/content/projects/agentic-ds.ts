import type { Project } from '../schema';

export default {
	slug: 'agentic-ds',
	repo: 'Zabedz/Agentic-DS',
	title: 'Offline Agentic Data Scientist',
	label: 'Agentic Data Scientist',
	pitch:
		'A rule based agent that profiles an unseen CSV, trains scikit-learn models, and keeps a change only when it beats the best so far by a paired test or a fixed margin.',
	summary:
		'The agent profiles a CSV, plans preprocessing and candidate models, trains them, and reflects on the scores with eight diagnostics, each with a ladder of remedies to try next. A replan stays only if it beats the best accepted configuration by a paired fold test or a 0.01 margin; on the three bundled benchmarks all six replans were rejected, so each run reports its first pipeline. It uses no LLM and runs locally or as an AWS SageMaker Processing job.',
	status: 'complete',
	credit: 'Started from a small MIT-licensed skeleton released by sagihaider.',
	stack: [
		'Python',
		'scikit-learn',
		'pandas',
		'SciPy',
		'imbalanced-learn',
		'AWS SageMaker',
		'Terraform',
		'Docker'
	],
	highlights: [
		'Holds out 20% of rows before profiling; ranking, replans, and every accept or reject use out of fold validation scores, and test metrics are computed once for the report.',
		'On all three bundled datasets no replan survived its own acceptance test. An earlier apparent gain on wine came from raising CV folds from 5 to 8, and that remedy was removed.',
		'Picks a one sided Wilcoxon signed rank or exact permutation test by the count of nonzero fold differences, applies Holm-Bonferroni, and prints the dependent-folds caveat next to every significance table.',
		'One command, run_sagemaker.py, uploads a CSV to S3, runs the agent as a SageMaker Processing job, prints its log, and downloads the report; Terraform defines the bucket, ECR repo, and role.'
	],
	stats: [
		{ value: '0.933', label: 'Test balanced accuracy, drug200' },
		{ value: '6 of 6', label: 'Replans rejected by the gate' },
		{ value: '253,680', label: 'Rows in the largest benchmark' },
		{ value: '~3 min', label: 'Wine run on SageMaker' }
	],
	visual: {
		type: 'image',
		image: {
			src: 'agentic-ds/replan-rejected',
			alt: 'Terminal log of the agent on the wine quality data. Each replan ends in "Change rejected: does not beat iteration 0", two by a Wilcoxon signed rank test and the last by the 0.01 score margin.',
			caption: 'Wine quality run: every replan rejected.'
		}
	},
	gallery: [
		{
			src: 'agentic-ds/replan-iterations',
			alt: 'Validation balanced accuracy per iteration on wine quality and diabetes. Every replan lands inside the fold range of iteration 0 and is marked rejected, so both runs report iteration 0.',
			caption: 'Per-iteration validation score with fold range.'
		},
		{
			src: 'agentic-ds/sagemaker-run',
			alt: 'End of a SageMaker run on drug200: HistGradientBoosting at 0.9953 validation and 0.9333 test balanced accuracy, the job completed, and the report, metrics, and plots downloaded locally.',
			caption: 'One-command run on SageMaker.'
		}
	],
	links: [{ label: 'Source', href: 'https://github.com/Zabedz/Agentic-DS' }]
} satisfies Project;
