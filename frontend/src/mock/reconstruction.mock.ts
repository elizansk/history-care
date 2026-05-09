export interface MockOrder {
  id: number;
  building_id: number;
  creator_id: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  total_amount: number;
  collected_amount: number;
  moderator_id: number | null;
  building: {
    id: number;
    name: string;
    description: string;
    address: string;
    category_id: number;
    category: { id: number; name: string };
    city_id: number;
    city: { id: number; name: string };
    resources: { id: number; building_id: number; resource_type: string; url: string; is_main: boolean }[];
    orders: null | any;
  };
  services: {
    id: number;
    order_id: number;
    service_id: number;
    service: {
      id: number;
      name: string;
      description: string;
      status: string;
      image_url: string;
      video_url: string;
      created_at: string;
    };
    price: number;
    description: string;
  }[];
  donations: any[];
}

// Placeholder URLs for mock data
const placeholderImage = '/placeholder-image.svg';
const placeholderVideo = '/placeholder-video.svg';

export const mockOrders: MockOrder[] = [
  {
    id: 20,
    building_id: 33,
    creator_id: 17,
    status: 'formed',
    created_at: '2026-05-06T14:50:22.12289+07:00',
    completed_at: null,
    total_amount: 250000,
    collected_amount: 0,
    moderator_id: null,
    building: {
      id: 33,
      name: 'bild',
      description: 'string',
      address: 'string',
      category_id: 9,
      category: { id: 9, name: 'Поликлиника' },
      city_id: 9,
      city: { id: 9, name: 'Самара' },
      resources: [
        {
          id: 24,
          building_id: 33,
          resource_type: 'photo',
          url: placeholderImage,
          is_main: true,
        },
        {
          id: 25,
          building_id: 33,
          resource_type: 'video',
          url: placeholderVideo,
          is_main: true,
        },
      ],
      orders: null,
    },
    services: [
      {
        id: 10,
        order_id: 20,
        service_id: 2,
        service: {
          id: 2,
          name: 'Починить крышу',
          description: 'Починить крышу полностью',
          status: 'active',
          image_url: placeholderImage,
          video_url: placeholderVideo,
          created_at: '2026-04-15T11:05:16.548118+07:00',
        },
        price: 200000,
        description: 'Крыша в очень плохом состоянии',
      },
      {
        id: 11,
        order_id: 20,
        service_id: 3,
        service: {
          id: 3,
          name: 'Починить окно',
          description: 'Починить окна полностью',
          status: 'active',
          image_url: placeholderImage,
          video_url: placeholderVideo,
          created_at: '2026-04-15T11:18:35.732698+07:00',
        },
        price: 50000,
        description: 'Окно разбито',
      },
    ],
    donations: [],
  },
  {
    id: 24,
    building_id: 37,
    creator_id: 23,
    status: 'collection_started',
    created_at: '2026-05-06T16:18:39.961511+07:00',
    completed_at: null,
    total_amount: 170000,
    collected_amount: 1000,
    moderator_id: null,
    building: {
      id: 37,
      name: 'Первый дом Норильска',
      description:
        'Первый дом Норильска построила первая геологоразведочная экспедиция Николая Урванцева летом 1921 года. В этом доме ученый-геолог, первооткрыватель норильских месторождений и один из основателей города Николай Николаевич Урванцев провел первую зимовку. Сегодня в музее представлена экспозиция, рассказывающая о быте геологической экспедиции 1923-1924 годов. Дом-музей находится рядом с основным зданием Музея Норильска. В 2017 году там же, в музейном сквере, открыли памятник Урванцеву.',
      address: 'Ленинский проспект 14',
      category_id: 1,
      category: { id: 1, name: 'Жилой дом' },
      city_id: 100,
      city: { id: 100, name: 'Норильск' },
      resources: [
        {
          id: 32,
          building_id: 37,
          resource_type: 'photo',
          url: placeholderImage,
          is_main: true,
        },
        {
          id: 33,
          building_id: 37,
          resource_type: 'photo',
          url: placeholderImage,
          is_main: false,
        },
        {
          id: 34,
          building_id: 37,
          resource_type: 'photo',
          url: placeholderImage,
          is_main: false,
        },
        {
          id: 35,
          building_id: 37,
          resource_type: 'video',
          url: placeholderVideo,
          is_main: true,
        },
        {
          id: 36,
          building_id: 37,
          resource_type: 'video',
          url: placeholderVideo,
          is_main: false,
        },
      ],
      orders: null,
    },
    services: [
      {
        id: 12,
        order_id: 24,
        service_id: 2,
        service: {
          id: 2,
          name: 'Починить крышу',
          description: 'Починить крышу полностью',
          status: 'active',
          image_url: placeholderImage,
          video_url: placeholderVideo,
          created_at: '2026-04-15T11:05:16.548118+07:00',
        },
        price: 100000,
        description: 'Крыша просела',
      },
      {
        id: 13,
        order_id: 24,
        service_id: 3,
        service: {
          id: 3,
          name: 'Починить окно',
          description: 'Починить окна полностью',
          status: 'active',
          image_url: placeholderImage,
          video_url: placeholderVideo,
          created_at: '2026-04-15T11:18:35.732698+07:00',
        },
        price: 70000,
        description: 'Окна потрескались',
      },
    ],
    donations: [
      {
        id: 1,
        order_id: 24,
        amount: 500,
        created_at: '2026-05-06T20:49:45.398669+07:00',
        name: 'Liza ',
        email: 'liza.forspam@gmail.com',
        user_id: null,
      },
      {
        id: 2,
        order_id: 24,
        amount: 500,
        created_at: '2026-05-06T21:00:37.688223+07:00',
        name: 'Liza ',
        email: 'liza.forspam@gmail.com',
        user_id: null,
      },
    ],
  },
];

export const mockCategories = [
  { id: 1, name: 'Жилой дом' },
  { id: 9, name: 'Поликлиника' },
  { id: 10, name: 'Школа' },
];

export const mockCities = [
  { id: 9, name: 'Самара' },
  { id: 100, name: 'Норильск' },
  { id: 10, name: 'Москва' },
];
