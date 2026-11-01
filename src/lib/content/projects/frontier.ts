import type { Project } from '../schema';

export default {
	slug: 'frontier',
	repo: 'Zabedz/Frontier',
	title: 'Frontier',
	pitch:
		'Tests whether quantizing a language model hurts its calibration faster than its accuracy, on a single 16GB GPU.',
	summary:
		'A quantized model is usually signed off by comparing its accuracy against the original, a check that can pass while its confidence stops tracking whether it is right. Frontier defines each compression variant in a YAML config, scores it on Qwen2.5-3B over 2000 MMLU items, and records ECE, Brier and reliability diagrams next to accuracy. The FP16 baseline and five compressed variants across Hugging Face and llama.cpp are measured so far, and the work is funded by a BlueDot Impact Rapid Grant.',
	status: 'active',
	statusNote:
		'Remaining: the vLLM batch (GPTQ, AWQ, W8A8), paired bootstrap intervals on every measured pair, the QAT arm and the distillation arm.',
	stack: [
		'Python',
		'PyTorch',
		'Hugging Face Transformers',
		'bitsandbytes',
		'llama.cpp',
		'vLLM',
		'Docker'
	],
	highlights: [
		'At 4 bits, ECE worsens about twice as fast as accuracy in relative terms, and bitsandbytes NF4 and llama.cpp q4_k_m agree on this independently.',
		'The 8-bit q8_0 and 5-bit q5_k_m GGUF builds stay within 0.4 accuracy points and 0.003 ECE of the FP16 baseline.',
		'Equal-width ECE and equal-mass ACE are cross-checked against torchmetrics, netcal and a scikit-learn calibration curve, and a test rebuilds the Brier score from its Murphy decomposition.',
		'The paired bootstrap draws one resample vector for both arrays, 9999 resamples by default, and a regression test catches resampling each array on its own.'
	],
	stats: [
		{ value: '64.7%', label: 'FP16 MMLU accuracy' },
		{ value: '0.269', label: 'FP16 baseline ECE' },
		{ value: '-4.0%', label: 'Relative accuracy change, q4_k_m' },
		{ value: '+8.2%', label: 'Relative ECE change, q4_k_m' }
	],
	visual: {
		type: 'chart',
		chart: {
			kind: 'bars',
			title: 'Relative change against FP16, Qwen2.5-3B on 2000 MMLU items',
			categoryLabel: 'Variant',
			categories: ['gguf-q8_0', 'gguf-q5_k_m', 'int8-weightonly', 'int4-nf4', 'gguf-q4_k_m'],
			series: [
				{ label: 'Accuracy', values: [0.23, -0.62, -1.62, -3.63, -4.02] },
				{ label: 'ECE', values: [-0.89, 0.11, 5.4, 7.37, 8.22] }
			],
			format: 'percent',
			note: 'Point estimates from the README table. Lower accuracy and higher ECE are both worse.'
		}
	},
	gallery: [
		{
			src: 'frontier/calibration-figure',
			dark: 'frontier/calibration-figure-dark',
			alt: 'Two panels. A reliability diagram shows the FP16 baseline stating 0.99 confidence on 74% of items while getting 0.74 of them right (ECE 0.269), and a forest plot shows accuracy moving more than mean confidence on four compressed-versus-reference pairs.',
			caption: '95% paired bootstrap intervals, 9999 resamples.'
		}
	],
	links: [{ label: 'Source', href: 'https://github.com/Zabedz/Frontier' }]
} satisfies Project;
