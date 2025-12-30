export declare const SubscriptionStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly PAST_DUE: "PAST_DUE";
    readonly CANCELED: "CANCELED";
    readonly TRIALING: "TRIALING";
    readonly PAUSED: "PAUSED";
};
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];
export declare const UserRole: {
    readonly OWNER: "OWNER";
    readonly ADMIN: "ADMIN";
    readonly DOCTOR: "DOCTOR";
    readonly STAFF: "STAFF";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
//# sourceMappingURL=enums.d.ts.map