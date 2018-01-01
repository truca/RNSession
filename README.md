
This package will help you setup your session with different login providers super fast in a create-react-native-app app

Data:

the components that extend this component will have the "user" attribute in their state, it can be null or a firebase user data

Setup:

1.- Create a gmail account
2.- create a facebook account with that email (save the app secret and the AppId)
3.- Create a firebase project (save the config object)
4.- Allow authentication with email, facebook (use the previous saved app secret) and google

5.- yarn add rnsession
6.- import the default module
7.- create your component from extending the module
8.- set facebookAppId (the app id from facebook) and config (from firebase) as defaultProps to the component.

9.- Now you can use the login, register, google, facebook, logout and resetPassword

Methods

login(email, password)
register(email, password, password_confirmation)
facebook()
google()
logout()
resetPassword(email)

Props

Mandatory

facebookAppId: App Id from the facebook app
config: config object from firebase

Optional

toastPosition: { 'top' | 'bottom' } select the position of the toasts (default is 'bottom')
toastText: button text for the toats (default is 'Ok')
language: object with translations for the toast messages. Below you can find the attributes of the object for each of the messages for the toasts and the situation where those messages appear. you can translate all of the messages, some or none. the messages that are not translated will use the firebase default message in english. Example: { 'auth/empty-email': "You have to provide an email" }


Messages to translate

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
          