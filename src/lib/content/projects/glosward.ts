import type { Project } from '../schema';

export default {
	slug: 'glosward',
	repo: 'Zabedz/Glosward',
	title: 'Glosward',
	pitch:
		'Cited answers to questions about the HuggingFace Transformers and PEFT docs, with a QLoRA adapter for a beginner-friendly voice.',
	summary:
		'Retrieval owns the facts: the Transformers and PEFT docs are split into 8,001 heading-aware passages and embedded with bge-small into Chroma, and the top five for a question go into a prompt that tells the model to use only them. A QLoRA adapter owns the tone and is applied at generation time. Each answer lists those five passages as its sources, and retrieval is scored with hit@k and MRR against 26 labeled questions.',
	status: 'complete',
	stack: [
		'Python 3.11',
		'PyTorch',
		'transformers and PEFT',
		'bitsandbytes (QLoRA)',
		'sentence-transformers',
		'Chroma',
		'Gradio'
	],
	highlights: [
		'Each page is split on its Markdown headings into passages of about 600 tokens with 12% overlap, and a fenced code block is always kept whole inside one passage.',
		'The adapter is a rank-16 LoRA on the query and value projections of a 4-bit Qwen2.5-1.5B-Instruct student, trained on teacher-written answers from the guide pages with auto-generated API reference pages filtered out.',
		'Training uses a completion-only loss: prompt and context tokens are labeled -100, so only the answer tokens are scored.',
		"In the repo's paired examples, the base model and the adapter cite the same retrieved passages, and the adapter's answers are shorter and end at the answer while the base model pads or drifts into invented follow-up questions."
	],
	stats: [
		{ value: '8,001', label: 'Doc passages indexed' },
		{ value: '0.923', label: 'Retrieval hit@5 on 26 labeled questions' },
		{ value: '0.962', label: 'Retrieval hit@10' },
		{ value: '0.740', label: 'Retrieval MRR@5' }
	],
	visual: {
		type: 'image',
		image: {
			src: 'glosward/build-pipeline',
			alt: 'Build pipeline in two rows. Ingestion clones the docs, strips license headers, chunks on headings, embeds with bge-small and writes 8001 passages to the Chroma store. The LoRA row takes the guides with API reference excluded, has a teacher model write Q&A pairs, trains 4-bit answer-only QLoRA and produces the tone adapter. Both feed the served system.',
			caption: 'How the vector store and the tone adapter are built'
		}
	},
	gallery: [
		{
			src: 'glosward/answer-path',
			alt: 'Answer path: a question is embedded and matched against the Chroma store of 8001 passages, the top five go into a grounded prompt with the question, and the base model with the LoRA adapter writes the cited answer. Retrieval fixes the facts; the adapter changes the wording.',
			caption: 'One question through the answer path'
		}
	],
	links: [{ label: 'Source', href: 'https://github.com/Zabedz/Glosward' }]
} satisfies Project;
