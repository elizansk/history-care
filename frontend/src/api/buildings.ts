export async function createBuilding(formData: FormData) {//Функция принимает FormData  объект для отправки файлов
    const res = await fetch("/api/buildings", {//запрос на бекенд
        method: "POST",
        body: formData,
        credentials: "include",//Отправляет cookies (если есть session auth)
    });

    const data = await res.json();// JSON-ответ от сервера
    if (!res.ok) {
        throw new Error(data?.error || "Failed to create building");
    }

    return data as { id?: number; ID?: number };//Возвращаем созданное здание
}