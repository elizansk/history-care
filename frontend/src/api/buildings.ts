import axios from 'axios';

export async function createBuilding(formData: FormData) {//Функция принимает FormData  объект для отправки файлов
    try {
        const { data } = await axios.post<{ id?: number; ID?: number }>("/api/buildings", formData, {//запрос на бекенд
            withCredentials: true,//Отправляет cookies (если есть session auth)
        });
        return data;//Возвращаем созданное здание
    } catch (error) {
        if (axios.isAxiosError<{ error?: string }>(error)) {
            throw new Error(error.response?.data?.error || "Failed to create building");
        }
        throw error;
    }
}
