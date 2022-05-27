import sqlite3 from "sqlite3";
import Failure from "../utils/Failure";
import Logger from "../utils/Logger";

const sqlite3Verbose = sqlite3.verbose();

const DBUtils = {
  error: (err: Error | null) => {
    if (err) {
      Logger.error(err.message);
    }
  },

  each: <T>(
    db: sqlite3.Database,
    query: string,
    mapRow: (row: any) => T = (row) => row
  ): Promise<T[] | Failure> => {
    return new Promise((resolve) => {
      const items: T[] = [];
      db.each(
        query,
        (err, row) =>
          err
            ? resolve(new Failure("DB.each", err.message))
            : items.push(mapRow(row)),
        (err) =>
          err ? resolve(new Failure("DB.each", err.message)) : resolve(items)
      );
    });
  },
};

export default class DB {
  static USERS_TABLE = "users";
  static FEATURES_TABLE = "features";

  _db: sqlite3.Database;

  constructor(filename: string) {
    this._db = new sqlite3Verbose.Database(filename);

    this._db.serialize(() => {
      const createUsersTableQuery = `CREATE TABLE IF NOT EXISTS ${DB.USERS_TABLE} (channel TEXT PRIMARY KEY)`;
      this._db.run(createUsersTableQuery, DBUtils.error);

      const createFeaturesTableQuery = `CREATE TABLE IF NOT EXISTS ${DB.FEATURES_TABLE} (channel TEXT, featureId TEXT, PRIMARY KEY (channel, featureId))`;
      this._db.run(createFeaturesTableQuery, DBUtils.error);
    });
  }

  async getUsers(): Promise<
    { channel: string; featureIds: string[] }[] | Failure
  > {
    const getChannelsQuery = `\
SELECT ${DB.USERS_TABLE}.channel, group_concat(${DB.FEATURES_TABLE}.featureId) AS featureIds
FROM ${DB.USERS_TABLE}
LEFT OUTER JOIN ${DB.FEATURES_TABLE} ON ${DB.USERS_TABLE}.channel = ${DB.FEATURES_TABLE}.channel
GROUP BY ${DB.FEATURES_TABLE}.channel`;
    return DBUtils.each(this._db, getChannelsQuery, (row) => ({
      channel: row.channel,
      featureIds: row.featureIds ? row.featureIds.split(",") : [],
    }));
  }

  addUser($channel: string): void {
    const insertUserQuery = `INSERT INTO ${DB.USERS_TABLE} (channel) VALUES ($channel)`;
    this._db.run(insertUserQuery, { $channel }, DBUtils.error);
  }

  removeUser($channel: string): void {
    this._db.serialize(() => {
      const removeUserQuery = `DELETE FROM ${DB.USERS_TABLE} WHERE channel = $channel`;
      this._db.run(removeUserQuery, { $channel }, DBUtils.error);

      const removeFeatureQuery = `DELETE FROM ${DB.FEATURES_TABLE} WHERE channel = $channel`;
      this._db.run(removeFeatureQuery, { $channel }, DBUtils.error);
    });
  }

  addFeatureToUser($channel: string, $featureId: string): void {
    const addFeatureQuery = `INSERT INTO ${DB.FEATURES_TABLE} (channel, featureId) VALUES ($channel, $featureId)`;
    this._db.run(addFeatureQuery, { $channel, $featureId }, DBUtils.error);
  }

  removeFeatureFromUser($channel: string, $featureId: string): void {
    const removeFeatureQuery = `DELETE FROM ${DB.FEATURES_TABLE} WHERE channel = $channel AND featureId = $featureId`;
    this._db.run(removeFeatureQuery, { $channel, $featureId }, DBUtils.error);
  }
}
