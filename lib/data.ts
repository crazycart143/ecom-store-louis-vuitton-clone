export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    sku?: string;
    description: string;
    details: string[];
}

export const PRODUCTS: Product[] = [
    {
        id: "ss26-1",
        name: "Double Face Wool Blouson",
        category: "Men",
        image: "/images/louis-vuitton-double-face-wool-blouson--HUB84WXX9867_PM2_Front view.avif",
        price: 3200,
        sku: "HUB84WXX",
        description: "A refined blouson crafted from luxurious double face wool, offering a clean silhouette and exceptional warmth.",
        details: ["100% Wool", "Regular fit", "Double face construction", "Made in Italy"]
    },
    {
        id: "ss26-2",
        name: "Speedy 25 Bandoulière x The Darjeeling Limited",
        category: "Men",
        image: "/images/louis-vuitton-speedy-25-bandouliere-x-the-darjeeling-limited--N40857_PM2_Front view.avif",
        price: 2800,
        sku: "N40857",
        description: "Part of The Darjeeling Limited collection, the Speedy 25 Bandoulière in Damier Heritage coated canvas depicts wild animals racing through palm trees. A deeper colorway amplifies the motif, while the brown cotton-lined interior provides room for daily essentials.",
        details: ["Damier Heritage coated canvas", "Cowhide-leather trim", "Cotton lining", "Gold-color hardware", "Double zip closure", "Padlock"]
    },
    {
        id: "ss26-3",
        name: "LV Tilted Sneaker",
        category: "Men",
        image: "/images/louis-vuitton-lv-tilted-sneaker--BVU03SSC92_PM2_Front view.avif",
        price: 1200,
        sku: "BVU03SSC",
        description: "The LV Tilted sneaker features a bold, avant-garde design with a unique tilted sole and premium leather construction.",
        details: ["Calf leather", "Tilted rubber outsole", "LV Initials on the tongue", "Monogram Flowers on the outsole"]
    },
    {
        id: "ss26-4",
        name: "LV Heritage Square Sunglasses",
        category: "Men",
        image: "/images/louis-vuitton-lv-heritage-square-sunglasses--Z3192U_PM2_Front view.avif",
        price: 520,
        sku: "Z3192U",
        description: "Classic square sunglasses with a modern twist, featuring refined Louis Vuitton heritage details on the temples.",
        details: ["Acetate frame", "Square shape", "Louis Vuitton signature on temples", "100% UV protection"]
    },
    {
        id: "latest-w-1",
        name: "Alma Trunk 20",
        category: "Women",
        image: "/images/louis-vuitton-alma-trunk-20--M26784_PM2_Front view.avif",
        price: 3500,
        sku: "M26784",
        description: "A miniature trunk version of the iconic Alma bag, blending Louis Vuitton's trunk-making heritage with contemporary style.",
        details: ["Monogram canvas", "Reinforced corners", "S-lock closure", "Removable strap"]
    },
    {
        id: "latest-w-2",
        name: "LV Script Hoops PM",
        category: "Women",
        image: "/images/louis-vuitton-lv-script-hoops-pm--M03527_PM2_Front view.avif",
        price: 650,
        sku: "M03527",
        description: "Elegant hoop earrings featuring the Louis Vuitton script signature in a delicate, polished design.",
        details: ["Metal with gold-tone finish", "Louis Vuitton script signature", "Diameter: 3 cm", "PM size"]
    },
    {
        id: "latest-w-3",
        name: "Monogram Button Cardigan",
        category: "Women",
        image: "/images/louis-vuitton-monogram-button-cardigan--FUKG11SH2900_PM2_Front view.avif",
        price: 2100,
        sku: "FUKG11SH",
        description: "A cozy and chic cardigan adorned with signature Monogram buttons, perfect for layered looks.",
        details: ["Knit blend", "Monogram buttons", "Relaxed fit", "Ribbed cuffs and hem"]
    },
    {
        id: "latest-w-4",
        name: "Citizen Flat Ranger Boot",
        category: "Women",
        image: "/images/louis-vuitton-citizen-flat-ranger-boot--ASQAU4PC02_PM2_Front view.avif",
        price: 1450,
        sku: "ASQAU4PC",
        description: "Tough yet sophisticated ranger boots with a flat sole and signature LV details.",
        details: ["Calf leather", "Lace-up style", "Rubber lug outsole", "LV Initials on the side"]
    },
    {
        id: "midnight-1",
        name: "Discovery Cargo Backpack",
        category: "Men",
        image: "/images/louis-vuitton-discovery-cargo-backpack--M26765_PM2_Front view.avif",
        price: 3800,
        sku: "M26765",
        description: "A functional and stylish cargo backpack with multiple compartments, part of the Monogram Midnight collection.",
        details: ["Monogram Midnight canvas", "Leather trim", "Multiple pockets", "Adjustable straps"]
    },
    {
        id: "midnight-2",
        name: "Nil",
        category: "Men",
        image: "/images/louis-vuitton-nil--M26783_PM2_Front view.avif",
        price: 2400,
        sku: "M26783",
        description: "The Nil messenger bag is a versatile companion for daily use, featuring a compact and structured design.",
        details: ["Monogram Midnight canvas", "Crossbody strap", "Front zip pocket", "Silver-tone hardware"]
    },
    {
        id: "midnight-3",
        name: "Compact Magnet",
        category: "Men",
        image: "/images/louis-vuitton-compact-magnet--M26742_PM2_Front view.avif",
        price: 950,
        sku: "M26742",
        description: "A sleek and compact wallet with a magnetic closure, perfect for minimalists.",
        details: ["Grained leather", "Magnetic closure", "Card slots", "Bill compartment"]
    },
    {
        id: "midnight-4",
        name: "Keepall Bandoulière 25",
        category: "Men",
        image: "/images/louis-vuitton-keepall-bandouliere-25--M28369_PM2_Front view.avif",
        price: 2600,
        sku: "M28369",
        description: "The iconic Keepall in a compact 25 cm size, ideal for light travel or daily essentials.",
        details: ["Monogram Midnight canvas", "Removable strap", "Leather handles", "Double zip"]
    }
];
