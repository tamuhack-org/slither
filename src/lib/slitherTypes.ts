
export type CheckinStatus = "Under Review" | "Rejected" | "Admitted" | "Confirmed" | "Declined" | "Checked In" | "Waitlisted";

export function getCheckinStatus(statusChar: string): CheckinStatus {
    switch (statusChar) {
        case "P":
            return "Under Review";
        case "R":
            return "Rejected";
        case "A":
            return "Admitted";
        case "C":
            return "Confirmed";
        case "X":
            return "Declined";
        case "I":
            return "Checked In";
        case "E":
            return "Waitlisted";
        default:
            throw new Error("Invalid status character");
    }
}

export type MealCode = "B" | "B2" | "L" | "L2" | "D" | "MS";

export function getMealCode(mealStr: string): MealCode {
    switch (mealStr) {
        case "Breakfast (Saturday)":
            return "B";
        case "Breakfast (Sunday)":
            return "B2";
        case "Lunch (Saturday)":
            return "L";
        case "Lunch (Sunday)":
            return "L2";
        case "Dinner (Saturday)":
            return "D";
        case "Midnight Snack":
            return "MS";
        default:
            throw new Error("Invalid meal string");
    }
}

export type Wares = "Software" | "Hardware" | "Software/Hardware not set";

export function getWares(waresCode: string): Wares {
    switch (waresCode) {
        case "SW":
            return "Software";
        case "HW":
            return "Hardware";
        default:
            return "Software/Hardware not set";
    }
}

export type Participant = {
    firstName: string;
    lastName: string;
    email: string;

    infoFetched: boolean;
    failedToFetch: boolean;
    checkinStatus: CheckinStatus;
    wares: Wares;
    lastWorkshopScan: Date | null;
    mealScans: MealCode[];
    dietaryRestrictions: string;
    mealGroup: string;
};

export function getUnfetchedParticipant(email: string): Participant {
    return {
        firstName: "",
        lastName: "",
        email: email,

        infoFetched: false,
        failedToFetch: false,
        checkinStatus: "Under Review",
        wares: "Software",
        lastWorkshopScan: null,
        mealScans: [],
        dietaryRestrictions: "[]",
        mealGroup: "",
    };
}

export type ScanningForType = "Check-in" | "Workshop" | "Meal";

export type WorkshopScan = {
    first_name: string;
    last_name: string;
    email: string;
    timestamp: Date;
    selected: boolean;
};
