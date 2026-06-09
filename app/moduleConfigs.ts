import { ProgressConfig } from './progressConfig';

export const binaryArithmeticConfig: ProgressConfig = {
  storageKey: 'binaryArithmeticProgress',
  sectionIds: ['interpreting', 'representation-formats', 'addition-subtraction', 'overflow-saturating'],
  eventName: 'binary-arithmetic-progress-updated',
  legacyKeyMap: {
    'interpreting': 'number-systems',
    'representation-formats': 'signed-integers',
    'addition-subtraction': 'addition-overflow',
    'overflow-saturating': 'precision',
  },
};

export const singleCycleConfig: ProgressConfig = {
  storageKey: 'singleCycleProgress',
  sectionIds: ['single-cycle-main'],
  eventName: 'single-cycle-progress-updated',
};

export const pipelineConfig: ProgressConfig = {
  storageKey: 'pipelineProgress',
  sectionIds: ['overview', 'stages', 'timing', 'simulation'],
  eventName: 'pipeline-progress-updated',
  legacyKeyMap: {},
};

export const machineInstructionsConfig: ProgressConfig = {
  storageKey: 'machineInstructionsProgress',
  sectionIds: [],
  eventName: 'machine-instructions-progress-updated',
  legacyKeyMap: {},
};

export const hazardsConfig: ProgressConfig = {
  storageKey: 'hazardsProgress',
  sectionIds: [],
  eventName: 'hazards-progress-updated',
  legacyKeyMap: {},
};

export const cachingConfig: ProgressConfig = {
  storageKey: 'cachingProgress',
  sectionIds: [],
  eventName: 'caching-progress-updated',
  legacyKeyMap: {},
};