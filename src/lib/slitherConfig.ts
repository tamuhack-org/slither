
import type { scanningForType } from "./slitherTypes";

export const scanningForOptions: {[name: string]: scanningForType} = {
    "Check-in": "Check-in",
    "Workshop": "Workshop",
    "Lunch (Saturday)": "Meal",
    "Dinner (Saturday)": "Meal",
    "Midnight Snack": "Meal",
    "Breakfast (Sunday)": "Meal",
    "Lunch (Sunday)": "Meal",
};

export const suspiciousLastScanWindows = {
    "Workshop": 1000 * 60 * 15,  // 15 minutes
    "Meal": 1000 * 60 * 60 * 2,  // 2 hours
};
