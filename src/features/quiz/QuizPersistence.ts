import { z } from "zod";
import DB from "../../core/DB";
import Failure from "../../utils/Failure";
import { Leaderboard } from "./types";

const CREATE_SCORES_TABLE = `CREATE TABLE IF NOT EXISTS quiz_scores (channel TEXT, username TEXT, score INTEGER, PRIMARY KEY (channel, username))`;

const INSERT_SCORE = `INSERT OR REPLACE INTO quiz_scores (channel, username, score) VALUES ($channel, $username, $score)`;
const INCREMENT_SCORE = `INSERT OR REPLACE INTO quiz_scores (channel, username, score)
VALUES (
  $channel,
  $username,
  COALESCE((SELECT score FROM quiz_scores WHERE channel=$channel AND username=$username), 0) + $increment
)`;

const DELETE_SCORE = `DELETE FROM quiz_scores WHERE channel = $channel AND username = $username`;

const SELECT_CHANNEL_SCORE = `SELECT score FROM quiz_scores WHERE channel = $channel AND username = $username`;
const SELECT_GLOBAL_SCORE = `SELECT SUM(score) AS score FROM quiz_scores WHERE username = $username`;

const SELECT_CHANNEL_LEADERBOARD = `\
SELECT score, group_concat(username) AS usernames FROM quiz_scores
WHERE channel = $channel
GROUP BY score
ORDER BY score DESC
LIMIT 3`;
const SELECT_GLOBAL_LEADERBOARD = `\
SELECT score, group_concat(username) AS usernames FROM (
  SELECT username, SUM(score) AS score FROM quiz_scores
  GROUP BY username
)
GROUP BY score
ORDER BY score DESC
LIMIT 3`;

const scoreRowSchema = z
  .object({
    score: z.number(),
  })
  .default({
    score: 0,
  });

const leaderboardRowSchema = z
  .array(
    z.object({
      score: z.number(),
      usernames: z.string(),
    })
  )
  .default([]);

export default class QuizPersistence {
  _db: DB;
  _error: (message: string) => (err: Error | null) => void;

  constructor(db: DB) {
    this._db = db;
    this._error = this._db.error(`QuizPersistence`);

    const handleError = this._error(`create`);
    this._db.run(CREATE_SCORES_TABLE, handleError);
  }

  setScore($channel: string, $username: string, $score: number): void {
    const message = `channel "${$channel}" | username "${$username}"`;
    const handleError = this._error(message);

    this._db.run(INSERT_SCORE, { $channel, $username, $score }, handleError);
  }

  incrementScore(
    $channel: string,
    $username: string,
    $increment: number
  ): void {
    const message = `channel "${$channel}" | username "${$username}"`;
    const handleError = this._error(message);

    this._db.run(
      INCREMENT_SCORE,
      { $channel, $username, $increment },
      handleError
    );
  }

  deleteScore($channel: string, $username: string): void {
    const message = `channel "${$channel}" | username "${$username}"`;
    const handleError = this._error(message);

    this._db.run(DELETE_SCORE, { $channel, $username }, handleError);
  }

  async getChannelScore(
    $username: string,
    $channel: string
  ): Promise<number | Failure> {
    return this._getScore(SELECT_CHANNEL_SCORE, { $username, $channel });
  }

  async getGlobalScore($username: string): Promise<number | Failure> {
    return this._getScore(SELECT_GLOBAL_SCORE, { $username });
  }

  async getChannelLeaderboard(
    $channel: string
  ): Promise<Leaderboard | Failure> {
    return this._getLeaderboard(SELECT_CHANNEL_LEADERBOARD, { $channel });
  }

  async getGlobalLeaderboard(): Promise<Leaderboard | Failure> {
    return this._getLeaderboard(SELECT_GLOBAL_LEADERBOARD, {});
  }

  private async _getScore(
    query: string,
    params: Record<string, string>
  ): Promise<number | Failure> {
    const result = await this._db.get(query, params);
    if ("error" in result) {
      const message = result.error.message;
      return new Failure("QuizPersistence.getScore", message);
    }

    const scoreRow = scoreRowSchema.parse(result.value);
    return scoreRow.score;
  }

  private async _getLeaderboard(
    query: string,
    params: Record<string, string>
  ): Promise<Leaderboard | Failure> {
    const result = await this._db.all(query, params);
    if ("error" in result) {
      const message = result.error.message;
      return new Failure("QuizPersistence.getLeaderboard", message);
    }

    const scoreRow = leaderboardRowSchema.parse(result.value);
    return {
      positions: scoreRow.map((row) => ({
        score: row.score,
        usernames: row.usernames.split(","),
      })),
    };
  }
}
