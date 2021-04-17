
///?????????test connectivity??????????????????
//var docRef = db.doc("users/Linj888");
//docRef.get().then(function(doc) {
//    if (doc.exists) {
//        const userData = doc.data();
//        console.log(userData.uscfid);
//        console.log(userData.rating);
//        console.log(userData.name);
//    } else {
//        console.log("No such document!");
//    }
//    }).catch(function(error) {
//        console.log("Error getting document:", error);
//});

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log("g2>>User ID: " + user.uid + ", Provider: " + user.provider);
    } else {
        console.log("g2>>No user currently signed in.");
    }
});