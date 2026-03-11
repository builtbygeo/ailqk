export const appParams = {
	appId: import.meta.env.VITE_APP_ID || 'local-app',
	token: null,
	fromUrl: typeof window !== 'undefined' ? window.location.href : '',
	functionsVersion: 'v1',
	appBaseUrl: typeof window !== 'undefined' ? window.location.origin : '',
}
