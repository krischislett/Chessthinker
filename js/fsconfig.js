/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

var config = {
  apiKey: "AIzaSyClDL2HbAy8LPSvncESFVc_2VODklwkiH8",
  authDomain: "fir-rtc-69add.firebaseapp.com",
  databaseURL: "https://fir-rtc-69add.firebaseio.com",
  projectId: "fir-rtc-69add",
  storageBucket: "fir-rtc-69add.appspot.com",
  messagingSenderId: "855828661404",
  appId: "1:855828661404:web:a5e75d5748a91505849959",
  measurementId: "G-CY9WJ5PP4S"
};
firebase.initializeApp(config);
var db = firebase.firestore();

// Google OAuth Client ID, needed to support One-tap sign-up.
// Set to null if One-tap sign-up is not supported.
var CLIENT_ID = '855828661404-ujm8ohf9mk4j9huft4vmfl6pplnbmoo2.apps.googleusercontent.com';