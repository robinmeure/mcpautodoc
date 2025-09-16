// Legacy types file - now using models/AccreditationModels.ts
// Re-export from the new models for backward compatibility

export type {
  AccreditationRequest as ServiceAccreditationRequest,
  StreamMessage,
  AgentMessage
} from '../models/AccreditationModels';