import "dotenv/config";
import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const MOCK_AI = String(process.env.MOCK_AI || "false").toLowerCase() === "true";

export async function aiJSON({
  system,
  user,
  schema, // { name, schema }
}: {
  system: string;
  user: string;
  schema: { name: string; schema: any };
}) {
  if (MOCK_AI) {
    return {
      title: "Mocked Fusion Bowl",
      servings: 2,
      timeMinutes: 20,
      ingredients: ["200 g tofu", "1 cup rice", "2 tbsp sauce"],
      steps: ["Cook rice", "Sear tofu", "Combine"],
      substitutions: ["Tofu → chicken"],
      tags: ["mock", "dev"],
      nutrition: { calories: 520, protein_g: 24, fat_g: 15, carbs_g: 70 },
      imageUrl: "/uploads/mock.png"
    };
  }
  console.log(schema, user, system);

  const resp = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: [{ type: "input_text", text: system }] },
      { role: "user", content: [{ type: "input_text", text: user }] }
    ],
    text: { format: { type: "json_schema", name: schema.name, schema: schema.schema } }
  });

  let text = (resp as any).output_text as string | undefined;
  if (!text) {
    const outputs = (resp as any).output ?? [];
    const parts = outputs.flatMap((o: any) => o?.content ?? []);
    const firstText = parts.find((p: any) => p?.type === "output_text" || p?.type === "summary_text");
    text = firstText?.text;
  }
  if (!text) throw new Error("No text returned from model.");
  return JSON.parse(text);
}
