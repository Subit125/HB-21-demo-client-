/**
 * Google Identity Services (GSI) — Direct API Authentication
 * Uses the Google One Tap / Sign-In button without any SDK wrappers.
 * 
 * Decodes the JWT credential returned by Google to extract user info.
 * The `sub` field is used as the stable user ID (never changes, even if email changes).
 */

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/**
 * Decodes a Google JWT credential (id_token) without verifying the signature.
 * Signature verification should be done server-side; for client-side we trust
 * that Google issued the token (it's delivered directly from accounts.google.com).
 * 
 * @param {string} credential - The JWT string from Google
 * @returns {{ sub: string, email: string, name: string, picture: string, email_verified: boolean }}
 */
export function decodeGoogleJwt(credential) {
  try {
    const [, payloadB64] = credential.split('.');
    // Base64url → Base64 → JSON
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to decode Google JWT:', e);
    return null;
  }
}

/**
 * Initializes the Google Identity Services library.
 * Call this once the GSI script has been loaded (i.e., window.google is available).
 *
 * @param {function} onCredential - Callback receiving the decoded user payload on success
 * @param {string} [buttonElementId] - Optional DOM ID to render the Google Sign-In button into
 */
export function initGoogleAuth(onCredential, buttonElementId = 'google-signin-btn') {
  if (!window.google?.accounts?.id) {
    console.warn('Google GSI not loaded yet');
    return;
  }

  if (!GOOGLE_CLIENT_ID) {
    console.error('VITE_GOOGLE_CLIENT_ID is not set. Add it to your .env file.');
    return;
  }

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response) => {
      const payload = decodeGoogleJwt(response.credential);
      if (payload) {
        onCredential(payload, response.credential);
      }
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  // Render the styled Google Sign-In button
  const btnEl = document.getElementById(buttonElementId);
  if (btnEl) {
    window.google.accounts.id.renderButton(btnEl, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: btnEl.offsetWidth || 340,
    });
  }

  // Also prompt One Tap if available
  window.google.accounts.id.prompt();
}

/**
 * Manually triggers the Google OAuth2 flow using a custom button.
 * This allows for 100% custom CSS styling of the sign-in button.
 */
export function signInWithGoogleCustom(onSuccess) {
  if (!window.google?.accounts?.oauth2) {
    console.error('Google OAuth2 not loaded');
    return;
  }

  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    callback: async (response) => {
      if (response.access_token) {
        // Fetch user info using the access token
        try {
          const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` }
          });
          const userInfo = await userInfoRes.json();
          // Map to the same format as the JWT payload
          onSuccess({
            id: userInfo.sub,
            sub: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            email_verified: userInfo.email_verified
          }, response.access_token);
        } catch (e) {
          console.error('Failed to fetch user info:', e);
        }
      }
    },
  });

  client.requestAccessToken();
}

/**
 * Signs the user out of Google (revokes the session hint).
 * This does NOT sign the user out of Google's accounts — it just clears
 * the local hint so they can sign in with a different account.
 *
 * @param {string} email - The user's Google email to hint-revoke
 */
export function signOutGoogle(email) {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.revoke(email, () => {});
    window.google.accounts.id.disableAutoSelect();
  }
}
