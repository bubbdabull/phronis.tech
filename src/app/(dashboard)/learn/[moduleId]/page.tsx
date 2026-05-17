import type { Metadata } from "next";

import { CryptoModuleQuiz } from "@/_components/academy/crypto-module-quiz";

type Props = { params: Promise<{ moduleId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moduleId } = await params;
  return {
    title: `Academy · ${moduleId}`,
    description: "Section reading outline and multiple-choice quiz.",
  };
}

export default async function LearnModulePage({ params }: Props) {
  const { moduleId } = await params;
  return <CryptoModuleQuiz moduleId={moduleId} />;
}
