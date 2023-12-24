
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

export type Participant = {
    firstName: string;
    lastName: string;
    email: string;
    university: string;

    infoFetched: boolean;
    checkinStatus: CheckinStatus;
    lastWorkshopScan: Date;
    lastMealScan: Date;
    dietaryRestrictions: string;
};

export function getUnfetchedParticipant(qrCode: ObosQRCode): Participant {
    return {
        firstName: qrCode.first_name,
        lastName: qrCode.last_name,
        email: qrCode.email,
        university: qrCode.university,

        infoFetched: false,
        checkedIn: false,
        lastWorkshopScan: new Date(0),
        lastMealScan: new Date(0),
        dietaryRestrictions: "",
    };
}

export type scanningForType = "Check-in" | "Workshop" | "Meal";
