export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  startButtonText: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;

  audioVisualizerType?: 'bar' | 'wave' | 'grid' | 'radial' | 'aura';
  audioVisualizerColor?: `#${string}`;
  audioVisualizerColorDark?: `#${string}`;
  audioVisualizerColorShift?: number;
  audioVisualizerBarCount?: number;
  audioVisualizerGridRowCount?: number;
  audioVisualizerGridColumnCount?: number;
  audioVisualizerRadialBarCount?: number;
  audioVisualizerRadialRadius?: number;
  audioVisualizerWaveLineWidth?: number;

  // agent dispatch configuration
  agentName?: string;

  // LiveKit Cloud Sandbox configuration
  sandboxId?: string;
}

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'FinVoice AI',
  pageTitle: 'FinVoice AI | Your Intelligent Voice Financial Companion',
  pageDescription: 'Manage money naturally through AI conversations.',

  supportsChatInput: false,
  supportsVideoInput: false,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,

  logo: '/murf-logo.svg',
  accent: '#8B5CF6',
  logoDark: '/murf-logo-dark.svg',
  accentDark: '#8B5CF6',
  startButtonText: 'Start Talking',

  audioVisualizerType: 'aura',
  audioVisualizerWaveLineWidth: 3,
  audioVisualizerColor: '#8B5CF6',
  audioVisualizerColorDark: '#8B5CF6',

  agentName: process.env.AGENT_NAME ?? undefined,
  sandboxId: undefined,
};
