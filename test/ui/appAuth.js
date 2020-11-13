import React, { Component } from 'react'
import { AppRegistry, StyleSheet, View, Text, Alert, TouchableOpacity } from 'react-native'
import { authorize, register } from 'react-native-app-auth';

const configGoogle = {
  issuer: 'https://accounts.google.com',
  clientId: 'GOOGLE_OAUTH_APP_GUID.apps.googleusercontent.com',
  redirectUrl: 'com.googleusercontent.apps.GOOGLE_OAUTH_APP_GUID:/oauth2redirect/google',
  scopes: ['openid', 'profile']
};

const configGithub = {
  redirectUrl: 'com.my.auth.app://oauth2redirect/github',
  clientId: '<client-id>',
  clientSecret: '<client-secret>',
  scopes: ['identity'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    revocationEndpoint:
      'https://github.com/settings/connections/applications/<client-id>'
  }
};

class App extends Component {
  state = {
    // comment this out to shoot a new one
    // ...dummyResult,
  }


  // Log in to get an authentication token
  async handleAuthorize() {
    try {
      // debugger
      let authState = await authorize(configGoogle);
      this.setState({authState})
    } catch (error) {
      Alert.alert('Failed to log in', error.message);
    }
  }

  render() {
    if (!this.state.authState)
      return (
        <View style={styles.container}>
          <TouchableOpacity onPress={() => this.handleAuthorize()} style={styles.button}>
             <Text style={styles.buttonText}>Authorize</Text>
          </TouchableOpacity>
          <View style={{height: 10}}/>
        </View>
      )
    let { accessToken, accessTokenExpirationDate, authorizeAdditionalParameters,
      tokenAdditionalParameters, idToken, refreshToken, tokenType, scopes, authorizationCode} = this.state.authState
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Access Token: {accessToken}</Text>
         <Text style={styles.text}>Access Token Expiration Date: {accessTokenExpirationDate}</Text>
         <Text style={styles.text}>Authorize Additional Parameters: {JSON.stringify(authorizeAdditionalParameters, null, 2)}</Text>
         <Text style={styles.text}>Token Additional Parameters: {JSON.stringify(tokenAdditionalParameters, null, 2)}</Text>
         <Text style={styles.text}>Id Token: {idToken}</Text>
         <Text style={styles.text}>Refresh Token {refreshToken}</Text>
         <Text style={styles.text}>Token Type {tokenType}</Text>
         <Text style={styles.text}>Scoles: {scopes}</Text>
         <Text style={styles.text}>Authorization Code: {authorizationCode}</Text>
       </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    width: 200,
    height: 100,
    backgroundColor: '#00477B',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 30,
    color: '#fff'
  },
  text: {
    fontSize: 20,
  },
})

AppRegistry.registerComponent('Tradle', () => App)
