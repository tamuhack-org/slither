
export type scanningForType = "Check-in" | "Workshop" | "Meal";

// export const scanningForOptions: {name: string, type: scanningForType}[] = [
//     {name: "Check-in", type: "Check-in"},
//     {name: "Workshop", type: "Workshop"},
//     {name: "Lunch (Saturday)", type: "Meal"},
//     {name: "Dinner (Saturday)", type: "Meal"},
//     {name: "Midnight Snack", type: "Meal"},
//     {name: "Breakfast (Sunday)", type: "Meal"},
//     {name: "Lunch (Sunday)", type: "Meal"},
// ];

export const scanningForOptions: {[name: string]: scanningForType} = {
    "Check-in": "Check-in",
    "Workshop": "Workshop",
    "Lunch (Saturday)": "Meal",
    "Dinner (Saturday)": "Meal",
    "Midnight Snack": "Meal",
    "Breakfast (Sunday)": "Meal",
    "Lunch (Sunday)": "Meal",
};
