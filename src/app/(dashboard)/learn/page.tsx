import type { Metadata } from "next";

import { CryptoAcademyHome } from "@/_components/academy/crypto-academy-home";

export const metadata: Metadata = {
  title: "Academy",
  description: "Crypto Mastery curriculum and section quizzes for members.",
};

export default function LearnPage() {
  return <CryptoAcademyHome />;
}
