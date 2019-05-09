const functions = require('firebase-functions');
const cors = require('cors')({origin: true})   //Library for Cross Origin Resource Sharing in browser
const admin = require('firebase-admin')
var GeoFirestore = require("geofirestore").GeoFirestore;   //Firestore Wrapper for geoquerying

var serviceAccount = require('./serviceAccountKey.json');  //Firebase project init
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)       //Get firebase acc credenitials to init firebase project
});


const defaultFirestore = admin.firestore();  // Reference to Firestore 
const  geoFirestore = new GeoFirestore(defaultFirestore); // Create a Firestore reference for Geofirestore 
const geoCollection = geoFirestore.collection('trees');  // Create a Collection reference 


exports.postData = functions.https.onRequest((req, res)=>{
    cors(req, res, ()=>{
   
   
   
   
       if(req.method === 'POST'){
   
           var lat = Number(req.body.lat);
           var long = Number(req.body.long);
  
       
           geoCollection.add( { 
              info: {
               genericName: req.body.generic_name,
               scientificName: req.body.scientific_name,
               type: req.body.type,
               leafStructure: req.body.leaf_structure,
               rootStructure: req.body.root_structure,
               age: req.body.age,
               flower: req.body.flower,
               fruit: req.body.fruit,
              },
              healthChecks: {
               cutBranches: req.body.cut_branches,  //Do you see broken or cut branches.
               sap: req.body.sap,                    //Do you see sap oozing out from the tree trunk.
               branchCrack: req.body.cracked_branches,   //Do you see holes or cracks in the branches or tree.
               brownmud: req.body.brownmud, //Brown mud like deposit on the tree or the trunk.
               tumours: req.body.tumours, //Tumors, bulges or swellings noticed on the trunk or branches.
               fungus: req.body.fungus,  //Fungus visible on the branches or on the trunk.
               wilting: req.body.wilting,  //Curling wilting or dis-colourisation notice in the leaves.
               saprophyte: req.body.saprophyte,  //Saprophyte or epiphyte growing on the tree.
               fire: req.body.fire,  //Signs of fire being burnt near the tree. (anywhere under the canopy of the tree)
               stripped: req.body.stripped,  //Outermost layer of the tree trunk stripped.
               construction: req.body.construction, //Perimeter or construction built around the tree.
               branchesCut: req.body.branchesCut,  //Branches cut for electrical wires
              },
              environmentalRisks: {
               overgrownBranches: req.body.overgrownBranches,  //Overgrown branches close to electric/telephone wires.
               cutTrees: req.body.cutTrees, //Signs of other trees being cut down in the area.
               landBurn: req.body.landBurn, //Land being cleared by burning.
               highway: req.body.highway,  //Tree on a highway stretch.
               industrial: req.body.industrial,  //Trees located near industrial lands.
               publicLand: req.body.publicLand, //Tree on public land.
               widened: req.body.widened, //Tree on an inner road likely to be widened.
               inhabitedPrivate: req.body.inhabitedPrivate,  //Tree in an inhabited private property.
               uninhabitedPrivate: req.body.uninhabitedPrivate,  //Tree in an habited private property.
               centerProperty: req.body.centerProperty,  //Tree located in the center of the property
               perimeterProperty: req.body.perimeterProperty, //Tree located at the perimeter of the property.
               forest: req.body.forest,  //Tree in a forest.
              },
               coordinates: new admin.firestore.GeoPoint(lat, long)
              }).then((docRef)=>{
                  return console.log(docRef)
              }).catch((err)=>{
                  throw console.log(err)
              })
  
              res.status(200).json({
                  message: 'Data sent!'
              })
   
       }else{
           res.status(500).json({
               message:'Invalid Request'
           })
       }
  
      })
  
  })

  

  exports.getData = functions.https.onRequest((req, res)=>{

    cors(req, res, ()=>{  

        if(req.method === 'POST'){

            var radius = Number(req.body.radius)   //gets user/pre defined radius of Refion Of Interest
            var userLat = Number(req.body.userLat)  //get user's latitiude
            var userLong = Number(req.body.userLong) //gets user's longtitiude
            // Query the collection with set parameters:
            var query = geoCollection.near({ center: new admin.firestore.GeoPoint(userLat, userLong), radius: radius });

            query.get().then((snap)=>{ 
                
                const docs = snap.docs.map((doc)=>{
                    doc['data'] = doc['data']();  
                    return doc;  //returns the list of documents fullfilling query criteria
                })
                return res.status(200).send({ docs });
            }).catch((err)=>{
                throw res.send(err)
            })

        }else{
            res.status(500).json({
                message: 'Invalid Request'
            })
        }
    })
})


