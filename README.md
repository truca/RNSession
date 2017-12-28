login

'auth/empty-email'
//Thrown if the user input is empty
'auth/empty-password'
//Thrown if the password or the password confirmation are empty

'auth/invalid-email':
//Thrown if the email address is not valid.
'auth/user-disabled':
//Thrown if the user corresponding to the given email has been disabled.
'auth/user-not-found':
//Thrown if there is no user corresponding to the given email.
'auth/wrong-password':
//Thrown if the password is invalid for the given email, or the account corresponding to the email does not have a password set.

register

'auth/empty-email'  
//Thrown if the user input is empty
'auth/empty-password-or-password-confirmation'
//Thrown if the password or the password confirmation are empty
'auth/password-and-password-confirmation-not-equal'
//Thrown if the password and the password confirmation are not equal

'auth/email-already-in-use':
//Thrown if there already exists an account with the given email address.          
'auth/invalid-email':
//Thrown if the email address is not valid.          
'auth/operation-not-allowed':
//Thrown if email/password accounts are not enabled. Enable email/password accounts in the Firebase Console, under the Auth tab.          
'auth/weak-password':
//Thrown if the password is not strong enough.  (shorter than 6 characters)        

reset password

'auth/reset-successful'
//Thrown if the reset was successful
'auth/invalid-email':
//Thrown if the email address is not valid.          
'auth/missing-android-pkg-name':
//An Android package name must be provided if the Android app is required to be installed.          
'auth/missing-continue-uri':
//A continue URL must be provided in the request.          
'auth/missing-ios-bundle-id':
//An iOS Bundle ID must be provided if an App Store ID is provided.          
'auth/invalid-continue-uri':
//The continue URL provided in the request is invalid.          
'auth/unauthorized-continue-uri':
//The domain of the continue URL is not whitelisted. Whitelist the domain in the Firebase console.          
'auth/user-not-found':
//Thrown if there is no user corresponding to the email address.          

social errors

'auth/account-exists-with-different-credential'
//Thrown if there already exists an account with the email address asserted by the credential. Resolve this by calling firebase.auth.Auth#fetchProvidersForEmail and then asking the user to sign in using one of the returned providers. Once the user is signed in, the original credential can be linked to the user with firebase.User#linkWithCredential.
'auth/invalid-credential'
//Thrown if the credential is malformed or has expired.
'auth/operation-not-allowed'
//Thrown if the type of account corresponding to the credential is not enabled. Enable the account type in the Firebase Console, under the Auth tab.
'auth/user-disabled'
//Thrown if the user corresponding to the given credential has been disabled.
'auth/user-not-found'
//Thrown if signing in with a credential from firebase.auth.EmailAuthProvider#credential and there is no user corresponding to the given email.
'auth/wrong-password'
//Thrown if signing in with a credential from firebase.auth.EmailAuthProvider#credential and the password is invalid for the given email, or if the account corresponding to the email does not have a password set.
'auth/invalid-verification-code'
//Thrown if the credential is a firebase.auth.PhoneAuthProvider#credential and the verification code of the credential is not valid.
'auth/invalid-verification-id'
//Thrown if the credential is a firebase.auth.PhoneAuthProvider#credential and the verification ID of the credential is not valid.
          