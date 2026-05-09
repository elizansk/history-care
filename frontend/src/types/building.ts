export interface CreateBuildingForm {
    name: string;
    description?: string;
    address: string;
    category_id: number;
    city_id?: number;
}