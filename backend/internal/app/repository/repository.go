package repository

import (
	"errors"
	"time"
)

type Building struct {
	ID          int
	Title       string
	Meta        string
	ImageKey    string
	VideoKey    string
	Description string
	Details     map[string]string
	Region      string
	Category    string
	Type        string

	GoalAmount int
	Collected  int
}

type Donation struct {
	ID         int
	BuildingID int
	Name       string
	Email      string
	Amount     int
	CreatedAt  time.Time
}

type Repository struct {
	buildings      []Building
	donations      []Donation
	nextDonationID int
}

func NewRepository() *Repository {
	baseURL := "http://localhost:9000/buildings"

	return &Repository{
		buildings: []Building{
			{
				ID:          1,
				Title:       "Дом П.М. Клементьева",
				Meta:        "г. Архангельск, ул. Володарского, д.17",
				ImageKey:    baseURL + "/klementeva.png",
				VideoKey:    baseURL + "/restavr.mp4",
				Description: "Здание принадлежало двум братьям — Кротову и Климентьеву. На первом этаже располагался известный в городе рыбный магазин «Ольга», где торговали семгой и икрой в бочках. Владелец, П.М. Климентьев, подписал официальный отказ от имущества, оставив за собой лишь две комнаты. \n\nОстальная часть дома была национализирована и отдана под коммунальное расселение. До войны в центре здания под балконом существовал сквозной проход. На первом этаже работали два магазина: молочный и рыбный. Второй этаж оставался жилым. После бомбежек 1942 года облик и использование здания претерпели изменения.",
				Details: map[string]string{
					"Статус реализации": "Решение отсутствует",
					"ID объекта":        "3450",
					"Номер ЕГРОКН":      "321310008850005",
					"Категория":         "Регионального значения",
					"Вид объекта":       "Памятник",
					"Общая площадь":     "555,1 м²",
					"Состояние":         "Неудовлетворительное",
					"Вид собственности": "Субъект РФ",
				},
				Region:     "arkhangelsk",
				Category:   "architecture",
				Type:       "house",
				GoalAmount: 100000,
				Collected:  5000,
			},
			{
				ID:          2,
				Title:       "Дом Н.М. Рубцова",
				Meta:        "Архангельская область, с. Емецк",
				ImageKey:    baseURL + "/Rubzov.png",
				VideoKey:    baseURL + "/restavr.mp4",
				Description: "Здание было построено в 1932 году. Николай Михайлович Рубцов родился здесь 3 января 1936 года. Его отец, Михаил Андрианович Рубцов, работал в Емецком райпотребсоюзе, и семье выделили комнату в этом доме. Будущий поэт прожил здесь лишь первый год своей жизни: уже в 1937 году семья переехала в город Няндома. \n\nЗдание представляет собой образец типовой советской деревянной застройки начала 1930-х годов. Двухэтажный сруб, обшитый тесом и выкрашенный в зеленый цвет.",
				Details: map[string]string{
					"Статус реализации": "Решение отсутствует",
					"ID объекта":        "3456",
					"Номер ЕГРОКН":      "291410183020005",
					"Категория":         "Регионального значения",
					"Вид объекта":       "Памятник",
					"Общая площадь":     "262,8 м²",
					"Состояние":         "Неудовлетворительное",
					"Вид собственности": "Муниципальная",
				},
				Region:     "arkhangelsk",
				Category:   "monument",
				Type:       "house",
				GoalAmount: 80000,
				Collected:  2000,
			},
			{
				ID:          3,
				Title:       "Дом И.И. Лузинова",
				Meta:        "г. Чистополь",
				ImageKey:    baseURL + "/luzinova.png",
				VideoKey:    baseURL + "/restavr.mp4",
				Description: "Историческое здание в Татарстане.",
				Details: map[string]string{
					"Статус реализации": "Конкурс объявлен",
					"ID объекта":        "3284",
					"Номер ЕГРОКН":      "161610716280005",
					"Категория":         "Регионального значения",
					"Вид объекта":       "Архитектура",
					"Общая площадь":     "1 801,6 м²",
					"Состояние":         "Неудовлетворительное",
					"Вид собственности": "Муниципальная",
				},
				Region:     "tatarsan",
				Category:   "architecture",
				Type:       "house",
				GoalAmount: 150000,
				Collected:  5000,
			},
			{
				ID:          4,
				Title:       "Дом Жигаловых",
				Meta:        "г. Великий Устюг",
				ImageKey:    baseURL + "/Gigalovih.png",
				VideoKey:    baseURL + "/restavr.mp4",
				Description: "Здание хорошо характеризует стилевое направление «модерн» и отличается художественными деталями. Заказчиком строительства и владельцем дома был Жигалов — управляющий Сухонским Пароходством (до 1917 года).\n\nЗдание было возведено в XIX веке. Внутри него находилась детская районная поликлиника. Отмечается, что главной декоративной деталью является фонарь на углу дома также в стиле модерн.",
				Details: map[string]string{
					"Статус реализации": "Подготовка к торгам",
					"ID объекта":        "1512",
					"Номер ЕГРОКН":      "351610545720005",
					"Категория":         "Регионального значения",
					"Вид объекта":       "Памятник",
					"Общая площадь":     "613 м²",
					"Состояние":         "Неудовлетворительное",
					"Вид собственности": "Субъект РФ",
				},
				Region:     "vologodskay",
				Category:   "architecture",
				Type:       "house",
				GoalAmount: 120000,
				Collected:  3000,
			},
			{
				ID:          5,
				Title:       "Усадьба Оболенских",
				Meta:        "Нижегородская область",
				ImageKey:    baseURL + "/Obolenskih.png",
				VideoKey:    baseURL + "/restavr.mp4",
				Description: "Памятник архитектуры XVIII века.",
				Details: map[string]string{
					"Статус реализации": "Конкурс объявлен",
					"ID объекта":        "3013",
					"Номер ЕГРОКН":      "521610517880005",
					"Категория":         "Регионального значения",
					"Вид объекта":       "Памятник",
					"Общая площадь":     "414,2 м²",
					"Состояние":         "Неудовлетворительное",
					"Вид собственности": "Субъект РФ",
				},
				Region:     "nizniy",
				Category:   "architecture",
				Type:       "house",
				GoalAmount: 110000,
				Collected:  10000,
			},
			{
				ID:          6,
				Title:       "Дом жилой В.М. Кулькова - П.Н. Ртищева",
				Meta:        "Ярославская область",
				ImageKey:    baseURL + "/kulkov.png",
				VideoKey:    baseURL + "/restavr.mp4",
				Description: "Исторический жилой дом.",
				Details: map[string]string{
					"Статус реализации": "Конкурс объявлен",
					"ID объекта":        "3569",
					"Номер ЕГРОКН":      "761811323100004",
					"Категория":         "Муниципального значения",
					"Вид объекта":       "Памятник",
					"Общая площадь":     "415,1 м²",
					"Состояние":         "Неудовлетворительное",
					"Вид собственности": "Субъект РФ",
				},
				Region:     "yaroslavl",
				Category:   "architecture",
				Type:       "house",
				GoalAmount: 130000,
				Collected:  7000,
			},
		},
		donations:      []Donation{},
		nextDonationID: 1,
	}
}

func (r *Repository) GetBuildings(region, category, objType string) ([]Building, error) {
	var filtered []Building
	for _, b := range r.buildings {
		if region != "" && b.Region != region {
			continue
		}
		if category != "" && b.Category != category {
			continue
		}
		if objType != "" && b.Type != objType {
			continue
		}
		filtered = append(filtered, b)
	}
	return filtered, nil
}

func (r *Repository) GetBuilding(id int) (Building, error) {
	for _, b := range r.buildings {
		if b.ID == id {
			return b, nil
		}
	}
	return Building{}, errors.New("building not found")
}
