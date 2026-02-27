import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Resend before importing route
vi.mock("resend", () => {
  const mockSend = vi.fn().mockResolvedValue({ data: { id: "test-id" }, error: null });
  class Resend {
    emails = { send: mockSend };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_key: string | undefined) {}
  }
  return { Resend };
});

async function callHandler(body: object) {
  const { POST } = await import("./route");
  const req = new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return POST(req);
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("CONTACT_EMAIL", "test@example.com");
    vi.stubEnv("RESEND_API_KEY", "test-key");
  });

  it("returns 400 when fields are missing", async () => {
    const res = await callHandler({ name: "", email: "", message: "" });
    expect(res.status).toBe(400);
  });

  it("returns 200 with valid fields", async () => {
    const res = await callHandler({
      name: "Test User",
      email: "test@example.com",
      message: "Hello!",
    });
    expect(res.status).toBe(200);
  });

  it("ignores requests with honeypot filled", async () => {
    const res = await callHandler({
      name: "Bot",
      email: "bot@example.com",
      message: "Spam",
      website: "filled",
    });
    expect(res.status).toBe(200); // silently succeed to not tip off bots
  });
});
