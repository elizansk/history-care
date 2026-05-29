const port = 3000;
export const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "History Care AI API",
            version: "1.0.0",
            description: "AI-сервис для генерации описаний исторических зданий",
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
    },
    apis: ["./src/index.ts"],
};
