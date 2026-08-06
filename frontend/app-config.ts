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
  accent: '#4F46E5',
  logoDark: '/murf-logo-dark.svg',
  accentDark: '#4F46E5',
  startButtonText: 'Start Talking',

  audioVisualizerType: 'wave',
  audioVisualizerWaveLineWidth: 4,
  audioVisualizerColor: '#06B6D4',
  audioVisualizerColorDark: '#06B6D4',

  agentName: process.env.AGENT_NAME ?? undefined,
  sandboxId: undefined,
};
