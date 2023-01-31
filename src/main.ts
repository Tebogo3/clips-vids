import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';

import { AppModule } from './app/app.module';
import { environment } from './environments/environments';
import firebase from 'firebase/compat/app';

if (environment.production) {
  enableProdMode();
}

//connect app to firebase
firebase.initializeApp(environment.firebase)
let appInit = false
//call auth to gain access to authentication methods
firebase.auth().onAuthStateChanged(() => {
  if(!appInit){
    platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
  }
  appInit = true
})


