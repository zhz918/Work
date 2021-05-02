import firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyB_Jn2wRrHPvZznsPntWux27mhcq-WlxJA",
    authDomain: "cscuntangleff.firebaseapp.com",
    databaseURL: "https://cscuntangleff.firebaseio.com",
    projectId: "cscuntangleff",
    storageBucket: "cscuntangleff.appspot.com",
    messagingSenderId: "945433782484",
    appId: "1:945433782484:web:9a04c2f1000fdc79917341",
    measurementId: "G-NNXYWQ7SGY"
  };

firebase.initializeApp(firebaseConfig);
export default firebase;