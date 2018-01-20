# React Native Session

## What is this for

This package will help you setup your session with different login providers super fast in a create-react-native-app app

## Data:

the components that extend this component will have the "user" attribute in their state, it can be null or a firebase user data

## Setup

### Facebook Setup

1. Create a gmail account
2. create a facebook account with that email
3. Create a facebook app here: https://developers.facebook.com/quickstarts/, basic configuration
3. Add the "login with facebook" product and quit the quick start
4. Go to Settings > Basic, Add host.exp.Exponent as an iOS Bundle ID. Add rRW++LUjmZZ+58EbN5DVhGAnkX4= as an Android key hash and add a package name (country.companyName.appName, i.e: us.google.maps)
5. Go to panel and save the app secret and the AppId
6. You may have to switch the app from 'development mode' to 'public mode' on the Facebook developer page before other users can log in. You can find it in App Review. (it will ask you for a privacy policy, you can build one in https://www.iubenda.com/en)

reference: [Facebook guide](https://github.com/expo/expo-docs/blob/master/versions/v24.0.0/sdk/facebook.md)

### Firebase Setup:

1. Create a firebase project (save the config object)
2. DEVELOP > Authentication: Allow authentication with email, facebook (use the previous saved app secret and app id) and google
3. Create Android and iOS Apps: Top left, click the cog and then click "project configuration". There you can create both android and iOS apps (be sure to use the same package name that you use in the step A4)
4. Click to add a web app but just copy the config object, something like:

````
var config = {
  apiKey: "apikey",
  authDomain: "asd.firebaseapp.com",
  databaseURL: "https://asd.firebaseio.com",
  projectId: "asd",
  storageBucket: "asd.appspot.com",
  messagingSenderId: "numbers"
}
````

### Project Setup

1. Create an app with XDE (Expo Development Enviroment)
2. yarn add rnsession react-native native-base
3. Restart the packager from XDE
4. Add the Register, Login and ResetPassword screen to the screen folder (change the default props to the facebook appID and the firebase config object)
5. Add those screens to the navigation (navigation/MainTabNavigator)
6. copy and paste the new App.js (Root necesario para los Toast)

After this you should be able to export the Session component and extend it in your components to get access to the following Methods

## Methods

- login(email, password): Email login with an already existing account
- register(email, password, password_confirmation): register a new email account
- facebook(): login with facebook
- google(): login with google
- logout(): logout from any active session
- resetPassword(email): if the account exists, sends an email to change the password

## Props

### Mandatory

- facebookAppId: App Id from the facebook app
- config: config object from firebase

### Optional

- toastPosition: { 'top' | 'bottom' } select the position of the toasts (default is 'bottom')
- toastText: button text for the toats (default is 'Ok')
- language: object with translations for the toast messages. Below you can find the attributes of the object for each of the messages for the toasts and the situation where those messages appear. you can translate all of the messages, some or none. the messages that are not translated will use the firebase default message in english. Example: { - 'auth/empty-email': "You have to provide an email" }
- logsLevel: { 0 | 1 | 2 | 3 }: default is 2
  - 0: won't print any log
  - 1: will only print the props that you missed, like the facebookAppId
  - 2: All the previous plus errors
  - 3: All the logs. (This adds the successful logs) 

## Contributions

- Toasts: I used the Toasts from native-base because they were easy to set-up, but they opinionate the project a lot. i would like to use a less opinionated alternative.

- Tests


## Messages to translate

### Login

- 'auth/empty-email': Thrown if the user input is empty
- 'auth/empty-password': Thrown if the password or the password confirmation are empty

- 'auth/invalid-email':: Thrown if the email address is not valid.
- 'auth/user-disabled':: Thrown if the user corresponding to the given email has been disabled.
- 'auth/user-not-found':: Thrown if there is no user corresponding to the given email.
- 'auth/wrong-password':: Thrown if the password is invalid for the given email, or the account corresponding to the email does not have a password set.

### register

- 'auth/empty-email'  : Thrown if the user input is empty
- 'auth/empty-password-or-password-confirmation': Thrown if the password or the password confirmation are empty
- 'auth/password-and-password-confirmation-not-equal': Thrown if the password and the password confirmation are not equal

- 'auth/email-already-in-use':: Thrown if there already exists an account with the given email address.          
- 'auth/invalid-email':: Thrown if the email address is not valid.          
- 'auth/operation-not-allowed':: Thrown if email/password accounts are not enabled. Enable email/password accounts in the Firebase Console, under the Auth tab.          
- 'auth/weak-password':: Thrown if the password is not strong enough.  (shorter than 6 characters)        

### reset password

- 'auth/reset-successful': Thrown if the reset was successful
- 'auth/invalid-email':: Thrown if the email address is not valid.          
- 'auth/missing-android-pkg-name':: An Android package name must be provided if the Android app is required to be installed.          
- 'auth/missing-continue-uri':: A continue URL must be provided in the request.          
- 'auth/missing-ios-bundle-id':: An iOS Bundle ID must be provided if an App Store ID is provided.          
- 'auth/invalid-continue-uri':: The continue URL provided in the request is invalid.          
- 'auth/unauthorized-continue-uri':: The domain of the continue URL is not whitelisted. Whitelist the domain in the Firebase console.          
- 'auth/user-not-found':: Thrown if there is no user corresponding to the email address.          

### social errors

- 'auth/account-exists-with-different-credential': Thrown if there already exists an account with the email address asserted by the credential. Resolve this by calling firebase.auth.Auth#fetchProvidersForEmail and then asking the user to sign in using one of the returned providers. Once the user is signed in, the original credential can be linked to the user with firebase.User#linkWithCredential.
- 'auth/invalid-credential': Thrown if the credential is malformed or has expired.
- 'auth/operation-not-allowed': Thrown if the type of account corresponding to the credential is not enabled. Enable the account type in the Firebase Console, under the Auth tab.
- 'auth/user-disabled': Thrown if the user corresponding to the given credential has been disabled.
- 'auth/user-not-found': Thrown if signing in with a credential from firebase.auth.EmailAuthProvider#credential and there is no user corresponding to the given email.
- 'auth/wrong-password': Thrown if signing in with a credential from firebase.auth.EmailAuthProvider#credential and the password is invalid for the given email, or if the account corresponding to the email does not have a password set.
- 'auth/invalid-verification-code': Thrown if the credential is a firebase.auth.PhoneAuthProvider#credential and the verification code of the credential is not valid.
- 'auth/invalid-verification-id': Thrown if the credential is a firebase.auth.PhoneAuthProvider#credential and the verification ID of the credential is not valid.
          
