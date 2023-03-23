import { zod as z } from "../deps.ts";
import { testingAsserts as ta } from "../deps-test.ts";
import * as SQLa from "../mod.ts";
import * as mod from "./data-vault.ts";
import { unindentWhitespace as uws } from "../lib/universal/whitespace.ts";

// for convenience so that deno-lint is not required for use of `any`
// deno-lint-ignore no-explicit-any
type Any = any;

const expectType = <T>(_value: T) => {
  // Do nothing, the TypeScript compiler handles this for us
};

Deno.test("Data Vault governance", () => {
  const stso = SQLa.typicalSqlTextSupplierOptions();
  const dvg = mod.dataVaultGovn(stso);
  ta.assert(dvg);
  ta.assert(dvg.domains);
  ta.assert(dvg.names);
  ta.assert(dvg.keys);
  ta.assert(dvg.keys.ulidPrimaryKey);
  ta.assert(dvg.keys.autoIncPrimaryKey);
  ta.assert(dvg.housekeeping);
  ta.assert(dvg.table);
  ta.assert(dvg.hubTable);
  //   ta.assert(dvg.hubSatelliteTableName);
  //   ta.assert(dvg.hubSatelliteTable);
  //   ta.assert(dvg.linkTableName);
  //   ta.assert(dvg.linkTable);
  //   ta.assert(dvg.linkSatelliteTableName);
  //   ta.assert(dvg.linkSatelliteTable);
  ta.assert(dvg.tableLintRules);
});

const syntheticSchema = () => {
  const ctx = SQLa.typicalSqlEmitContext();
  const stso = SQLa.typicalSqlTextSupplierOptions<typeof ctx>();
  const dvg = mod.dataVaultGovn<typeof ctx>(stso);

  const { text, textNullable, integer, integerNullable, date } = dvg.domains;
  const { ulidPrimaryKey: primaryKey } = dvg.keys;

  const syntheticHub0 = dvg.hubTable("synthethic0", {
    hub_synthethic0_id: primaryKey(),
    business_key_text: text(),
    business_key_int: integer(),
    business_key_text_nullable: textNullable(),
    business_key_int_nullable: integerNullable(),
    ...dvg.housekeeping.columns,
  });

  const syntheticHub0Sat1 = syntheticHub0.satelliteTable("attrs1", {
    sat_synthethic0_attrs1_id: primaryKey(),
    hub_synthethic0_id: syntheticHub0.references.hub_synthethic0_id(),
    attr_text: text(),
    attr_int: integer(),
  });

  const syntheticHub1 = dvg.hubTable("synthethic1", {
    hub_synthethic1_id: primaryKey(),
    h1_bkey_int: integer(),
    h1_bkey_text: text(),
    h1_bkey_date: date(),
    h1_bkey_int_nullable: integerNullable(),
    h1_bkey_text_nullable: textNullable(),
    ...dvg.housekeeping.columns,
  });

  return {
    ctx,
    stso,
    ...dvg,
    syntheticHub0,
    syntheticHub0Sat1,
    syntheticHub1,
  };
};

Deno.test("Data Vault tables", async (tc) => {
  const schema = syntheticSchema();

  await tc.step("Synthetic Hub 0", async (innterTC) => {
    const { syntheticHub0: table, ctx } = schema;
    ta.assertEquals(table.lintIssues, []);
    ta.assertEquals(
      table.SQL(ctx),
      uws(`
        CREATE TABLE IF NOT EXISTS "hub_synthethic0" (
            "hub_synthethic0_id" TEXT PRIMARY KEY,
            "business_key_text" TEXT NOT NULL,
            "business_key_int" INTEGER NOT NULL,
            "business_key_text_nullable" TEXT,
            "business_key_int_nullable" INTEGER,
            "created_at" DATE
        )`),
    );
    type HubRecord = z.infer<typeof table.zoSchema>;
    expectType<{
      hub_synthethic0_id: string;
      business_key_text: string;
      business_key_int: number;
      created_at?: Date | undefined;
      business_key_text_nullable?: string | undefined;
      business_key_int_nullable?: number | undefined;
    }>({} as HubRecord);

    await innterTC.step("Satellite 1", () => {
      const { syntheticHub0Sat1: satTable, ctx } = schema;
      ta.assertEquals(satTable.lintIssues, []);
      ta.assertEquals(
        satTable.SQL(ctx),
        uws(`
          CREATE TABLE IF NOT EXISTS "sat_synthethic0_attrs1" (
              "sat_synthethic0_attrs1_id" TEXT PRIMARY KEY,
              "hub_synthethic0_id" TEXT NOT NULL,
              "attr_text" TEXT NOT NULL,
              "attr_int" INTEGER NOT NULL,
              "created_at" DATE,
              FOREIGN KEY("hub_synthethic0_id") REFERENCES "hub_synthethic0"("hub_synthethic0_id")
          )`),
      );
      type SatRecord = z.infer<typeof satTable.zoSchema>;
      expectType<{
        hub_synthethic0_id: string;
        sat_synthethic0_attrs1_id: string;
        attr_text: string;
        attr_int: number;
        created_at?: Date | undefined;
      }>({} as SatRecord);
    });
  });

  await tc.step("Synthetic Hub 1", () => {
    const { syntheticHub1: table, ctx } = schema;
    ta.assertEquals(table.lintIssues, []);
    ta.assertEquals(
      table.SQL(ctx),
      uws(`
        CREATE TABLE IF NOT EXISTS "hub_synthethic1" (
            "hub_synthethic1_id" TEXT PRIMARY KEY,
            "h1_bkey_int" INTEGER NOT NULL,
            "h1_bkey_text" TEXT NOT NULL,
            "h1_bkey_date" DATE NOT NULL,
            "h1_bkey_int_nullable" INTEGER,
            "h1_bkey_text_nullable" TEXT,
            "created_at" DATE
        )`),
    );
    type HubRecord = z.infer<typeof table.zoSchema>;
    expectType<{
      hub_synthethic1_id: string;
      h1_bkey_int: number;
      h1_bkey_text: string;
      h1_bkey_date: Date;
      created_at?: Date | undefined;
      h1_bkey_int_nullable?: number | undefined;
      h1_bkey_text_nullable?: string | undefined;
    }>({} as HubRecord);
  });
});
