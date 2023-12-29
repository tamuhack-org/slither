
export type ObosQRCode = {
    first_name: string;
    last_name: string;
    email: string;
    university: string;
};

export type CheckinStatus = "Under Review" | "Rejected/Waitlisted" | "Admitted" | "Confirmed" | "Declined" | "Checked In" | "Expired";

export function getCheckinStatus(statusChar: string): CheckinStatus {
    switch (statusChar) {
        case "P":
            return "Under Review";
        case "R":
            return "Rejected/Waitlisted";
        case "A":
            return "Admitted";
        case "C":
            return "Confirmed";
        case "X":
            return "Declined";
        case "I":
            return "Checked In";
        case "E":
            return "Expired";
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

export type Wares = "Software" | "Hardware";

export function getWares(waresCode: string): Wares {
    switch (waresCode) {
        case "SW":
            return "Software";
        case "HW":
            return "Hardware";
        default:
            throw new Error("Invalid wares code");
    }
}

export type Participant = {
    firstName: string;
    lastName: string;
    email: string;
    university: string;

    infoFetched: boolean;
    failedToFetch: boolean;
    checkinStatus: CheckinStatus;
    wares: Wares;
    lastWorkshopScan: Date;
    mealScans: MealCode[];
    dietaryRestrictions: string;
};

export function getUnfetchedParticipant(qrCode: ObosQRCode): Participant {
    return {
        firstName: qrCode.first_name,
        lastName: qrCode.last_name,
        email: qrCode.email,
        university: qrCode.university,

        infoFetched: false,
        failedToFetch: false,
        checkinStatus: "Under Review",
        wares: "Software",
        lastWorkshopScan: new Date(0),
        mealScans: [],
        dietaryRestrictions: "[]",
    };
}

export type ScanningForType = "Check-in" | "Workshop" | "Meal";
