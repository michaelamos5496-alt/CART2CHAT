import "server-only";

import crypto from "node:crypto";

import { env } from "@/lib/env";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function secretKey(): string {
  if (!env.PAYSTACK_SECRET_KEY) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not configured — this action requires it.",
    );
  }
  return env.PAYSTACK_SECRET_KEY;
}

async function paystackRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = await response.json();

  if (!response.ok || body.status === false) {
    throw new Error(body.message || `Paystack request failed: ${path}`);
  }

  return body.data as T;
}

export interface PaystackTransaction {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export async function initializeTransaction(params: {
  email: string;
  amountKobo: number;
  // Omit to run a plan-less, one-time charge — Paystack then shows every
  // channel enabled on the account (including Mobile Money). Recurring
  // subscriptions only support Card, so passing a plan restricts checkout
  // to Card only.
  planCode?: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<PaystackTransaction> {
  return paystackRequest<PaystackTransaction>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      ...(params.planCode ? { plan: params.planCode } : {}),
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });
}

export interface PaystackVerifiedTransaction {
  status: string;
  reference: string;
  customer: { customer_code: string; email: string };
}

export async function verifyTransaction(
  reference: string,
): Promise<PaystackVerifiedTransaction> {
  return paystackRequest<PaystackVerifiedTransaction>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}

export async function disableSubscription(params: {
  code: string;
  token: string;
}): Promise<void> {
  await paystackRequest("/subscription/disable", {
    method: "POST",
    body: JSON.stringify({ code: params.code, token: params.token }),
  });
}

export async function enableSubscription(params: {
  code: string;
  token: string;
}): Promise<void> {
  await paystackRequest("/subscription/enable", {
    method: "POST",
    body: JSON.stringify({ code: params.code, token: params.token }),
  });
}

export interface PaystackPlan {
  plan_code: string;
}

export async function createPlan(params: {
  name: string;
  amountKobo: number;
  interval: "monthly" | "annually";
}): Promise<PaystackPlan> {
  return paystackRequest<PaystackPlan>("/plan", {
    method: "POST",
    body: JSON.stringify({
      name: params.name,
      amount: params.amountKobo,
      interval: params.interval,
    }),
  });
}

export async function updatePlan(
  planCode: string,
  params: { name: string; amountKobo: number },
): Promise<void> {
  await paystackRequest(`/plan/${encodeURIComponent(planCode)}`, {
    method: "PUT",
    body: JSON.stringify({
      name: params.name,
      amount: params.amountKobo,
    }),
  });
}

// Paystack signs webhook bodies with HMAC-SHA512 of the raw request body,
// keyed by the secret key — the same key used for API auth, no separate
// webhook secret exists. Callers must pass the raw (unparsed) body text,
// since JSON.stringify(JSON.parse(body)) is not guaranteed to reproduce
// the exact bytes Paystack signed.
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader) return false;

  const expected = crypto
    .createHmac("sha512", secretKey())
    .update(rawBody)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signatureHeader);

  return (
    expectedBuffer.length === actualBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, actualBuffer)
  );
}
