"use client";

import { useState } from "react";

const messages = [
  "Page not found. It probably took a coffee break.",
  "Page not found. It wandered off to learn a new framework.",
  "Page not found. It's probably refactoring itself.",
  "Page not found. This route doesn't exist… yet.",
  "Page not found. The page you're looking for is undefined.",
  "Page not found. It's out chasing a missing semicolon.",
  "Page not found. It went to go fix a merge conflict.",
];

function randomMessage() {
  return messages[Math.floor(Math.random() * messages.length)];
}

type Props = {
  className?: string;
};

export default function NotFoundMessage({ className }: Props) {
  // Picked once on mount via a lazy initializer (not during every render).
  // The server and client may pick different lines, which is purely cosmetic
  // on a 404 — suppressHydrationWarning silences the expected text mismatch.
  const [message] = useState(randomMessage);

  return (
    <p className={className} suppressHydrationWarning>
      {message}
    </p>
  );
}
