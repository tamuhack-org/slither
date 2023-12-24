
export type ObosQRCode = {
    first_name: string;
    last_name: string;
    email: string;
    university: string;
};

export type Participant = {
    firstName: string;
    lastName: string;
    email: string;
    university: string;

    infoFetched: boolean;
    checkedIn: boolean;
    lastWorkshopScan: Date;
    lastMealScan: Date;
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
    };
}

export type scanningForType = "Check-in" | "Workshop" | "Meal";
