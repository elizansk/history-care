import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { Ollama } from "ollama";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "./swaggerOptions";

dotenv.config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const app = express();
const port = Number(process.env.PORT) || 3000;
const ollamaHost = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const ollamaModel = process.env.OLLAMA_MODEL || "gpt-oss:20b-cloud";

app.use(express.json());
app.use(cors());

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

type GenerateBuildingDescriptionBody = {
  name?: string;
  categories?: BuildingCategoryOption[];
};

type BuildingCategoryOption = {
  id: number;
  name: string;
};

type GenerateBuildingDescriptionResult = {
  description: string;
  category_id: number | null;
};

function extractJsonObject(text: string) {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return "";
  }

  return trimmed.slice(start, end + 1);
}

/**
 * @swagger
 * /:
 *   get:
 *     summary: Проверка AI API
 *     responses:
 *       200:
 *         description: AI API работает
 */
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "History Care AI API работает",
    ollamaHost,
    model: ollamaModel,
  });
});

/**
 * @swagger
 * /generate-building-description:
 *   post:
 *     summary: Генерация описания исторического здания
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Дом купца Гадалова
 *               categories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     name:
 *                       type: string
 *     responses:
 *       200:
 *         description: Сгенерированное описание здания и выбранная категория
 *       400:
 *         description: Не передано название здания
 *       500:
 *         description: Ошибка генерации описания
 */
app.post("/generate-building-description", async (req: Request, res: Response) => {
  const { name, categories = [] } = req.body as GenerateBuildingDescriptionBody;
  const buildingName = name?.trim();
  const categoryOptions = categories.filter((category) => Number.isFinite(category.id) && category.name?.trim());

  if (!buildingName) {
    return res.status(400).json({ error: "name обязателен" });
  }

  try {
    const ollama = new Ollama({ host: ollamaHost });

    const response = await ollama.chat({
      model: ollamaModel,
      messages: [
        {
          role: "user",
          content: `
Сгенерируй описание исторического здания для заявки на реконструкцию.

Название здания: "${buildingName}"

Доступные категории:
${JSON.stringify(categoryOptions)}

Требования:
- 4-6 предложений на русском языке;
- стиль спокойный, официальный и понятный;
- опиши архитектурную, культурную и городскую ценность здания;
- не выдумывай точные даты, владельцев и факты, если они не указаны в названии;
- выбери одну наиболее подходящую категорию из списка;
- если подходящую категорию определить нельзя, верни category_id: null;
- верни только JSON строго в формате:
{
  "description": "...",
  "category_id": 1
}
          `.trim(),
        },
      ],
    });

    const rawText = response.message.content.trim();
    const jsonText = extractJsonObject(rawText);

    if (!jsonText) {
      return res.status(500).json({ error: "Ollama вернула ответ не в JSON", raw: rawText });
    }

    const generated = JSON.parse(jsonText) as Partial<GenerateBuildingDescriptionResult>;
    const description = generated.description?.trim();
    const categoryID =
      typeof generated.category_id === "number" &&
      categoryOptions.some((category) => category.id === generated.category_id)
        ? generated.category_id
        : null;

    if (!description) {
      return res.status(500).json({ error: "Ollama вернула пустое описание", raw: rawText });
    }

    res.json({
      description,
      category_id: categoryID,
    } satisfies GenerateBuildingDescriptionResult);
  } catch (err) {
    console.error("Building description generation failed", err);
    res.status(500).json({ error: "Ошибка генерации описания здания" });
  }
});

app.listen(port, () => {
  console.log(`AI API запущен на http://localhost:${port}`);
  console.log(`Swagger UI доступен по http://localhost:${port}/swagger`);
  console.log(`Ollama: ${ollamaHost}`);
  console.log(`Model: ${ollamaModel}`);
});
