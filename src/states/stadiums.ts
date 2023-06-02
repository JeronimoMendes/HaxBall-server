export type PitchDimensions = {
    width: number;
    height: number;
    goalWidth: number;
    penaltyBoxWidth: number;
    penaltyBoxHeight: number;
};

export const dimensions = {
    "1v1": {
        width: 800,
        height: 402,
        goalWidth: 140,
        penaltyBoxWidth: 60,
        penaltyBoxHeight: 200,
    }, 
    "2v2": {
        width: 800,
        height: 402,
        goalWidth: 140,
        penaltyBoxWidth: 60,
        penaltyBoxHeight: 200,
    },
    "3v3": {
        width: 1100,
        height: 482,
        goalWidth: 160,
        penaltyBoxWidth: 60,
        penaltyBoxHeight: 250,
    },
    "4v4": {
        width: 1402,
        height: 640,
        goalWidth: 170,
        penaltyBoxWidth: 75,
        penaltyBoxHeight: 260,
    },
}
