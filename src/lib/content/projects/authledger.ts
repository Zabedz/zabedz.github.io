import type { Project } from '../schema';

export default {
	slug: 'authledger',
	repo: 'Zabedz/AuthLedger',
	title: 'AuthLedger',
	pitch:
		'Login, MFA and role-based access wired to Stripe card payments that post to a double-entry ledger enforced by Postgres.',
	summary:
		'A TypeScript web app with two domains in one system: identity (sessions, TOTP MFA, OAuth login, RBAC) and payments (Stripe PaymentIntents, a webhook inbox, refunds, and a double-entry ledger reconciled against Stripe). Authorization gates every money endpoint, and the ledger balance and append-only rules live in SQL migrations. Terraform splits AWS into a persistent stack and an hourly-billed stack (VPC, ALB, ECS, RDS) that is torn down when idle.',
	status: 'complete',
	stack: [
		'TypeScript',
		'Fastify',
		'Postgres',
		'Kysely',
		'Stripe',
		'React',
		'Terraform',
		'AWS ECS and RDS'
	],
	highlights: [
		'A deferred constraint trigger rejects any journal entry whose postings do not sum to zero at commit, and triggers refuse UPDATE and DELETE on both ledger tables, so a correction is a reversing entry.',
		'Stripe webhooks are signature-checked and stored once per event id; one mapping module turns them into internal events, and the ledger entry commits in the same transaction as the payment update.',
		'The server refuses to boot if any /api route lacks an authorization policy. Money rules a single permission cannot express, such as ownership and refund ceilings, are pure functions in their own module.',
		'A nightly CI job drives a real browser through register, email verification, MFA, a Stripe test-mode payment settled by webhook, a refund, and reconciliation.'
	],
	visual: {
		type: 'steps',
		title: 'Payment to ledger',
		steps: [
			{
				title: 'POST /api/payments',
				detail: 'Gated on the self policy; creates a Stripe PaymentIntent with an idempotency key.'
			},
			{
				title: 'Signed webhook into the inbox',
				detail:
					'Signature verified, then stored in provider_events keyed by event id, so a replay is a no-op.'
			},
			{
				title: 'Map to an internal event',
				detail: 'stripe-mapping.ts is the one place Stripe event and object type names appear.'
			},
			{
				title: 'Apply and post in one transaction',
				detail:
					'The payment row update and a ledger entry commit together; UNIQUE (kind, reference) posts each provider event once.'
			},
			{
				title: 'Balance check at commit',
				detail:
					'The deferred ledger_balanced trigger raises if the postings of an entry do not sum to zero.'
			},
			{
				title: 'Reconcile',
				detail:
					'A daily run pulls Stripe balance transactions, posts fees, and flags settled charges missing from the ledger.'
			}
		]
	},
	gallery: [
		{
			src: 'authledger/payment-element',
			alt: 'The AuthLedger checkout with the Stripe Payment Element embedded: card number, expiry, security code and country fields for a signed-in demo user.',
			caption: 'Card checkout in Stripe test mode'
		},
		{
			src: 'authledger/admin-panel',
			alt: 'The signed-in account page with two-factor authentication on and an Administration table where an admin can revoke admin or grant the auditor and finance roles.',
			caption: 'Role assignment'
		},
		{
			src: 'authledger/recovery-codes',
			alt: 'The account page right after enabling two-factor authentication, listing ten single-use recovery codes to save.',
			caption: 'MFA recovery codes'
		}
	],
	links: [{ label: 'Source', href: 'https://github.com/Zabedz/AuthLedger' }]
} satisfies Project;
