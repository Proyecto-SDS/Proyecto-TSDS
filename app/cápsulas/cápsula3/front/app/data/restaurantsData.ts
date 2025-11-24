// Datos de restaurantes para la aplicación ReservaYa

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

export interface RestaurantData {
  id: number;
  name: string;
  type: string;
  rating: number;
  hours: string;
  address: string;
  description: string;
  menuItems: MenuItem[];
}

export const restaurantsData: Record<number, RestaurantData> = {
  1: {
    id: 1,
    name: "King Halo",
    type: "Restaurante",
    rating: 4.8,
    hours: "11:00 AM - 10:00 PM",
    address: "Av. Principal 123, Centro",
    description:
      "Restaurante de cocina internacional con los mejores platos del mundo",
    menuItems: [
      {
        id: 1,
        name: "Paella Valenciana",
        description: "Arroz con mariscos frescos, azafrán y vegetales",
        price: 45.0,
        category: "Platos Principales",
        image: "paella seafood",
      },
      {
        id: 2,
        name: "Cerveza Artesanal",
        description: "Cerveza local IPA 500ml",
        price: 12.0,
        category: "Bebidas",
        image: "craft beer glass",
      },
      {
        id: 3,
        name: "Tabla de Mariscos",
        description: "Variedad de mariscos frescos para compartir",
        price: 38.0,
        category: "Entradas",
        image: "seafood platter",
      },
      {
        id: 4,
        name: "Pulpo a la Gallega",
        description: "Pulpo tierno con papas y pimentón",
        price: 32.0,
        category: "Platos Principales",
        image: "octopus dish",
      },
    ],
  },
  2: {
    id: 2,
    name: "La Paella Real",
    type: "Restobar",
    rating: 4.6,
    hours: "12:00 PM - 11:00 PM",
    address: "Calle España 456, Miraflores",
    description:
      "Restobar español con las mejores paellas y tapas de la ciudad",
    menuItems: [
      {
        id: 1,
        name: "Paella Mixta",
        description: "Arroz con pollo, mariscos y chorizo español",
        price: 42.0,
        category: "Platos Principales",
        image: "paella mixed",
      },
      {
        id: 2,
        name: "Sangría de la Casa",
        description: "Vino tinto con frutas frescas - 1 litro",
        price: 28.0,
        category: "Bebidas",
        image: "sangria pitcher",
      },
      {
        id: 3,
        name: "Jamón Ibérico",
        description: "Jamón curado con pan y tomate",
        price: 35.0,
        category: "Entradas",
        image: "iberian ham",
      },
      {
        id: 4,
        name: "Patatas Bravas",
        description: "Papas crujientes con salsa brava",
        price: 18.0,
        category: "Entradas",
        image: "patatas bravas",
      },
    ],
  },
  3: {
    id: 3,
    name: "Café del Mar",
    type: "Cafetería",
    rating: 4.9,
    hours: "8:00 AM - 8:00 PM",
    address: "Malecón Costa Verde 789, Barranco",
    description:
      "Cafetería con vista al mar, especialidad en café de altura y repostería artesanal",
    menuItems: [
      {
        id: 1,
        name: "Cappuccino Premium",
        description: "Café espresso con leche vaporizada y espuma",
        price: 12.0,
        category: "Bebidas Calientes",
        image: "cappuccino art",
      },
      {
        id: 2,
        name: "Croissant de Almendras",
        description: "Croissant francés relleno de crema de almendras",
        price: 8.0,
        category: "Repostería",
        image: "almond croissant",
      },
      {
        id: 3,
        name: "Frappé de Caramelo",
        description: "Bebida helada con café, caramelo y crema",
        price: 15.0,
        category: "Bebidas Frías",
        image: "caramel frappe",
      },
      {
        id: 4,
        name: "Tostadas Francesas",
        description: "Pan brioche con frutas y miel de maple",
        price: 22.0,
        category: "Desayunos",
        image: "french toast",
      },
    ],
  },
  4: {
    id: 4,
    name: "El Cóndor Pasa",
    type: "Restaurante",
    rating: 4.7,
    hours: "12:00 PM - 10:00 PM",
    address: "Jr. Ancash 234, Centro Histórico",
    description:
      "Auténtico restaurante peruano con lo mejor de la gastronomía andina y criolla",
    menuItems: [
      {
        id: 1,
        name: "Ceviche Clásico",
        description: "Pescado fresco en leche de tigre con camote y choclo",
        price: 35.0,
        category: "Entradas",
        image: "peruvian ceviche",
      },
      {
        id: 2,
        name: "Lomo Saltado",
        description: "Carne de res salteada con cebolla, tomate y papas fritas",
        price: 38.0,
        category: "Platos Principales",
        image: "lomo saltado",
      },
      {
        id: 3,
        name: "Ají de Gallina",
        description: "Pollo deshilachado en salsa de ají amarillo con arroz",
        price: 32.0,
        category: "Platos Principales",
        image: "aji de gallina",
      },
      {
        id: 4,
        name: "Chicha Morada",
        description: "Bebida tradicional de maíz morado con frutas",
        price: 8.0,
        category: "Bebidas",
        image: "chicha morada",
      },
      {
        id: 5,
        name: "Anticuchos de Corazón",
        description: "Brochetas de corazón marinadas con papas y choclo",
        price: 28.0,
        category: "Entradas",
        image: "anticuchos",
      },
      {
        id: 6,
        name: "Pisco Sour",
        description: "Cóctel tradicional peruano con pisco, limón y clara",
        price: 18.0,
        category: "Bebidas",
        image: "pisco sour",
      },
    ],
  },
  5: {
    id: 5,
    name: "Manhattan Caffe",
    type: "Cafetería",
    rating: 4.8,
    hours: "7:00 AM - 9:00 PM",
    address: "Av. Arequipa 567, San Isidro",
    description:
      "Cafetería urbana estilo neoyorquino con café de especialidad y brunch todo el día",
    menuItems: [
      {
        id: 1,
        name: "Flat White",
        description: "Espresso doble con microespuma de leche sedosa",
        price: 14.0,
        category: "Bebidas Calientes",
        image: "flat white",
      },
      {
        id: 2,
        name: "New York Cheesecake",
        description:
          "Tarta de queso cremosa estilo Nueva York con coulis de frutos rojos",
        price: 16.0,
        category: "Postres",
        image: "new york cheesecake",
      },
      {
        id: 3,
        name: "Bagel Manhattan",
        description: "Bagel con salmón ahumado, queso crema y alcaparras",
        price: 24.0,
        category: "Brunch",
        image: "bagel salmon",
      },
      {
        id: 4,
        name: "Iced Latte Caramelo",
        description: "Café latte frío con caramelo y leche de avena",
        price: 16.0,
        category: "Bebidas Frías",
        image: "iced caramel latte",
      },
      {
        id: 5,
        name: "Pancakes Americanos",
        description: "Torre de pancakes con maple, mantequilla y frutos rojos",
        price: 26.0,
        category: "Brunch",
        image: "american pancakes",
      },
      {
        id: 6,
        name: "Cold Brew",
        description: "Café extraído en frío por 18 horas, servido con hielo",
        price: 13.0,
        category: "Bebidas Frías",
        image: "cold brew coffee",
      },
    ],
  },
};

// Función helper para obtener datos de un restaurante
export function getRestaurantData(id: number | null): RestaurantData | null {
  if (!id || !restaurantsData[id]) return null;
  return restaurantsData[id];
}
