// ML: Regression
export interface RegressionTrainRequest {
  X: number[][];
  y: number[];
  predictX?: number[][];
}

export interface RegressionResponse {
  coefficients?: number[];
  intercept?: number;
  predictions?: number[];
  metrics?: {
    r2?: number;
    rmse?: number;
  };
}

// ML: Classification
export interface ClassificationTrainRequest {
  X: number[][];
  y: number[]; // numeric labels for simplicity
  predictX?: number[][];
}

export interface ClassificationResponse {
  predictions: number[];
  probabilities?: number[][];
  metrics?: {
    accuracy?: number;
  };
}

// ML: Clustering
export interface ClusteringRequest {
  X: number[][];
  k: number; // number of clusters
  maxIter?: number;
}

export interface ClusteringResponse {
  labels: number[];
  centroids: number[][];
  inertia?: number;
}
