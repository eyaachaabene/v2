export const mockFarmData = {
  totalCrops: 12,
  activeSales: 8,
  monthlyRevenue: 15420,
  pendingOrders: 5,
}

export const mockCrops = [
  {
    id: 1,
    name: "Organic Tomatoes",
    quantity: "500 kg",
    price: "$3.50/kg",
    status: "Available",
    image: "/organic-tomatoes.png",
  },
  {
    id: 2,
    name: "Fresh Lettuce",
    quantity: "200 kg",
    price: "$2.20/kg",
    status: "Low Stock",
    image: "/fresh-lettuce.png",
  },
  {
    id: 3,
    name: "Sweet Corn",
    quantity: "800 kg",
    price: "$1.80/kg",
    status: "Available",
    image: "/sweet-corn.png",
  },
]

export const mockOrders = [
  {
    id: "ORD-001",
    buyer: "Green Market Co.",
    items: "Organic Tomatoes (50kg)",
    amount: "$175.00",
    status: "Pending",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    buyer: "Fresh Foods Ltd.",
    items: "Fresh Lettuce (30kg)",
    amount: "$66.00",
    status: "Confirmed",
    date: "2024-01-14",
  },
  {
    id: "ORD-003",
    buyer: "Local Restaurant",
    items: "Sweet Corn (25kg)",
    amount: "$45.00",
    status: "Delivered",
    date: "2024-01-13",
  },
]

export const mockMarketplaceItems = [
  {
    id: 1,
    name: "Premium Organic Apples",
    farmer: "John's Orchard",
    price: "$4.50/kg",
    location: "California",
    rating: 4.8,
    image: "/organic-apples.png",
  },
  {
    id: 2,
    name: "Fresh Strawberries",
    farmer: "Berry Farm Co.",
    price: "$6.20/kg",
    location: "Oregon",
    rating: 4.9,
    image: "/fresh-strawberries.png",
  },
  {
    id: 3,
    name: "Organic Carrots",
    farmer: "Green Valley Farm",
    price: "$2.80/kg",
    location: "Washington",
    rating: 4.7,
    image: "/organic-carrots.png",
  },
]
