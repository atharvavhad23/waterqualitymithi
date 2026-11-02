import { RequestHandler } from "express";
import { z } from "zod";
import {
  RegressionTrainRequest,
  RegressionResponse,
  ClassificationTrainRequest,
  ClassificationResponse,
  ClusteringRequest,
  ClusteringResponse,
} from "@shared/api";

// Schemas
const numberMatrix = z.array(z.array(z.number().finite()));
const regressionSchema = z.object({
  X: numberMatrix.nonempty(),
  y: z.array(z.number().finite()).nonempty(),
  predictX: numberMatrix.optional(),
});
const classificationSchema = z.object({
  X: numberMatrix.nonempty(),
  y: z.array(z.number().finite()).nonempty(),
  predictX: numberMatrix.optional(),
});
const clusteringSchema = z.object({
  X: numberMatrix.nonempty(),
  k: z.number().int().min(1),
  maxIter: z.number().int().min(1).max(1000).optional(),
});

// Handlers (placeholder logic; real models in Step 2)
export const handleRegression: RequestHandler = (req, res) => {
  const parsed = regressionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const body = parsed.data as RegressionTrainRequest;
  const predictions = body.predictX ? body.predictX.map(() => 0) : undefined;

  const response: RegressionResponse = {
    coefficients: [], // TODO: fill in Step 2
    intercept: 0, // TODO: fill in Step 2
    predictions,
    metrics: { r2: 0, rmse: 0 },
  };
  res.json(response);
};

export const handleClassification: RequestHandler = (req, res) => {
  const parsed = classificationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const body = parsed.data as ClassificationTrainRequest;
  const nPred = body.predictX?.length ?? 0;
  const response: ClassificationResponse = {
    predictions: Array.from({ length: nPred }, () => 0), // TODO: Step 2
    probabilities: nPred ? Array.from({ length: nPred }, () => [1]) : undefined, // dummy
    metrics: { accuracy: 0 },
  };
  res.json(response);
};

export const handleClustering: RequestHandler = (req, res) => {
  const parsed = clusteringSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const body = parsed.data as ClusteringRequest;
  const n = body.X.length;
  const k = body.k;

  const response: ClusteringResponse = {
    labels: Array.from({ length: n }, (_, i) => i % k), // simple round-robin
    centroids: Array.from({ length: k }, () => []), // TODO: Step 2
    inertia: 0,
  };
  res.json(response);
};
