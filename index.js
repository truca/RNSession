import React, { Component } from 'react';
import firebase from 'firebase'
import PropTypes from 'prop-types';
import { AsyncStorage } from 'react-native';
import { Toast } from 'native-base'
import R from 'ramda'


let instance = null;

class setupSingleton{  
  constructor() {
    if(!instance){
      instance = this;
      instance.setupReady = false
      instance.user = null
    }
    return instance;
  }
  setSetupReady(){
    instance.setupReady = true
    return instance.setupReady
  }
  setUser(user){
    console.log('set user')
    instance.user = user
    return instance.user 
  }
}

export default class RNSession extends Component {
  constructor(props) {
    super(props)
    if(!this.props.config){
      console.log('firebase config not provided. login will not work')
    }
    else if (firebase.apps.length === 0) {
      firebase.initializeApp(this.props.config);
    }
    let setup = new setupSingleton()
    if( !setup.setupReady ){
      this.setup()
      setup.setSetupReady()
    }
    

    
    //when changes are made on the instance's user, state should change

    var interval = setInterval(() => {
      //login
      if(setup.user && !this.state.user) this.setState({ user: setup.user })
      //logout
      else if(!setup.user && this.state.user) this.setState({ user: setup.user })
    }, 50)

    this.state = { user: setup.user, interval }
  }
  setUser(user){
    //this.setState({ user }, () => { console.log(this.state.user) })
    let setup = new setupSingleton()
    setup.setUser(user)
  }
  componentWillUnmount(){
    clearInterval(this.state.interval)
  }
  async setup(){
    console.log('setup')
    //tries to restore old sessions
    await AsyncStorage.getItem('RNS:user').then(res => {
      if(res){
        console.log("oldSessionRestored", res);
        //this.setUser(res)
        if(this.props.onOldSessionRestored) 
          this.props.onOldSessionRestored(res)
        else console.log('onOldSessionRestored not provided')
      }
    }).catch(err => {
      console.log('oldSessionRestored error', err)
    });
    
    //
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    /*.then(function() {
      // New sign-in will be persisted with local persistence.
      return firebase.auth().signInWithEmailAndPassword(email, password);
    })*/
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
    });

    //	To handle old sessions that got stuck
    firebase.auth().getRedirectResult().then(function(result) {
      //	success case will be handled with onAuthStateChanged.
      console.log('getRedirectResult', result);
    }).catch(function(error) {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log('getRedirectResult error', errorCode, errorMessage);
    });

    //handles changes on firebase session state
    firebase.auth().onAuthStateChanged(async user => {
      console.log('onAuthStateChanged', user)
      this.setUser(user)
      await AsyncStorage.setItem('RNS:user', JSON.stringify(user))
      //pedir token

      if(user && user.providerData.length === 1) {
        if(this.props.onLogin) this.props.onLogin(user)
        else console.log('onLogin not provided')
      }else{
        if(this.props.onLogout) this.props.onLogout()
        else console.log('onLogout not provided')
      }
    });
  }
  login() {
    console.log(this.state.email + ", " + this.state.pass);
    const email = this.state.email;
    const pass = this.state.pass;

    if(email === '') {
      Toast.show({ text: 
        R.pathOr('you must input your email', ['language','auth/empty-email'], this.props)
        , position: this.props.toastPosition, buttonText: this.props.toastText })
    }else if(email.indexOf('@') === -1 || email.indexOf('.') === -1) {
      Toast.show({ text:
        R.pathOr('invalid email', ['language','auth/invalid-email'], this.props)
        , position: this.props.toastPosition, buttonText: this.props.toastText })
    }else if(pass === '') {
      Toast.show({ text: 
        R.pathOr('you must input a password and the password confirmation', ['language','auth/empty-password'], this.props)
        , position: this.props.toastPosition, buttonText: this.props.toastText })
    }

    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.pass)
    .catch(error => {
      var errorCode = error.code;
      var errorMessage = error.message;
      switch(errorCode){
        case 'auth/invalid-email':
          //Thrown if the email address is not valid.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language','auth/auth/invalid-email'], this.props)
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break;
        case 'auth/user-disabled':
          //Thrown if the user corresponding to the given email has been disabled.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language','auth/auth/user-disabled'], this.props)
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break;
        case 'auth/user-not-found':
          //Thrown if there is no user corresponding to the given email.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language','auth/auth/user-not-found'], this.props)
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break;
        case 'auth/wrong-password':
          //Thrown if the password is invalid for the given email, or the account corresponding to the email does not have a password set.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language','auth/auth/wrong-password'], this.props)
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break;
      }
      console.log(error);
    })
  }
  register() {
    console.log(this.state.email + ", " + this.state.pass);
    const email = this.state.email;
    const pass = this.state.pass;
    const pass_conf = this.state.pass_confirmation;

    if(typeof email !== 'string') console.log('email not a string')
    if(typeof pass !== 'string') console.log('pass not a string')
    if(typeof pass_conf !== 'string') console.log('pass_conf not a string')
    if(email === '') {
      Toast.show({ text: 
        R.pathOr('you must input your email', ['language','auth/empty-email'], this.props)
        , position: this.props.toastPosition, buttonText: this.props.toastText })
    }else if(email.indexOf('@') === -1 || email.indexOf('.') === -1) {
      Toast.show({ text:
        R.pathOr('invalid email', ['language','auth/invalid-email'], this.props)
        , position: this.props.toastPosition, buttonText: this.props.toastText })
    }else if(pass === '' || pass_conf === '') {
      Toast.show({ text: 
        R.pathOr('you must input a password and the password confirmation', ['language','auth/empty-password-or-password-confirmation'], this.props)
        , position: this.props.toastPosition, buttonText: this.props.toastText })
    }else if(pass.length < 6) {
      Toast.show({ text: 
        R.pathOr('password is too short, it must be at least 6 characters long', ['language','auth/weak-password'], this.props)
        , position: this.props.toastPosition, buttonText: this.props.toastText })
    }else if(pass !== pass_conf) {
      Toast.show({ text: 
        R.pathOr('the password and password confirmation should be the same', ['language','auth/password-and-password-confirmation-not-equal'], this.props)
        , position: this.props.toastPosition, buttonText: this.props.toastText })
    }else {
      this.registerWithMail(email, pass);
    }
  }
  registerWithMail(email, pass) {
    firebase.auth().createUserWithEmailAndPassword(email, pass)
    .catch(error => {
      var errorCode = error.code;
      var errorMessage = error.message;
      switch(errorCode){
        case 'auth/email-already-in-use':
          //Thrown if there already exists an account with the given email address.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/email-already-in-use' ], this.props)
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break
        case 'auth/invalid-email':
          //Thrown if the email address is not valid.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/invalid-email' ], this.props)
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break
        case 'auth/operation-not-allowed':
          //Thrown if email/password accounts are not enabled. Enable email/password accounts in the Firebase Console, under the Auth tab.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/operation-not-allowed' ], this.props)
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break
        case 'auth/weak-password':
          //Thrown if the password is not strong enough.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/weak-password' ], this.props)
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break
      }
      console.log('error en registro', error)
    })
  }
  resetPassword( email ) {
    firebase.auth().sendPasswordResetEmail( email )
    .then(res => {
      console.log('sendPasswordResetEmail', res);
      Toast.show({ text: 
        R.pathOr('E-mail sended to reset password', ['language','auth/reset-successful'], this.props) 
        , position: this.props.toastPosition, buttonText: this.props.toastText })
    }).catch(error => {
      console.log('sendPasswordResetEmail error', err);
      let errorCode = error.code
      let errorMessage = error.message
      switch(errorCode){
        case 'auth/invalid-email':
          //Thrown if the email address is not valid.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/invalid-email' ], this.props) 
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break
        case 'auth/missing-android-pkg-name':
          //An Android package name must be provided if the Android app is required to be installed.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/missing-android-pkg-name' ], this.props) 
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break
        case 'auth/missing-continue-uri':
          //A continue URL must be provided in the request.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/missing-continue-uri' ], this.props) 
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break
        case 'auth/missing-ios-bundle-id':
          //An iOS Bundle ID must be provided if an App Store ID is provided.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/missing-ios-bundle-id' ], this.props) 
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break
        case 'auth/invalid-continue-uri':
          //The continue URL provided in the request is invalid.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/invalid-continue-uri' ], this.props) 
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break
        case 'auth/unauthorized-continue-uri':
          //The domain of the continue URL is not whitelisted. Whitelist the domain in the Firebase console.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/unauthorized-continue-uri' ], this.props) 
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break
        case 'auth/user-not-found':
          //Thrown if there is no user corresponding to the email address.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/user-not-found' ], this.props) 
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break
      }
    });
  }
  async google() {
    try {
      const result = await Expo.Google.logInAsync({
        androidClientId: '935866938730-5el1phcis1lvg32rpunv0lvoumfcggl5.apps.googleusercontent.com',
        iosClientId: '935866938730-npthauqju6v96ueolrp3ei77jv4j8if2.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
      });
  
      if (result.type === 'success') {
        //return result.accessToken;

        // Build Firebase credential with the Facebook access token.
        const credential = firebase.auth.GoogleAuthProvider.credential(result.idToken);
      
        console.log('credencial', credential, result)

        // Sign in with credential from the Facebook user.
        this.handleSocialErrors(firebase.auth().signInWithCredential(credential))
      } else {
        return {cancelled: true};
      }
    } catch(e) {
      return {error: true};
    }
  }
  async facebook() {
    console.log( 'facebookAppId', this.props, this.state )
    if(!this.props.facebookAppId){
      Toast.show({ text: 
        R.pathOr('Facebook login is not working currently, try another form of login', ['language', 'auth/facebook-app-id-not-provided' ], this.props)
        , position: this.props.toastPosition, buttonText: this.props.toastText })
      console.log('facebookAppId not provided')
      return
    }
    const { type, token } = await Expo.Facebook.logInWithReadPermissionsAsync(this.props.facebookAppId, {
        permissions: ['public_profile', 'email'],
      });
    console.log('return type', type)
    if (type === 'success') {
      // Get the user's name using Facebook's Graph API

      // Build Firebase credential with the Facebook access token.
      const credential = firebase.auth.FacebookAuthProvider.credential(token);
    
      // Sign in with credential from the Facebook user.
      this.handleSocialErrors(firebase.auth().signInWithCredential(credential))

      /*const response = await fetch(
        `https://graph.facebook.com/me?access_token=${token}`);
      Alert.alert(
        'Logged in!',
        `Hi ${(await response.json()).name}!`,
      );*/
      //email
      //name
      //age_range
      //gender
      //picture
      //locale
    }
  }
  handleSocialErrors(promise){
    promise
    .catch(error => {
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      switch(errorCode){
        case 'auth/account-exists-with-different-credential':
          //Thrown if there already exists an account with the email address asserted by the credential. Resolve this by calling firebase.auth.Auth#fetchProvidersForEmail and then asking the user to sign in using one of the returned providers. Once the user is signed in, the original credential can be linked to the user with firebase.User#linkWithCredential.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/account-exists-with-different-credential' ], this.props)
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break;
        case 'auth/invalid-credential':
          //Thrown if the credential is malformed or has expired.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/invalid-credential' ], this.props)
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break;
        case 'auth/operation-not-allowed':
          //Thrown if the type of account corresponding to the credential is not enabled. Enable the account type in the Firebase Console, under the Auth tab.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/operation-not-allowed' ], this.props)
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break;
        case 'auth/user-disabled':
          //Thrown if the user corresponding to the given credential has been disabled.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/user-disabled' ], this.props)
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break;
        case 'auth/user-not-found':
          //Thrown if signing in with a credential from firebase.auth.EmailAuthProvider#credential and there is no user corresponding to the given email.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/user-not-found' ], this.props)
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break;
        case 'auth/wrong-password':
          //Thrown if signing in with a credential from firebase.auth.EmailAuthProvider#credential and the password is invalid for the given email, or if the account corresponding to the email does not have a password set.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/wrong-password' ], this.props)
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break;
        case 'auth/invalid-verification-code':
          //Thrown if the credential is a firebase.auth.PhoneAuthProvider#credential and the verification code of the credential is not valid.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/invalid-verification-code' ], this.props)
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break;
        case 'auth/invalid-verification-id':
          //Thrown if the credential is a firebase.auth.PhoneAuthProvider#credential and the verification ID of the credential is not valid.
          Toast.show({ text: 
            R.pathOr(errorMessage, ['language', 'auth/invalid-verification-id' ], this.props)
            , position: this.props.toastPosition, buttonText: this.props.toastText })
          break;
      }
      console.log('error on google login', error )
    });
  }
  logout() {
    firebase.auth().signOut().then(async () => {
      console.log("Logout");
      await AsyncStorage.removeItem('RNS:user')
      //this.setUser(null)
      if(this.props.onLogout) this.props.onLogout()
      else console.log('onLogout not provided')
    }).catch(error => {
      console.log("Logout error", error);
    });
  }
  render() {
    return false
  }
}

RNSession.defaultProps = {
  toastPosition: 'bottom',
  toastText: 'Ok'
}