export async function createBuilding(formData: FormData) {
    const res = await fetch("/api/buildings", {
        method: "POST",
        body: formData,
        credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data?.error || "Failed to create building");
    }

    return data as { id?: number; ID?: number };
}