
import type { ScanningForType } from "./slitherTypes";

export const scanningForOptions: {[name: string]: ScanningForType} = {
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
};
