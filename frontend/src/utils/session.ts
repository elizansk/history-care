export function clearCreateOrderSession() {//Функция очищает данные создания заявки из sessionStorage
  const keys = [
    "buildingId",
    "orderId",
    "buildingData",
    "buildingName",
    "buildingDescription",
    "buildingAddress",
    "buildingCategoryId",
    "buildingCityId",
    "orderTotal",
    "orderDescription",
    "selectedServices",
  ];
  keys.forEach((key) => sessionStorage.removeItem(key));
}

export function clearUserFiltersSession() {//Очищает фильтры пользователя.
  const filterKeys = ["filters", "buildingFilters"];
  filterKeys.forEach((key) => sessionStorage.removeItem(key));
}
