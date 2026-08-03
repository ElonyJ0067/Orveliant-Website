"use client";

import dynamic from "next/dynamic";

/** Chat widget is below-the-fold chrome — keep it out of the first JS chunk. */
export const ChatBotLazy = dynamic(
  () => import("@/components/ChatBot").then((m) => m.ChatBot),
  { ssr: false },
);
