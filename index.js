import React, { Component } from 'react';
import firebase from 'firebase'
import PropTypes from 'prop-types';
import { AsyncStorage } from 'react-native';
import { Toast } from 'native-base'
import R from 'ramda'


let instance = null;

class SetupSingleton{  
  constructor() {
    if(!instance){
      instance = this;
      instance.setupReady = false
      instance.user = null
      instance.token = null
      instance.provider = null
    }
    return instance;
  }
  async initialize(){
    let user = await AsyncStorage.getItem('RNS:user')
    let token = await AsyncStorage.getItem('RNS:token')
    let provider = await AsyncStorage.getItem('RNS:provider')

    instance.user = user && JSON.parse(user) || null
    instance.token = token || null
    instance.provider = provider || null
  }
  setSetupReady(){
    instance.setupReady = true
    return instance.setupReady
  }
  async setUser(user){
    console.log('RNS setUser')
    instance.user = user
    await AsyncStorage.setItem('RNS:user', JSON.stringify(user))
    return instance.user 
  }
  async setToken(token){
    console.log('RNS setToken')
    instance.token = token
    await AsyncStorage.setItem('RNS:token', token)
    return instance.token 
  }
  async setProvider(provider){
    console.log('RNS setProvider')
    instance.provider = provider
    await AsyncStorage.setItem('RNS:provider', provider)
    return instance.provider 
  }
  async logout(){
    console.log('RNS logout')
    instance.user = null
    instance.token = null
    instance.provider = null
    await AsyncStorage.removeItem('RNS:user')
    await AsyncStorage.removeItem('RNS:token')
    await AsyncStorage.removeItem('RNS:provider')
  }
}

export default class RNSession extends Component {
  state = {
    user: null,
    token: null,
    provider: null,
  }
  constructor(props) {
    super(props)
    this.setup = new SetupSingleton()
    let setup = this.setup

    if(!props.config){
      if(props.logsLevel > 0) console.log('firebase config not provided. login will not work')
    }
    else if (firebase.apps.length === 0) {
      firebase.initializeApp(this.props.config);
    }
    if( !setup.setupReady ){
      this.configure()
      setup.setSetupReady()
    }
    
    //when changes are made on the instance's user, state should change

    var interval = setInterval(() => {
      if(setup.user && !this.state.user) this.setState({ user: setup.user })
      else if(!setup.user && this.state.user) this.setState({ user: setup.user })

      if(setup.token && !this.state.token) this.setState({ token: setup.token })
      else if(!setup.token && this.state.token) this.setState({ token: setup.token })

      if(setup.provider && !this.state.provider) this.setState({ provider: setup.provider })
      else if(!setup.provider && this.state.provider) this.setState({ provider: setup.provider })
    }, 50)

    this.state = { user: setup.user, interval }
  }
  setUser(user){
    if(!user) this.setup.logout()
    else this.setup.setUser(user)
  }
  setToken(token){
    this.setup.setToken(token)
  }
  setProvider(provider){
    this.setup.setProvider(provider)
  }
  componentWillUnmount(){
    clearInterval(this.state.interval)
  }
  async configure(){
    //tries to restore old sessions
    /*await AsyncStorage.getItem('RNS:user').then(res => {
      if(res){
        if(this.props.logsLevel > 2) console.log("oldSessionRestored", res);
        //this.setUser(res)
        if(this.props.onOldSessionRestored) 
          this.props.onOldSessionRestored(res)
        else if(this.props.logsLevel > 0) console.log('onOldSessionRestored not provided')
      }
    }).catch(err => {
      if(this.props.logsLevel > 1) console.log('oldSessionRestored error', err)
    });*/
    this.setup.initialize() 
    
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

    //handles changes on firebase session state
    firebase.auth().onAuthStateChanged(async user => {
      if(this.props.logsLevel > 2) console.log('onAuthStateChanged', user)
      this.setUser(user)
      //pedir token

      if(user && user.providerData.length === 1) {
        if(this.props.onLogin) this.props.onLogin(user)
        else if(this.props.logsLevel > 0) console.log('onLogin not provided')
      }else{
        if(this.props.onLogout) this.props.onLogout()
        else if(this.props.logsLevel > 0) console.log('onLogout not provided')
      }
    });
  }
  login(email, pass) {

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
    .then(res => { this.setProvider('email') })
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
      if(this.props.logsLevel > 1) console.log('signInWithEmailAndPassword error', error);
    })
  }
  register(email, pass, pass_conf) {

    if(typeof email !== 'string' && this.props.logsLevel > 1) console.log('email not a string')
    if(typeof pass !== 'string' && this.props.logsLevel > 1) console.log('pass not a string')
    if(typeof pass_conf !== 'string' && this.props.logsLevel > 1) console.log('pass_conf not a string')
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
    .then(res => { this.setProvider('email') })
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
      if(this.props.logsLevel > 1 ) console.log('register error', error)
    })
  }
  resetPassword( email ) {
    firebase.auth().sendPasswordResetEmail( email )
    .then(res => {
      if(this.props.logsLevel > 2 ) console.log('sendPasswordResetEmail', res);
      Toast.show({ text: 
        R.pathOr('E-mail sended to reset password', ['language','auth/reset-successful'], this.props) 
        , position: this.props.toastPosition, buttonText: this.props.toastText })
    }).catch(error => {
      if(this.props.logsLevel > 1 ) console.log('sendPasswordResetEmail error', err);
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
        this.setProvider('google')
        this.setToken(result.idToken)
        
        // Build Firebase credential with the Facebook access token.
        const credential = firebase.auth.GoogleAuthProvider.credential(result.idToken);
      
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
    if(!this.props.facebookAppId){
      Toast.show({ text: 
        R.pathOr('Facebook login is not working currently, try another form of login', ['language', 'auth/facebook-app-id-not-provided' ], this.props)
        , position: this.props.toastPosition, buttonText: this.props.toastText })
      if(this.props.logsLevel > 0) console.log('facebookAppId not provided')
      return
    }
    const { type, token } = await Expo.Facebook.logInWithReadPermissionsAsync(this.props.facebookAppId, {
        permissions: ['public_profile', 'email'],
      });
    if(this.props.logsLevel > 2 ) console.log('facebook return type', type)
    if (type === 'success') {
      // Get the user's name using Facebook's Graph API
      this.setProvider('facebook')
      this.setToken(token)

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
      if(this.props.logsLevel > 1 ) console.log('social error', error )
    });
  }
  logout() {
    firebase.auth().signOut().then(async () => {
      if(this.props.onLogout) this.props.onLogout()
      else if(this.props.logsLevel > 0) console.log('onLogout not provided')
    }).catch(error => {
      if(this.props.logsLevel > 1) console.log("Logout error", error);
    });
  }
  render() {
    return ''
  }
}

RNSession.propTypes = {
  config: PropTypes.object,
  facebookAppId: PropTypes.string,
  onLogin: PropTypes.func,
  onLogout: PropTypes.func,
  toastPosition: PropTypes.string,
  toastText: PropTypes.string,
  logsLevel: PropTypes.number,
}

RNSession.defaultProps = {
  toastPosition: 'bottom',
  toastText: 'Ok',
  //0: none
  //1: most important, missing props
  //2: errors
  //3: all
  logsLevel: 2,
}