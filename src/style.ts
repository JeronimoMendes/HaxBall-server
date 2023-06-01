export const colors = {
    red: 0xff0000,
    redSecondary: 0x8c0000,
    blue: 0x2596be,
    yellow: 0xfcba03,
    blueSecondary: 0x0e4a6f,
    green: 0x6efa6e,
    white: 0xffffff,
    blueKitMain: 0x0064C7,
    blueKitSecondary: 0x004077,
    redKitMain: 0xC70000,
    redKitSecondary: 0x770000,
}

export type Kit = {
    angle: number,
    colors: number[],
    textColor: number,
}

export const kits = {
    redDefault: {
        angle: 60,
        colors: [colors.redKitMain, colors.redKitSecondary],
        textColor: colors.white,
    },
    redGoal: {
        angle: 60,
        colors: [colors.redKitSecondary, colors.redKitMain],
        textColor: colors.white,
    },
    blueDefault: {
        angle: 60,
        colors: [colors.blueKitMain, colors.blueKitSecondary],
        textColor: colors.white,
    },
    blueGoal: {
        angle: 60,
        colors: [colors.blueKitSecondary, colors.blueKitMain],
        textColor: colors.white,
    }
}