import { z } from "zod";
import Failure from "../utils/Failure";
import DB from "./DB";

const CREATE_USERS_TABLE = `CREATE TABLE IF NOT EXISTS users (channel TEXT PRIMARY KEY)`;
const INSERT_USER = `INSERT INTO users (channel) VALUES ($channel)`;
const DELETE_USER_BY_CHANNEL = `DELETE FROM users WHERE channel = $channel`;

const CREATE_FEATURES_TABLE = `CREATE TABLE IF NOT EXISTS features (channel TEXT, featureId TEXT, PRIMARY KEY (channel, featureId))`;
const INSERT_FEATURE = `INSERT INTO features (channel, featureId) VALUES ($channel, $featureId)`;
const DELETE_FEATURE_BY_CHANNEL = `DELETE FROM features WHERE channel = $channel`;
const DELETE_FEATURE_BY_CHANNEL_AND_FEATURE_ID = `DELETE FROM features WHERE channel = $channel AND featureId = $featureId`;

const GET_USERS_WITH_FEATURES = `\
SELECT users.channel, group_concat(features.featureId) AS featureIds
FROM users
LEFT OUTER JOIN features ON users.channel = features.channel
GROUP BY features.channel`;

const userRowsSchema = z.array(
  z.object({
    channel: z.string(),
    featureIds: z.string(),
  })
);

export default class SubscriptionPersistence {
  _db: DB;
  _error: (message: string) => (err: Error | null) => void;

  constructor(db: DB) {
    this._db = db;
    this._error = this._db.error(`UserPersistence`);

    const handleError = this._error(`create`);
    this._db.serialize(() => {
      this._db.run(CREATE_USERS_TABLE, handleError);
      this._db.run(CREATE_FEATURES_TABLE, handleError);
    });
  }

  async getUsers(): Promise<
    { channel: string; featureIds: string[] }[] | Failure
  > {
    const result = await this._db.all(GET_USERS_WITH_FEATURES);

    if ("error" in result) {
      const message = result.error.message;
      return new Failure("SubscriptionPersistence.getUsers", message);
    }

    const userRows = userRowsSchema.parse(result.value);
    return userRows.map((row) => ({
      channel: row.channel,
      featureIds: row.featureIds.split(","),
    }));
  }

  addUser($channel: string): void {
    const handleError = this._error(`channel "${$channel}"`);

    this._db.run(INSERT_USER, { $channel }, handleError);
  }

  removeUser($channel: string): void {
    const handleError = this._error(`channel "${$channel}"`);

    this._db.serialize(() => {
      this._db.run(DELETE_USER_BY_CHANNEL, { $channel }, handleError);
      this._db.run(DELETE_FEATURE_BY_CHANNEL, { $channel }, handleError);
    });
  }

  addFeatureToUser($channel: string, $featureId: string): void {
    const message = `Channel: ${$channel} | Feature: ${$featureId}`;
    const handleError = this._error(message);

    this._db.run(INSERT_FEATURE, { $channel, $featureId }, handleError);
  }

  removeFeatureFromUser($channel: string, $featureId: string): void {
    const message = `Channel: ${$channel} | Feature: ${$featureId}`;
    const handleError = this._error(message);

    this._db.run(
      DELETE_FEATURE_BY_CHANNEL_AND_FEATURE_ID,
      { $channel, $featureId },
      handleError
    );
  }
}
