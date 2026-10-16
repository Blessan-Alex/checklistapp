import caseDino from "./case-dino.json";
import caseSophy from "./case-sophy.json";
import type { Case } from "@/lib/types";

export const MOCK_CASE_FIXTURES: Case[] = [
  caseDino as Case,
  caseSophy as Case,
];

export { caseDino, caseSophy };
