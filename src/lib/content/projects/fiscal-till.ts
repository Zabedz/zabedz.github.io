import type { Project } from '../schema';

export default {
	slug: 'fiscal-till',
	repo: 'Zabedz/fiscal-till',
	title: 'Fiscal till pipeline',
	pitch:
		'Fiscal receipts for venue tills in France, Germany and Austria, load tested on AWS with 50 simulated tills.',
	summary:
		"Each sale is priced under its market's VAT rules, signed by a mock signing partner, given a gapless per-till receipt number in a SQL Server journal, then stored in S3 and emailed. The backend is C# on AWS Lambda with infrastructure in CDK, and the till is an Angular app. Recorded drills cover a slow partner, a partner outage, poison messages and a traffic burst, and a script then checks DynamoDB against the journal.",
	status: 'complete',
	stack: [
		'C# / .NET 10',
		'AWS Lambda',
		'AWS CDK',
		'SQS',
		'DynamoDB',
		'SQL Server 2022',
		'Angular',
		'k6'
	],
	highlights: [
		'A resend under the same Idempotency-Key returns the stored sale, and the same key with a different body gets a 422. In the baseline drill all 381 resends returned the original sale.',
		"A FIFO queue grouped per till feeds dbo.RecordSale, which gives the sale the till's next receipt number in the same transaction that journals it.",
		'The first baseline drill logged 213 SQL Server deadlocks in 7 minutes. OPTION (LOOP JOIN) turned a foreign key scan into a seek, and a regression test fails on the old procedure.',
		'Failed signatures back off from 5 s, doubling to 60 s plus jitter. In the drill with the partner down for 4 minutes, no sale was dead-lettered.'
	],
	stats: [
		{ value: '23,277', label: 'Sales checked after the drills' },
		{ value: '0', label: 'Missing or repeated receipt numbers' },
		{ value: '179 ms', label: 'API p95 at 10 sales/s' },
		{ value: '0.49 s', label: 'Sale to receipt number, p95' }
	],
	visual: {
		type: 'steps',
		title: 'One sale through the pipeline',
		steps: [
			{
				title: 'API Gateway and CreateSale',
				detail:
					"The till posts the sale with its venue's API key and an Idempotency-Key. CreateSale prices it under the market's VAT rules and answers 202."
			},
			{
				title: 'DynamoDB: PENDING',
				detail:
					'The sale is written with attribute_not_exists under an id derived from the venue and key, so a resend returns the stored sale.'
			},
			{
				title: 'Fiscalise queue',
				detail:
					'An SQS queue with partial batch failures. A failed call backs off on the message, and after 10 receives it goes to the DLQ and the alarm emails.'
			},
			{
				title: 'Partner signature: SIGNED',
				detail:
					'FiscaliseWorker calls the mock signing partner and moves the sale from PENDING to SIGNED with a version check.'
			},
			{
				title: 'Per-till FIFO queue',
				detail:
					"Signed sales are grouped per till, so the journal worker takes each till's sales in order."
			},
			{
				title: 'dbo.RecordSale',
				detail:
					"Assigns the till's next receipt number in the same transaction that journals the sale. The receipt is then written to S3 and emailed."
			}
		]
	},
	gallery: [
		{
			src: 'fiscal-till/till-receipt',
			alt: 'The Angular till on the Paris venue after a card sale of 64,50 EUR. The receipt shows the VAT split at 20% and 10%, the partner signature and receipt number 00000004, next to the three stages: accepted, signed, numbered.',
			caption: 'The till after one sale'
		},
		{
			src: 'fiscal-till/drills',
			dark: 'fiscal-till/drills-dark',
			alt: "Drill setup: a laptop script sets the mock partner's switches in SSM, runs k6 against API Gateway and sends five bad messages straight to the fiscalise queue. Failed signatures go back on the queue for 5 to 72 s, and the bad messages reach the DLQ, whose alarm emails through SNS.",
			caption: 'How the drills inject faults'
		},
		{
			src: 'fiscal-till/sales-waiting-to-be-signed',
			alt: 'CloudWatch graph of sales waiting to be signed during the drills on 27 October 2026. Sales queued during the slow partner drill and backed off during the outage, and both drained to zero once the partner recovered.',
			caption: 'Sales waiting to be signed, per drill'
		}
	],
	links: [
		{ label: 'Source', href: 'https://github.com/Zabedz/fiscal-till' },
		{ label: 'Load test results', href: 'https://zabedz.github.io/fiscal-till/' }
	]
} satisfies Project;
