export {}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: google.accounts.oauth2.TokenResponse) => void
            error_callback?: (
              error: google.accounts.oauth2.ErrorResponse
            ) => void
          }) => google.accounts.oauth2.TokenClient
          revoke: (token: string, callback?: () => void) => void
        }
      }
    }
  }

  namespace google {
    namespace accounts {
      namespace oauth2 {
        interface TokenClient {
          requestAccessToken: (overrideConfig?: {
            prompt?: '' | 'none' | 'consent' | 'select_account'
          }) => void
        }

        interface TokenResponse {
          access_token: string
          expires_in: number
          scope: string
          token_type: string
          error?: string
          error_description?: string
        }

        interface ErrorResponse {
          type: string
          message?: string
        }
      }
    }
  }
}
