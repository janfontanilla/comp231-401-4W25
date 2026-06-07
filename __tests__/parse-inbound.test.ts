/**
 * Unit tests for the inbound-email payload parser (lib/parse-inbound.ts).
 * These verify how raw webhook fields are normalized into a card-ready shape,
 * without any HTTP/DB/network involved.
 */
import {
  parseInboundEmail,
  extractEmailAddress,
  extractMessageId,
  htmlToText,
  MAX_BODY_CHARS,
} from "@/lib/parse-inbound";

describe("extractEmailAddress", () => {
  test('"Brightspace <noreply@brightspace.com>" -> bare address', () => {
    expect(extractEmailAddress("Brightspace <noreply@brightspace.com>")).toBe(
      "noreply@brightspace.com"
    );
  });

  test("plain address is lowercased", () => {
    expect(extractEmailAddress("NoReply@Example.COM")).toBe(
      "noreply@example.com"
    );
  });

  test("empty input returns empty string", () => {
    expect(extractEmailAddress("")).toBe("");
  });
});

describe("extractMessageId", () => {
  test("reads a dedicated message-id field and strips angle brackets", () => {
    const id = extractMessageId(
      { "message-id": "<abc-123@brightspace.com>" },
      "x@y.com",
      "Hi"
    );
    expect(id).toBe("abc-123@brightspace.com");
  });

  test("parses Message-ID out of a raw headers blob", () => {
    const id = extractMessageId(
      { headers: "From: a\r\nMessage-ID: <xyz@server>\r\nSubject: s" },
      "x@y.com",
      "Hi"
    );
    expect(id).toBe("xyz@server");
  });

  test("falls back to a deterministic synthetic id", () => {
    const a = extractMessageId({}, "sender@x.com", "Same Subject");
    const b = extractMessageId({}, "sender@x.com", "Same Subject");
    expect(a).toBe(b);
    expect(a.startsWith("synthetic:")).toBe(true);
  });
});

describe("htmlToText", () => {
  test("strips tags and decodes basic entities", () => {
    expect(htmlToText("<p>Hello&nbsp;<b>world</b></p>")).toBe("Hello world");
  });

  test("removes script/style content", () => {
    expect(htmlToText("<style>x{}</style><p>Keep</p>")).toBe("Keep");
  });
});

describe("parseInboundEmail", () => {
  test("normalizes CloudMailin-style fields", () => {
    const result = parseInboundEmail(
      {
        from: "Brightspace <noreply@brightspace.com>",
        subject: "Week 1 Notes",
        plain: "See attached.",
        "message-id": "<m1@brightspace.com>",
      },
      []
    );
    expect(result.fromEmail).toBe("noreply@brightspace.com");
    expect(result.subject).toBe("Week 1 Notes");
    expect(result.bodyText).toBe("See attached.");
    expect(result.messageId).toBe("m1@brightspace.com");
    expect(result.attachments).toHaveLength(0);
  });

  test("defaults a missing subject", () => {
    const result = parseInboundEmail({ from: "a@b.com" }, []);
    expect(result.subject).toBe("(no subject)");
  });

  test("falls back to HTML body when no plain text", () => {
    const result = parseInboundEmail(
      { from: "a@b.com", subject: "s", html: "<p>Hi <b>there</b></p>" },
      []
    );
    expect(result.bodyText).toBe("Hi there");
  });

  test("caps an oversized body", () => {
    const huge = "a".repeat(MAX_BODY_CHARS + 500);
    const result = parseInboundEmail(
      { from: "a@b.com", subject: "s", plain: huge },
      []
    );
    expect(result.bodyText.length).toBe(MAX_BODY_CHARS);
  });

  test("normalizes CloudMailin bracketed headers[...] fields", () => {
    const result = parseInboundEmail(
      {
        "headers[from]": "Jan <janfontanilla12@gmail.com>",
        "headers[subject]": "Test",
        "headers[message_id]": "<CAKJibLe@mail.gmail.com>",
        plain: "hello",
      },
      []
    );
    expect(result.fromEmail).toBe("janfontanilla12@gmail.com");
    expect(result.subject).toBe("Test");
    expect(result.messageId).toBe("CAKJibLe@mail.gmail.com");
  });

  test("passes attachments through", () => {
    const result = parseInboundEmail({ from: "a@b.com", subject: "s" }, [
      { filename: "notes.pdf", buffer: Buffer.from("pdf") },
    ]);
    expect(result.attachments).toHaveLength(1);
    expect(result.attachments[0].filename).toBe("notes.pdf");
  });
});
