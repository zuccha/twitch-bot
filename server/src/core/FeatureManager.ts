import QuizFeature from "../features/quiz/QuizFeature";
import TestFeature from "../features/test/TestFeature";
import Collection from "../utils/Collection";
import Failure from "../utils/Failure";
import { Config } from "./Config";
import DB from "./DB";
import { GenericNotification, Notifier } from "./types";

const SUPPORTED_FEATURES = [QuizFeature, TestFeature] as const;

export type SupportedFeature = QuizFeature | TestFeature;

export default class FeatureManager {
  private _features: Collection<SupportedFeature>;

  constructor(config: Config, notifier: Notifier<GenericNotification>, db: DB) {
    this._features = new Collection();

    SUPPORTED_FEATURES.forEach((Feature) => {
      const feature = new Feature(config, notifier, db);
      this._features.add(feature.id, feature);
    });
  }

  get(id: string): SupportedFeature | undefined {
    return this._features.get(id);
  }

  forEach(callback: (feature: SupportedFeature) => void) {
    this._features.forEach(callback);
  }

  async setup(): Promise<Failure | undefined> {
    const results = await Promise.all(
      this._features.map((feature) => feature.setup())
    );
    return results.find((result) => result instanceof Failure);
  }
}
