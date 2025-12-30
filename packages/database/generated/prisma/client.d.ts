import * as runtime from "@prisma/client/runtime/client";
import * as $Class from "./internal/class.js";
import * as Prisma from "./internal/prismaNamespace.js";
export * as $Enums from './enums.js';
export * from "./enums.js";
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Plans
 * const plans = await prisma.plan.findMany()
 * ```
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export declare const PrismaClient: $Class.PrismaClientConstructor;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
/**
 * Model Plan
 *
 */
export type Plan = Prisma.PlanModel;
/**
 * Model Subscription
 *
 */
export type Subscription = Prisma.SubscriptionModel;
/**
 * Model Tenant
 *
 */
export type Tenant = Prisma.TenantModel;
/**
 * Model User
 *
 */
export type User = Prisma.UserModel;
/**
 * Model Patient
 *
 */
export type Patient = Prisma.PatientModel;
/**
 * Model Doctor
 *
 */
export type Doctor = Prisma.DoctorModel;
/**
 * Model RefreshToken
 *
 */
export type RefreshToken = Prisma.RefreshTokenModel;
//# sourceMappingURL=client.d.ts.map